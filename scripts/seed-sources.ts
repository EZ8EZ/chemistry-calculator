// Env vars are loaded via `node --env-file=.env.local` (see package.json's
// db:seed script) rather than a dotenv import here — ESM import hoisting
// means a dotenv call in this file would run AFTER `@/config/profiles` (an
// earlier import) has already read process.env at its own module-eval time.

import { db } from "@/lib/db";
import { sources, profiles } from "@/lib/db/schema";
import { sourceRegistry } from "@/lib/ingest/sources";
import { profiles as profileConfigs } from "@/config/profiles";
import { sql } from "drizzle-orm";

/**
 * Idempotently seeds the `sources` and `profiles` tables from the static
 * config in lib/ingest/sources.ts and config/profiles.ts. Run this once
 * after provisioning the DB, and again any time those files change.
 *
 *   npx tsx scripts/seed-sources.ts
 */
async function main() {
  for (const source of sourceRegistry) {
    await db
      .insert(sources)
      .values({
        name: source.name,
        type: source.type,
        url: source.url,
        journal: source.journal,
        pollFreqMin: source.pollFreqMin,
        enabled: source.enabled,
      })
      .onConflictDoUpdate({
        target: sources.name,
        set: {
          type: source.type,
          url: source.url,
          journal: source.journal,
          pollFreqMin: source.pollFreqMin,
          enabled: source.enabled,
        },
      });
  }
  console.log(`Seeded ${sourceRegistry.length} sources.`);

  for (const profile of profileConfigs) {
    if (!profile.email) {
      console.warn(`Skipping profile ${profile.slug}: no email set (PETER_ZHANG_EMAIL / JAMES_ZHANG_EMAIL env var).`);
      continue;
    }
    await db
      .insert(profiles)
      .values({ slug: profile.slug, name: profile.name, email: profile.email, configRef: profile.taxonomyPath })
      .onConflictDoUpdate({
        target: profiles.slug,
        set: { name: profile.name, email: profile.email, configRef: profile.taxonomyPath },
      });
  }
  console.log(`Seeded ${profileConfigs.length} profiles.`);

  await db.execute(sql`select 1`); // sanity ping
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
