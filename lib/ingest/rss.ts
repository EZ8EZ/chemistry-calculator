import Parser from "rss-parser";
import type { SourceDef } from "./sources";
import type { NormalizedItem } from "./types";

const parser = new Parser({
  customFields: {
    item: [["dc:creator", "dcCreator"]],
  },
});

/** Extracts a DOI from a URL like https://doi.org/10.1002/anie.202400000 or an ACS/Wiley article URL, if present. */
function extractDoiFromUrl(url: string): string | null {
  const match = url.match(/10\.\d{4,9}\/[^\s"'?&#]+/);
  return match ? match[0] : null;
}

/**
 * Nature article URLs (nature.com/articles/{id}) don't embed the DOI
 * directly, but Nature's DOI convention is stable: 10.1038/{id}, where {id}
 * is exactly the URL slug (confirmed against live feeds during
 * implementation). Wiley/ACS/Science already carry the DOI in the URL and
 * are handled by extractDoiFromUrl above.
 */
function extractNatureDoi(url: string): string | null {
  const match = url.match(/nature\.com\/articles\/([a-z0-9-]+)/i);
  return match ? `10.1038/${match[1]}` : null;
}

function splitAuthors(dcCreator: string | undefined): string[] | null {
  if (!dcCreator) return null;
  return dcCreator
    .split(/;|,(?!\s?(?:Jr|Sr|III)\.)/)
    .map((a) => a.trim())
    .filter(Boolean);
}

export async function fetchRssSource(source: SourceDef): Promise<NormalizedItem[]> {
  const feed = await parser.parseURL(source.url);

  return feed.items.map((item): NormalizedItem => {
    const link = item.link ?? "";
    const doi = extractDoiFromUrl(link) ?? extractNatureDoi(link);
    const abstract =
      (item as { contentSnippet?: string; content?: string })["contentSnippet"] ||
      (item as unknown as { "content:encodedSnippet"?: string })["content:encodedSnippet"] ||
      item.content ||
      null;

    const publishedRaw = item.isoDate || item.pubDate || (item as { date?: string }).date;

    return {
      externalId: doi ?? link ?? item.guid ?? item.title ?? crypto.randomUUID(),
      doi,
      title: item.title?.trim() ?? "(untitled)",
      authors: splitAuthors((item as { dcCreator?: string }).dcCreator),
      abstract: abstract && abstract.trim().length > 0 ? abstract.trim() : null,
      journal: source.journal,
      url: link,
      publishedAt: publishedRaw ? new Date(publishedRaw) : null,
      rawPayload: item,
    };
  });
}
