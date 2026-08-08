import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rawItems, sources } from "@/lib/db/schema";
import type { NormalizedItem } from "./types";

/**
 * Inserts a normalized item, deduped on (source, external_id). If the row
 * already exists, just bump fetched_at (cheap "still around" signal) rather
 * than erroring — sources get re-polled on overlapping windows by design.
 * Returns the row id whether it was newly inserted or already present.
 */
export async function upsertRawItem(sourceId: number, item: NormalizedItem): Promise<number> {
  const [row] = await db
    .insert(rawItems)
    .values({
      sourceId,
      externalId: item.externalId,
      doi: item.doi,
      title: item.title,
      authors: item.authors,
      abstract: item.abstract,
      journal: item.journal,
      url: item.url,
      publishedAt: item.publishedAt,
      rawPayload: item.rawPayload as object,
    })
    .onConflictDoUpdate({
      target: [rawItems.sourceId, rawItems.externalId],
      set: { fetchedAt: sql`now()` },
    })
    .returning({ id: rawItems.id });

  return row.id;
}

export async function getSourceIdByName(name: string): Promise<number> {
  const [row] = await db.select({ id: sources.id }).from(sources).where(eq(sources.name, name));
  if (!row) throw new Error(`Source not found in DB: ${name} — run scripts/seed-sources.ts first`);
  return row.id;
}

/**
 * Best-effort preprint -> journal-article linking: given a newly-ingested
 * journal article, look for an earlier ChemRxiv preprint row with a closely
 * matching normalized title, and mark it as superseded rather than let both
 * appear as separate "new" items in the digest.
 *
 * v1 simplification: this matches on exact normalized-title equality, not
 * true fuzzy (trigram/Levenshtein) similarity — good enough for identical
 * titles carried over from preprint to publication, but will miss cases
 * where the title changed during review. Revisit if that turns out common.
 */
export async function linkSupersededPreprint(newItemId: number, newTitle: string, newDoi: string | null) {
  if (!newDoi) return; // only attempt linking once the journal DOI is known

  const normalizedTitle = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  const candidates = await db
    .select({ id: rawItems.id, title: rawItems.title, doi: rawItems.doi })
    .from(rawItems)
    .innerJoin(sources, eq(rawItems.sourceId, sources.id))
    .where(and(eq(sources.name, "chemrxiv_api"), sql`${rawItems.supersededBy} is null`));

  for (const candidate of candidates) {
    if (candidate.doi === newDoi) continue; // same record, not a preprint
    const candidateNormalized = candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (candidateNormalized === normalizedTitle) {
      await db.update(rawItems).set({ supersededBy: newItemId }).where(eq(rawItems.id, candidate.id));
      return;
    }
  }
}
