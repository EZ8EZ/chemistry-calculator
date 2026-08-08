import { XMLParser } from "fast-xml-parser";
import type { NormalizedItem } from "./types";

const NCBI_API_KEY = process.env.NCBI_API_KEY; // optional, raises rate limits

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

interface EsearchResponse {
  esearchresult: { idlist: string[] };
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * PubMed's ArticleTitle/AbstractText fields can contain embedded inline
 * markup (<i>, <sup>, Greek letters, etc.), so PubMed double-escapes them
 * in the source XML. After one pass of XML parsing this leaves literal
 * entity text behind (e.g. "&#x3b1;" instead of "α") — decode that
 * remaining layer here rather than showing raw entities to the recipient.
 */
function decodeEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function withApiKey(url: URL): URL {
  if (NCBI_API_KEY) url.searchParams.set("api_key", NCBI_API_KEY);
  return url;
}

/**
 * PubMed's query syntax treats ( ) [ ] as boolean-grouping/field-tag
 * operators, not literal characters — a taxonomy term like "cobalt(II)
 * porphyrin catalysis" (valid free text everywhere else) parses as invalid
 * boolean syntax and esearch returns a 500. Strip them for a plain
 * free-text/keyword search rather than attempting real boolean queries here.
 */
function sanitizeForPubmedQuery(term: string): string {
  return term.replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * PubMed is a supplementary/backstop source only — indexing typically lags
 * days to weeks behind publication, so it should never be relied on for
 * "first to know." Two-step E-utilities call: esearch for matching PMIDs,
 * then efetch for the full records (title/abstract/authors/journal/DOI).
 */
export async function searchPubmed(query: string, sinceDate: Date, retmax = 20): Promise<NormalizedItem[]> {
  const mindate = sinceDate.toISOString().slice(0, 10).replace(/-/g, "/");
  const maxdate = new Date().toISOString().slice(0, 10).replace(/-/g, "/");

  const esearchUrl = withApiKey(new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"));
  esearchUrl.searchParams.set("db", "pubmed");
  esearchUrl.searchParams.set("term", sanitizeForPubmedQuery(query));
  esearchUrl.searchParams.set("retmode", "json");
  esearchUrl.searchParams.set("datetype", "pdat");
  esearchUrl.searchParams.set("mindate", mindate);
  esearchUrl.searchParams.set("maxdate", maxdate);
  esearchUrl.searchParams.set("retmax", String(retmax));

  const esearchRes = await fetch(esearchUrl);
  if (!esearchRes.ok) throw new Error(`PubMed esearch failed: ${esearchRes.status}`);
  const esearchJson = (await esearchRes.json()) as EsearchResponse;
  const ids = esearchJson.esearchresult.idlist;
  if (ids.length === 0) return [];

  const efetchUrl = withApiKey(new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"));
  efetchUrl.searchParams.set("db", "pubmed");
  efetchUrl.searchParams.set("id", ids.join(","));
  efetchUrl.searchParams.set("rettype", "abstract");
  efetchUrl.searchParams.set("retmode", "xml");

  const efetchRes = await fetch(efetchUrl);
  if (!efetchRes.ok) throw new Error(`PubMed efetch failed: ${efetchRes.status}`);
  const xml = await efetchRes.text();
  const parsed = xmlParser.parse(xml);

  const articles = asArray(parsed?.PubmedArticleSet?.PubmedArticle);

  return articles.map((article): NormalizedItem => {
    const medlineCitation = article.MedlineCitation;
    const articleNode = medlineCitation?.Article;
    const pmid =
      typeof medlineCitation?.PMID === "object" ? medlineCitation.PMID["#text"] : medlineCitation?.PMID;

    const abstractParts = asArray(articleNode?.Abstract?.AbstractText).map((p) =>
      decodeEntities(typeof p === "string" ? p : p?.["#text"] ?? ""),
    );

    const authorList = asArray(articleNode?.AuthorList?.Author).map((a) =>
      [a?.ForeName, a?.LastName].filter(Boolean).join(" "),
    );

    const doiEntry = asArray(article?.PubmedData?.ArticleIdList?.ArticleId).find(
      (id) => id?.["@_IdType"] === "doi",
    );
    const doi = doiEntry ? (typeof doiEntry === "string" ? doiEntry : doiEntry["#text"]) : null;

    const pubDate = articleNode?.Journal?.JournalIssue?.PubDate;
    const year = pubDate?.Year ?? pubDate?.MedlineDate?.slice(0, 4);
    const publishedAt = year ? new Date(Date.UTC(Number(year), 0, 1)) : null;

    return {
      externalId: doi ?? `pmid:${pmid}`,
      doi: doi ?? null,
      title: decodeEntities(articleNode?.ArticleTitle?.["#text"] ?? articleNode?.ArticleTitle ?? "(untitled)"),
      authors: authorList.length > 0 ? authorList : null,
      abstract: abstractParts.length > 0 ? abstractParts.join("\n\n") : null,
      journal: articleNode?.Journal?.Title ?? null,
      url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      publishedAt,
      rawPayload: article,
    };
  });
}
