import type { Taxonomy } from "@/lib/taxonomy";

export interface PrefilterMatch {
  passed: boolean;
  matchedTier: 1 | 2 | null;
  matchedTerms: string[];
}

const STOPWORDS = new Set([
  "a", "an", "the", "of", "for", "and", "or", "via", "with", "in", "on", "to",
  "as", "by", "at", "from", "into", "using", "based", "broadly", "generally",
]);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function significantWords(term: string): string[] {
  return normalize(term)
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Cheap, deterministic pre-filter run before any candidate is sent to
 * Claude for real scoring — keeps the daily Claude call bounded to a small,
 * plausibly-relevant set instead of every item from every feed. This is
 * intentionally generous (biased toward false positives, not false
 * negatives): a term "hits" if either its full normalized phrase appears in
 * the text, or at least 2 of its distinctive words both appear (order
 * independent) — since abstracts rarely use a taxonomy term's exact
 * phrasing verbatim. Final relevance judgment always happens downstream in
 * the Claude scoring pass (see prompts/relevance_scoring.md), never here.
 */
export function prefilterItem(
  item: { title: string; abstract: string | null },
  taxonomy: Taxonomy,
): PrefilterMatch {
  const haystack = normalize(`${item.title} ${item.abstract ?? ""}`);

  const checkTerms = (terms: string[]): string[] => {
    const hits: string[] = [];
    for (const term of terms) {
      const normalizedTerm = normalize(term);
      if (normalizedTerm.length > 0 && haystack.includes(normalizedTerm)) {
        hits.push(term);
        continue;
      }
      const words = significantWords(term);
      if (words.length >= 2) {
        const matchedWords = words.filter((w) => haystack.includes(w));
        if (matchedWords.length >= 2) hits.push(term);
      } else if (words.length === 1 && haystack.includes(words[0])) {
        // single distinctive word (e.g. an acronym like "LMCT") — exact only
        hits.push(term);
      }
    }
    return hits;
  };

  const tier1Hits = checkTerms(taxonomy.tier_1_must_not_miss);
  if (tier1Hits.length > 0) {
    return { passed: true, matchedTier: 1, matchedTerms: tier1Hits };
  }

  const tier2Hits = checkTerms(taxonomy.tier_2_broader_awareness);
  if (tier2Hits.length > 0) {
    return { passed: true, matchedTier: 2, matchedTerms: tier2Hits };
  }

  return { passed: false, matchedTier: null, matchedTerms: [] };
}
