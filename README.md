# Chem Digest

A backend-only service (no web dashboard) that watches chemistry preprints,
journal "just accepted" feeds, and news, scores relevance per recipient with
Claude, and emails a digest to Peter Zhang and James Zhang every **Sunday
and Wednesday**. See `.claude/plans/` (or ask Eric) for the original design
plan this was built from.

## How it works

Four Vercel Cron jobs (`vercel.json`):

| Route | Schedule | Does |
|---|---|---|
| `/api/cron/ingest` | every 2 hours | Polls enabled journal RSS/Atom feeds, normalizes + dedupes into `raw_items` |
| `/api/cron/ingest-supplementary` | daily | ChemRxiv/CrossRef/PubMed, queried per-profile using each person's Tier-1 taxonomy terms |
| `/api/cron/score` | daily | Cheap keyword pre-filter, then a two-pass Claude pipeline (extract grounded claims + band → verify quotes against source text → write prose) per profile |
| `/api/cron/send-digest` | Sun & Wed | Composes + sends each profile's email via Resend, covering everything accumulated since their last successful send |

Data model: `lib/db/schema.ts` (Drizzle). Per-profile config: `config/profiles.ts` + `taxonomy/*.yaml`. Prompts: `prompts/*.md`.

## First-time setup

1. **Install dependencies**: `npm install`
2. **Provision Postgres** — [Neon](https://neon.tech) recommended (generous free tier, serverless-friendly pooling). Copy its **pooled** connection string.
3. **Copy `.env.example` to `.env.local`** and fill in:
   - `DATABASE_URL` — from step 2
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
   - `RESEND_API_KEY` — from [resend.com](https://resend.com) (free tier is plenty for 2 recipients twice a week)
   - `DIGEST_FROM_ADDRESS` — pick a sending domain and verify it in Resend (SPF/DKIM/DMARC) before going live; low-volume trusted-content email like this is exactly what spam filters scrutinize, so don't skip verification
   - `PETER_ZHANG_EMAIL` / `JAMES_ZHANG_EMAIL` — leave pointed at your own email first (see "Testing before going live" below)
   - `CRON_SECRET` — any long random string
4. **Run the schema migration**: `npm run db:push`
5. **Seed sources + profiles**: `npm run db:seed`
6. **Sanity-check the pre-filter** (no API keys, no DB needed): `npm run test:prefilter`

Two more no-cost verification scripts, useful any time you touch ingestion or
email content without wanting to spend an Anthropic/Resend call:

- `npx tsx scripts/test-live-adapters.ts` — runs the real RSS/CrossRef/PubMed
  adapter code against the live sources and prints what came back. No DB, no
  API keys.
- `npx tsx scripts/preview-email.ts` — renders both profiles' digest emails
  (plus the "quiet stretch" fallback) from synthetic sample data and writes
  HTML files to `/tmp` for a visual check. No DB, no API keys, no send.

## Testing before going live

Point `PETER_ZHANG_EMAIL` and `JAMES_ZHANG_EMAIL` at your own address first
and manually trigger each cron route locally to confirm the pipeline works
end to end before switching to the real recipients:

```bash
npm run dev
# in another terminal, with CRON_SECRET matching .env.local:
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/ingest
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/ingest-supplementary
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/score
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/send-digest
```

Run `ingest`/`ingest-supplementary` a couple of times over a day or two so
`raw_items` actually has content before expecting `score` to find candidates.
Check the email lands in your inbox (not spam) and reads well before
pointing the two env vars at the real recipients.

## Deploying

Push to a Git repo Vercel is connected to, add all the env vars above in the
Vercel project settings, and deploy.

**Vercel plan note:** the 2-hourly `ingest` cron needs a paid Vercel plan —
the free Hobby tier limits cron jobs to once/day. If staying on Hobby is a
hard requirement, drop `/api/cron/ingest` to once daily and accept a bigger
latency hit on "first to know" for the RSS-fed journals.

## Known gaps to resolve

- **ACS (JACS, ACS Catalysis) and RSC (Chemical Science) RSS feeds, and the
  ChemRxiv API, are all disabled in `lib/ingest/sources.ts`.** A plain
  server-side fetch to each returned a Cloudflare bot-challenge (403) during
  implementation instead of feed content — this needs to be re-verified live
  from the actual Vercel deployment (a different IP/environment may fare
  differently) before flipping `enabled: true`. **ChemRxiv is the highest
  priority to unblock** — preprints there are typically the fastest source
  for "first to know." See the `note` field on each disabled entry for
  specifics and suggested next steps.
- **C&EN (chemistry news) feed URL is unresolved** — the common guesses
  404'd. Lowest priority since it's a supplementary news source, not primary
  paper detection.
- **Competing-lab "watch lists"** in `taxonomy/peter.yaml` and
  `taxonomy/james.yaml` are a first-pass draft assembled from public
  literature, not confirmed by Peter or James — review with them directly
  before trusting the "scoop risk" flags that depend on these lists.
- **Preprint → journal-article linking** (`lib/ingest/dedupe.ts`,
  `linkSupersededPreprint`) matches on exact normalized-title equality, not
  true fuzzy similarity — fine for identical titles carried through to
  publication, but will miss a title that changed during review.
