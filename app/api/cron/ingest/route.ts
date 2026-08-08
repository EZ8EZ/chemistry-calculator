import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import { requireCronSecret } from "@/lib/cronAuth";
import { fetchRssSource } from "@/lib/ingest/rss";
import { upsertRawItem, linkSupersededPreprint } from "@/lib/ingest/dedupe";
import type { SourceDef } from "@/lib/ingest/sources";

export const maxDuration = 60;

/**
 * Primary same-day detection pass: polls every *enabled* RSS source (the
 * verified journal "just accepted" feeds — see lib/ingest/sources.ts) every
 * ~2 hours. ChemRxiv/CrossRef/PubMed/C&EN are handled separately in
 * /api/cron/ingest-supplementary since those are query-driven per profile
 * rather than journal-wide feeds.
 */
export async function GET(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const dbSources = await db.select().from(sources).where(eq(sources.type, "rss"));
  const results: { source: string; inserted: number; error?: string }[] = [];

  for (const dbSource of dbSources) {
    if (!dbSource.enabled) continue;
    try {
      const sourceDef: SourceDef = {
        name: dbSource.name,
        type: "rss",
        url: dbSource.url,
        pollFreqMin: dbSource.pollFreqMin,
        enabled: dbSource.enabled,
        journal: dbSource.journal,
      };
      const items = await fetchRssSource(sourceDef);

      let inserted = 0;
      for (const item of items) {
        const rowId = await upsertRawItem(dbSource.id, item);
        if (item.doi) {
          await linkSupersededPreprint(rowId, item.title, item.doi);
        }
        inserted++;
      }

      await db.update(sources).set({ lastPolledAt: new Date() }).where(eq(sources.id, dbSource.id));
      results.push({ source: dbSource.name, inserted });
    } catch (err) {
      results.push({ source: dbSource.name, inserted: 0, error: (err as Error).message });
    }
  }

  return NextResponse.json({ ok: true, results });
}
