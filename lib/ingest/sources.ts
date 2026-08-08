/**
 * Static registry of ingestion sources. This seeds the `sources` DB table
 * (see scripts/seed-sources.ts) and drives the ingest cron route.
 *
 * IMPORTANT — verified vs. unverified feeds:
 * Every URL below marked `enabled: true` was live-checked (fetched + parsed
 * with rss-parser) during implementation and confirmed to return real
 * RSS/Atom content. Entries marked `enabled: false` are known-good targets
 * in principle, but the exact endpoint could not be verified from this
 * environment because the publisher fronts the URL with a Cloudflare bot
 * challenge (a plain server-side fetch gets a "Just a moment..." HTML page,
 * HTTP 403, instead of feed content). Do NOT flip these to enabled without
 * re-verifying live from the actual deployment (Vercel's IPs / a real
 * browser session may or may not fare differently) — see the `note` field
 * on each for the specific blocker and what to try next.
 */

export type SourceType = "rss" | "json_api";

export interface SourceDef {
  name: string;
  type: SourceType;
  url: string;
  pollFreqMin: number;
  enabled: boolean;
  journal: string | null;
  note?: string;
}

export const sourceRegistry: SourceDef[] = [
  // --- Verified RSS feeds (confirmed live during implementation) ---
  {
    name: "nature_chemistry_rss",
    type: "rss",
    url: "https://www.nature.com/nchem.rss",
    pollFreqMin: 120,
    enabled: true,
    journal: "Nature Chemistry",
  },
  {
    name: "nature_catalysis_rss",
    type: "rss",
    url: "https://www.nature.com/natcatal.rss",
    pollFreqMin: 120,
    enabled: true,
    journal: "Nature Catalysis",
  },
  {
    name: "nature_synthesis_rss",
    type: "rss",
    url: "https://www.nature.com/natsynth.rss",
    pollFreqMin: 120,
    enabled: true,
    journal: "Nature Synthesis",
  },
  {
    name: "angewandte_chemie_ie_rss",
    type: "rss",
    url: "https://onlinelibrary.wiley.com/feed/15213773/most-recent",
    pollFreqMin: 120,
    enabled: true,
    journal: "Angewandte Chemie International Edition",
  },
  {
    name: "science_rss",
    type: "rss",
    url: "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science",
    pollFreqMin: 120,
    enabled: true,
    journal: "Science",
  },

  // --- Known targets, blocked by a Cloudflare challenge from this environment ---
  // Confirm from the actual Vercel deployment; if still blocked, options are:
  // (a) a realistic browser User-Agent/Accept header may be enough for some
  //     of these (Cloudflare's "I'm Under Attack"/bot-fight modes vary by
  //     site config), (b) check pubs.acs.org/page/follow.html and
  //     pubs.rsc.org/en/ealerts/rssfeed by hand in a browser for the current
  //     per-journal feed URL (these pages sometimes require being logged in
  //     or clicking through to reveal the actual feed link), or (c) fall
  //     back to CrossRef's `filter=from-created-date` polling against these
  //     journals' ISSNs as a slower substitute for a direct feed.
  {
    name: "jacs_rss",
    type: "rss",
    url: "https://pubs.acs.org/action/showFeed?type=etoc&feed=rss&jc=jacsat",
    pollFreqMin: 120,
    enabled: false,
    journal: "Journal of the American Chemical Society",
    note: "ACS fronts this with a Cloudflare challenge (403 'Just a moment...') from a plain server fetch. Verify live from Vercel; may need a browser-like User-Agent or a different feed path from pubs.acs.org/page/follow.html.",
  },
  {
    name: "acs_catalysis_rss",
    type: "rss",
    url: "https://pubs.acs.org/action/showFeed?type=etoc&feed=rss&jc=accacs",
    pollFreqMin: 120,
    enabled: false,
    journal: "ACS Catalysis",
    note: "Same Cloudflare-challenge blocker as jacs_rss — verify live before enabling.",
  },
  {
    name: "chemical_science_rss",
    type: "rss",
    url: "https://pubs.rsc.org/en/results/rss/latestarticles?RSS_JournalCode=SC",
    pollFreqMin: 120,
    enabled: false,
    journal: "Chemical Science",
    note: "RSC (pubs.rsc.org) also returns a Cloudflare 403 on this guessed URL from this environment. Confirm the exact feed path at pubs.rsc.org/en/ealerts/rssfeed and re-verify live.",
  },
  {
    name: "chemrxiv_api",
    type: "json_api",
    url: "https://chemrxiv.org/engage/chemrxiv/public-api/v1/items",
    pollFreqMin: 120,
    enabled: false,
    journal: null,
    note: "ChemRxiv's Cambridge Open Engage API is also behind a Cloudflare challenge from this environment (403 on a plain fetch), even though the endpoint itself is documented and public. This is the single highest-priority source to unblock — it's typically the fastest preprint source for both profiles' subfields. Verify live from Vercel first (server IPs sometimes aren't challenged the way this sandbox was); if still blocked, check https://chemrxiv.org/engage/chemrxiv/public-api/docs for an API-key-based access tier.",
  },
  {
    name: "cen_rss",
    type: "rss",
    url: "https://cen.acs.org/content/cen/en/rss.html", // unverified guess — see note
    pollFreqMin: 720,
    enabled: false,
    journal: null,
    note: "Chemical & Engineering News restructured their site; none of the common feed URL guesses (feeds/most-recent.rss, rss.html) resolved during implementation. Find the current feed link by hand on cen.acs.org before enabling — lowest priority since it's a supplementary news source, not primary paper detection.",
  },

  // --- Supplementary, non-RSS sources (slower, used as a backstop pass) ---
  {
    name: "crossref",
    type: "json_api",
    url: "https://api.crossref.org/works",
    pollFreqMin: 1440,
    enabled: true,
    journal: null,
  },
  {
    name: "pubmed",
    type: "json_api",
    url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
    pollFreqMin: 1440,
    enabled: true,
    journal: null,
  },
];
