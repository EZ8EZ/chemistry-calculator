import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'chemrxiv' | 'jacs_rss' | 'angewandte_rss' | 'crossref' | 'pubmed' | 'cen' | ...
  type: text("type").notNull(), // 'rss' | 'json_api'
  url: text("url").notNull(),
  journal: text("journal"), // null for non-journal-specific sources (chemrxiv, crossref, pubmed)
  pollFreqMin: integer("poll_freq_min").notNull().default(120),
  enabled: boolean("enabled").notNull().default(true),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
});

export const rawItems = pgTable(
  "raw_items",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id),
    externalId: text("external_id").notNull(), // source-native ID: DOI preferred, else source's own ID/URL
    doi: text("doi"),
    title: text("title").notNull(),
    authors: text("authors").array(),
    abstract: text("abstract"),
    journal: text("journal"),
    url: text("url").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    rawPayload: jsonb("raw_payload"),
    // preprint -> journal-article linking: points at the row this one was superseded by
    supersededBy: integer("superseded_by"),
  },
  (table) => [uniqueIndex("raw_items_source_external_idx").on(table.sourceId, table.externalId)],
);

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // 'peter_zhang' | 'james_zhang'
  name: text("name").notNull(),
  email: text("email").notNull(),
  configRef: text("config_ref"), // name of the matching entry in config/profiles.ts
});

export const itemScores = pgTable(
  "item_scores",
  {
    id: serial("id").primaryKey(),
    rawItemId: integer("raw_item_id")
      .notNull()
      .references(() => rawItems.id),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id),
    scoredAt: timestamp("scored_at", { withTimezone: true }).notNull().defaultNow(),
    band: text("band").notNull(), // 'A' | 'B' | 'C' | 'D' (Must-read / Relevant / Adjacent / Not relevant)
    relevance: integer("relevance"), // optional numeric score for ordering within a band
    summary: jsonb("summary"), // structured write-up fields per prompts/item_writeup.md
    claudeRaw: jsonb("claude_raw"), // full structured response, for debugging/audit
    includedInDigest: boolean("included_in_digest").notNull().default(false),
  },
  (table) => [uniqueIndex("item_scores_item_profile_idx").on(table.rawItemId, table.profileId)],
);

export const sentDigests = pgTable("sent_digests", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id")
    .notNull()
    .references(() => profiles.id),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  itemCount: integer("item_count"),
  emailProviderId: text("email_provider_id"), // Resend message ID
  status: text("status").notNull(), // 'sent' | 'failed' | 'skipped_no_items'
  errorDetail: text("error_detail"),
});

export const digestItems = pgTable(
  "digest_items",
  {
    digestId: integer("digest_id")
      .notNull()
      .references(() => sentDigests.id),
    itemScoreId: integer("item_score_id")
      .notNull()
      .references(() => itemScores.id),
  },
  (table) => [primaryKey({ columns: [table.digestId, table.itemScoreId] })],
);
