import type { NormalizedItem } from "./types";

/**
 * ChemRxiv (Cambridge Open Engage) public API. This is the single
 * highest-priority source to get working — preprints here are typically
 * the fastest way to detect new relevant work, ahead of formal journal
 * publication.
 *
 * KNOWN ISSUE (flagged during implementation, not yet resolved): a plain
 * server-side fetch to this endpoint from this environment returned a
 * Cloudflare bot-challenge page (HTTP 403, "Just a moment...") instead of
 * JSON, even though the endpoint itself is documented and public
 * (https://chemrxiv.org/engage/chemrxiv/public-api/docs). This must be
 * re-verified live from the actual Vercel deployment before relying on it —
 * see the `chemrxiv_api` entry in lib/ingest/sources.ts for suggested next
 * steps if it's still blocked there.
 */
interface ChemrxivItem {
  item: {
    id: string;
    doi: string | null;
    title: string;
    abstract: string;
    authors: { firstName: string; lastName: string }[];
    publishedDate: string;
  };
}

interface ChemrxivResponse {
  itemHits: ChemrxivItem[];
}

export async function searchChemrxiv(term: string, sinceDate: Date, limit = 20): Promise<NormalizedItem[]> {
  const url = new URL("https://chemrxiv.org/engage/chemrxiv/public-api/v1/items");
  url.searchParams.set("term", term);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort", "PUBLISHED_DATE_DESC");

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; chem-news/1.0; +mailto:eric@powerhouse-ventures.co)",
    },
  });
  if (!res.ok) {
    throw new Error(
      `ChemRxiv request failed: ${res.status} ${res.statusText}. This endpoint was Cloudflare-blocked ` +
        `during implementation — verify live from the deployment before assuming this is a code bug.`,
    );
  }
  const json = (await res.json()) as ChemrxivResponse;

  return json.itemHits
    .map((hit) => hit.item)
    .filter((item) => new Date(item.publishedDate) >= sinceDate)
    .map(
      (item): NormalizedItem => ({
        externalId: item.doi ?? item.id,
        doi: item.doi,
        title: item.title.trim(),
        authors: item.authors.map((a) => `${a.firstName} ${a.lastName}`.trim()),
        abstract: item.abstract?.trim() || null,
        journal: "ChemRxiv (preprint)",
        url: item.doi ? `https://doi.org/${item.doi}` : `https://chemrxiv.org/engage/chemrxiv/article-details/${item.id}`,
        publishedAt: new Date(item.publishedDate),
        rawPayload: item,
      }),
    );
}
