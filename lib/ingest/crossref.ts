import type { NormalizedItem } from "./types";

const CROSSREF_MAILTO = process.env.CROSSREF_MAILTO || "eric@powerhouse-ventures.co";

interface CrossrefWork {
  DOI: string;
  title?: string[];
  author?: { given?: string; family?: string }[];
  abstract?: string;
  "container-title"?: string[];
  published?: { "date-parts"?: number[][] };
  URL?: string;
}

function stripJatsTags(abstract: string | undefined): string | null {
  if (!abstract) return null;
  return abstract.replace(/<\/?jats:[^>]+>/g, "").trim() || null;
}

function datePartsToDate(dateParts: number[][] | undefined): Date | null {
  const parts = dateParts?.[0];
  if (!parts) return null;
  const [y, m = 1, d = 1] = parts;
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * CrossRef is used two ways: (1) a supplementary discovery pass — bibliographic
 * search scoped to a since-date, used here — and (2) DOI-based metadata lookup
 * for preprint -> journal-article linking (see lib/ingest/dedupe.ts). Free API,
 * no key; the `mailto` param opts into CrossRef's "polite pool" for better
 * rate limits, per their usage guidelines.
 */
export async function searchCrossref(query: string, sinceDate: Date, rows = 20): Promise<NormalizedItem[]> {
  const since = sinceDate.toISOString().slice(0, 10);
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query.bibliographic", query);
  url.searchParams.set("filter", `from-pub-date:${since}`);
  url.searchParams.set("rows", String(rows));
  url.searchParams.set("mailto", CROSSREF_MAILTO);

  const res = await fetch(url, { headers: { "User-Agent": `chem-news/1.0 (mailto:${CROSSREF_MAILTO})` } });
  if (!res.ok) {
    throw new Error(`CrossRef request failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { message: { items: CrossrefWork[] } };

  return json.message.items.map((work): NormalizedItem => {
    const authors =
      work.author?.map((a) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean) ?? null;

    return {
      externalId: work.DOI,
      doi: work.DOI,
      title: work.title?.[0]?.trim() ?? "(untitled)",
      authors: authors && authors.length > 0 ? authors : null,
      abstract: stripJatsTags(work.abstract),
      journal: work["container-title"]?.[0] ?? null,
      url: work.URL ?? `https://doi.org/${work.DOI}`,
      publishedAt: datePartsToDate(work.published?.["date-parts"]),
      rawPayload: work,
    };
  });
}

/** DOI-based metadata lookup, used for preprint -> journal-article linking. */
export async function lookupCrossrefByDoi(doi: string): Promise<CrossrefWork | null> {
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${CROSSREF_MAILTO}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CrossRef DOI lookup failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { message: CrossrefWork };
  return json.message;
}
