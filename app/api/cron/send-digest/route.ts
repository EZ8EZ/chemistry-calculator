import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { rawItems, itemScores, sentDigests, digestItems, profiles as profilesTable } from "@/lib/db/schema";
import { requireCronSecret } from "@/lib/cronAuth";
import { profiles as profileConfigs } from "@/config/profiles";
import { renderDigestEmail, type DigestItem } from "@/lib/email/render";
import { sendDigestEmail } from "@/lib/email/send";

export const maxDuration = 60;

const sinceFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

/**
 * Sends each profile's digest. Scheduled Sunday and Wednesday only (see
 * vercel.json) — NOT daily. Always sends on schedule, even with zero
 * relevant items, with an honest "quiet stretch" message (see
 * lib/email/render.ts) rather than skipping silently, since a skipped send
 * would look like the service is broken.
 *
 * Items are queried as "not yet included in any digest" rather than
 * "from the last N hours" — that's what makes the Sun/Wed cadence work
 * correctly: whatever accumulated since the last successful send (could be
 * 3 or 4 days of ingestion) is exactly what goes out, and anything cut for
 * being over a section's display cap rolls over to the next send instead
 * of being marked sent.
 */
export async function GET(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const dbProfiles = await db.select().from(profilesTable);
  const results: { profile: string; itemCount: number; status: string; error?: string }[] = [];

  for (const profileConfig of profileConfigs) {
    const dbProfile = dbProfiles.find((p) => p.slug === profileConfig.slug);
    if (!dbProfile) {
      results.push({ profile: profileConfig.slug, itemCount: 0, status: "failed", error: "profile not seeded in DB" });
      continue;
    }
    if (!dbProfile.email) {
      results.push({ profile: profileConfig.slug, itemCount: 0, status: "failed", error: "no email configured" });
      continue;
    }

    try {
      const [lastSent] = await db
        .select({ sentAt: sentDigests.sentAt })
        .from(sentDigests)
        .where(and(eq(sentDigests.profileId, dbProfile.id), eq(sentDigests.status, "sent")))
        .orderBy(desc(sentDigests.sentAt))
        .limit(1);

      const sinceLabel = lastSent ? `since ${sinceFormatter.format(lastSent.sentAt)}` : "in the last few days";

      const rows = await db
        .select({
          itemScoreId: itemScores.id,
          band: itemScores.band,
          summary: itemScores.summary,
          title: rawItems.title,
          journal: rawItems.journal,
          authors: rawItems.authors,
          url: rawItems.url,
          doi: rawItems.doi,
        })
        .from(itemScores)
        .innerJoin(rawItems, eq(itemScores.rawItemId, rawItems.id))
        .where(and(eq(itemScores.profileId, dbProfile.id), eq(itemScores.includedInDigest, false)))
        .orderBy(itemScores.band, desc(itemScores.relevance));

      const digestItemsInput: DigestItem[] = rows.map((r) => ({
        itemScoreId: r.itemScoreId,
        band: r.band as "A" | "B" | "C",
        title: r.title,
        journal: r.journal,
        authors: r.authors,
        url: r.url,
        doi: r.doi,
        summary: (r.summary ?? {}) as DigestItem["summary"],
      }));

      const rendered = renderDigestEmail(profileConfig, sinceLabel, digestItemsInput);
      const emailProviderId = await sendDigestEmail(dbProfile.email, rendered);

      const [sentRow] = await db
        .insert(sentDigests)
        .values({
          profileId: dbProfile.id,
          itemCount: rendered.includedItemScoreIds.length,
          emailProviderId,
          status: "sent",
        })
        .returning({ id: sentDigests.id });

      if (rendered.includedItemScoreIds.length > 0) {
        await db.insert(digestItems).values(
          rendered.includedItemScoreIds.map((itemScoreId) => ({ digestId: sentRow.id, itemScoreId })),
        );
        await db
          .update(itemScores)
          .set({ includedInDigest: true })
          .where(inArray(itemScores.id, rendered.includedItemScoreIds));
      }

      results.push({ profile: profileConfig.slug, itemCount: rendered.includedItemScoreIds.length, status: "sent" });
    } catch (err) {
      const message = (err as Error).message;
      await db.insert(sentDigests).values({
        profileId: dbProfile.id,
        itemCount: 0,
        status: "failed",
        errorDetail: message,
      });
      results.push({ profile: profileConfig.slug, itemCount: 0, status: "failed", error: message });
    }
  }

  return NextResponse.json({ ok: true, results });
}
