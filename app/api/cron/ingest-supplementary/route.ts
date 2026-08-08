import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import { requireCronSecret } from "@/lib/cronAuth";
import { searchChemrxiv } from "@/lib/ingest/chemrxiv";
import { searchCrossref } from "@/lib/ingest/crossref";
import { searchPubmed } from "@/lib/ingest/pubmed";
import { upsertRawItem, linkSupersededPreprint } from "@/lib/ingest/dedupe";
import { profiles } from "@/config/profiles";
import { loadTaxonomy } from "@/lib/taxonomy";

export const maxDuration = 90;

const LOOKBACK_DAYS = 3; // runs daily; overlap guards against a slow/missed run
const QUERIES_PER_PROFILE = 5; // cap query volume — top Tier-1 terms only

/**
 * Supplementary, query-driven discovery pass (daily): ChemRxiv (preprints —
 * highest priority once its Cloudflare-block is resolved, see
 * lib/ingest/chemrxiv.ts), CrossRef (secondary discovery + dedup backbone),
 * and PubMed (slow backstop, never "first to know"). Each is queried once
 * per profile using that profile's top Tier-1 taxonomy terms, since these
 * sources are searched rather than subscribed-to like the RSS feeds in
 * /api/cron/ingest.
 */
export async function GET(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const sinceDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const dbSourcesByName = new Map(
    (await db.select().from(sources)).map((s) => [s.name, s] as const),
  );

  const results: { profile: string; source: string; inserted: number; error?: string }[] = [];

  for (const profile of profiles) {
    const taxonomy = loadTaxonomy(profile.taxonomyPath);
    const queries = taxonomy.tier_1_must_not_miss.slice(0, QUERIES_PER_PROFILE);

    const runners: { name: string; fn: (q: string, since: Date) => Promise<import("@/lib/ingest/types").NormalizedItem[]> }[] = [
      { name: "chemrxiv_api", fn: searchChemrxiv },
      { name: "crossref", fn: searchCrossref },
      { name: "pubmed", fn: searchPubmed },
    ];

    for (const runner of runners) {
      const dbSource = dbSourcesByName.get(runner.name);
      if (!dbSource || !dbSource.enabled) continue;

      let inserted = 0;
      try {
        for (const query of queries) {
          const items = await runner.fn(query, sinceDate);
          for (const item of items) {
            const rowId = await upsertRawItem(dbSource.id, item);
            if (item.doi) {
              await linkSupersededPreprint(rowId, item.title, item.doi);
            }
            inserted++;
          }
        }
        await db.update(sources).set({ lastPolledAt: new Date() }).where(eq(sources.id, dbSource.id));
        results.push({ profile: profile.slug, source: runner.name, inserted });
      } catch (err) {
        results.push({ profile: profile.slug, source: runner.name, inserted, error: (err as Error).message });
      }
    }
  }

  return NextResponse.json({ ok: true, results });
}
