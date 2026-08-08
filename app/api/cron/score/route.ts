import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { rawItems, itemScores, profiles as profilesTable } from "@/lib/db/schema";
import { requireCronSecret } from "@/lib/cronAuth";
import { profiles as profileConfigs } from "@/config/profiles";
import { loadTaxonomy } from "@/lib/taxonomy";
import { prefilterItem } from "@/lib/scoring/prefilter";
import { extractAndScoreItems, writeUpItems, type CandidateItem } from "@/lib/scoring/claude";
import { verifyClaims } from "@/lib/scoring/verify";

export const maxDuration = 120;

const LOOKBACK_DAYS = 10; // generous window; items already scored are excluded regardless
const BAND_RELEVANCE = { A: 90, B: 60, C: 30 } as const;

/**
 * Daily scoring pass: for each profile, pre-filter unscored raw_items down
 * to a bounded candidate set, then run the two-pass Claude pipeline
 * (extract+score grounded claims -> deterministic quote verification ->
 * prose write-up from verified claims only). Items with zero verified
 * claims are dropped rather than sent with an unverifiable write-up — see
 * prompts/item_writeup.md for the full anti-hallucination design.
 *
 * Runs daily even though digests only send Sun/Wed (see send-digest route)
 * so item_scores stays populated incrementally rather than batching a
 * multi-day backlog into one huge Claude call right before send time.
 */
export async function GET(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const lookbackDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const dbProfiles = await db.select().from(profilesTable);
  const results: { profile: string; candidates: number; scored: number; error?: string }[] = [];

  for (const profileConfig of profileConfigs) {
    const dbProfile = dbProfiles.find((p) => p.slug === profileConfig.slug);
    if (!dbProfile) {
      results.push({ profile: profileConfig.slug, candidates: 0, scored: 0, error: "profile not seeded in DB" });
      continue;
    }

    let candidateCount = 0;
    try {
      const taxonomy = loadTaxonomy(profileConfig.taxonomyPath);

      const unscored = await db
        .select({
          id: rawItems.id,
          title: rawItems.title,
          authors: rawItems.authors,
          journal: rawItems.journal,
          abstract: rawItems.abstract,
          doi: rawItems.doi,
          url: rawItems.url,
        })
        .from(rawItems)
        .leftJoin(
          itemScores,
          and(eq(itemScores.rawItemId, rawItems.id), eq(itemScores.profileId, dbProfile.id)),
        )
        .where(
          and(
            isNull(itemScores.id),
            isNull(rawItems.supersededBy),
            gte(rawItems.fetchedAt, lookbackDate),
          ),
        );

      const candidates: CandidateItem[] = unscored.filter(
        (item) => prefilterItem({ title: item.title, abstract: item.abstract }, taxonomy).passed,
      );
      candidateCount = candidates.length;

      if (candidates.length === 0) {
        results.push({ profile: profileConfig.slug, candidates: 0, scored: 0 });
        continue;
      }

      const extracted = await extractAndScoreItems(profileConfig, taxonomy, candidates);
      const byId = new Map(unscored.map((c) => [c.id, c]));

      const survivors: {
        id: number;
        band: "A" | "B" | "C";
        verifiedClaims: { text: string; supporting_quote: string }[];
      }[] = [];

      for (const item of extracted) {
        if (item.band === "D") continue;
        const source = byId.get(item.id);
        const verified = verifyClaims(source?.abstract ?? null, item.claims);
        if (verified.length === 0) continue; // no verifiable grounding -> drop rather than guess
        survivors.push({ id: item.id, band: item.band, verifiedClaims: verified });
      }

      const needsWriteup = survivors.filter((s) => s.band === "A" || s.band === "B");
      const writeups = await writeUpItems(
        profileConfig,
        taxonomy,
        needsWriteup.map((s) => ({
          id: s.id,
          title: byId.get(s.id)!.title,
          journal: byId.get(s.id)!.journal,
          claims: s.verifiedClaims,
        })),
      );
      const writeupById = new Map(writeups.map((w) => [w.id, w]));

      let scored = 0;
      for (const survivor of survivors) {
        const writeup = writeupById.get(survivor.id);

        const summary =
          survivor.band === "C"
            ? {
                // Band C collapses to a 1-2 line entry built directly from the
                // top verified claim — no separate write-up call, per
                // prompts/item_writeup.md.
                hook: survivor.verifiedClaims[0].text,
              }
            : {
                hook: writeup?.hook,
                key_finding: writeup?.key_finding,
                mechanism_novelty: writeup?.mechanism_novelty,
                relation_to_work: writeup?.relation_to_work,
                competing_group_note: writeup?.competing_group_note ?? null,
                scoop_risk_flag: writeup?.scoop_risk_flag ?? null,
              };

        await db.insert(itemScores).values({
          rawItemId: survivor.id,
          profileId: dbProfile.id,
          band: survivor.band,
          relevance: BAND_RELEVANCE[survivor.band],
          summary,
          claudeRaw: { claims: survivor.verifiedClaims, writeup: writeup ?? null },
          includedInDigest: false,
        });
        scored++;
      }

      results.push({ profile: profileConfig.slug, candidates: candidates.length, scored });
    } catch (err) {
      results.push({
        profile: profileConfig.slug,
        candidates: candidateCount,
        scored: 0,
        error: (err as Error).message,
      });
    }
  }

  return NextResponse.json({ ok: true, results });
}
