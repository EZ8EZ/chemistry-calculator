import { fetchRssSource } from "@/lib/ingest/rss";
import { searchCrossref } from "@/lib/ingest/crossref";
import { searchPubmed } from "@/lib/ingest/pubmed";
import { sourceRegistry } from "@/lib/ingest/sources";

/**
 * Exercises the actual production adapter code (not ad hoc curl) against
 * live sources — no DB, no API keys needed. Confirms NormalizedItem shape
 * is populated sensibly end to end. Run with:
 *   npx tsx scripts/test-live-adapters.ts
 */
async function main() {
  console.log("=== RSS adapters (enabled sources only) ===\n");
  for (const source of sourceRegistry.filter((s) => s.type === "rss" && s.enabled)) {
    try {
      const items = await fetchRssSource(source);
      const sample = items[0];
      console.log(`${source.name}: ${items.length} items`);
      console.log(`  sample: "${sample.title}"`);
      console.log(`  doi=${sample.doi} journal=${sample.journal} published=${sample.publishedAt?.toISOString()}`);
      console.log(`  abstract present: ${!!sample.abstract} (${sample.abstract?.length ?? 0} chars)`);
      console.log(`  authors: ${JSON.stringify(sample.authors)}`);
    } catch (err) {
      console.log(`${source.name}: ERROR — ${(err as Error).message}`);
    }
    console.log();
  }

  console.log("=== CrossRef adapter ===\n");
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const items = await searchCrossref("metalloradical catalysis cobalt porphyrin", since, 3);
    console.log(`crossref: ${items.length} items`);
    for (const item of items) {
      console.log(`  - "${item.title}" (doi=${item.doi}, journal=${item.journal}, abstract=${item.abstract ? item.abstract.length + " chars" : "none"})`);
    }
  } catch (err) {
    console.log(`crossref: ERROR — ${(err as Error).message}`);
  }

  console.log("\n=== PubMed adapter ===\n");
  try {
    const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const items = await searchPubmed("directed evolution non-heme iron enzyme", since, 3);
    console.log(`pubmed: ${items.length} items`);
    for (const item of items) {
      console.log(`  - "${item.title}" (doi=${item.doi}, journal=${item.journal}, abstract=${item.abstract ? item.abstract.length + " chars" : "none"})`);
    }
  } catch (err) {
    console.log(`pubmed: ERROR — ${(err as Error).message}`);
  }
}

main();
