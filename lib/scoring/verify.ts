export interface ExtractedClaim {
  text: string;
  supporting_quote: string;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[""'']/g, "'").trim();
}

/**
 * Deterministic anti-hallucination check (see prompts/item_writeup.md):
 * a claim only survives if its supporting_quote is actually locatable in
 * the source abstract, normalized for whitespace/quote-character
 * differences. This is intentionally a substring check, not semantic
 * similarity — the point is to catch quotes the model invented outright,
 * not to grade paraphrase quality.
 */
export function verifyClaims(abstract: string | null, claims: ExtractedClaim[]): ExtractedClaim[] {
  if (!abstract) return []; // no source text at all -> nothing can be verified
  const haystack = normalize(abstract);
  return claims.filter((c) => {
    const quote = normalize(c.supporting_quote);
    return quote.length > 0 && haystack.includes(quote);
  });
}
