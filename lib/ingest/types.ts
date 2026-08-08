/** Common shape every source adapter normalizes into before dedup/insert. */
export interface NormalizedItem {
  externalId: string; // source-native ID: DOI preferred, else the item's URL/GUID
  doi: string | null;
  title: string;
  authors: string[] | null;
  abstract: string | null;
  journal: string | null;
  url: string;
  publishedAt: Date | null;
  rawPayload: unknown;
}
