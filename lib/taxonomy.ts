import { readFileSync } from "fs";
import { join } from "path";
import { load } from "js-yaml";

export interface WatchLab {
  name: string;
  institution: string;
  why: string;
}

export interface Taxonomy {
  profile_summary: string;
  tier_1_must_not_miss: string[];
  tier_2_broader_awareness: string[];
  watch_labs: WatchLab[];
}

const cache = new Map<string, Taxonomy>();

/** Loads and parses a profile's taxonomy YAML (see taxonomy/*.yaml), cached per path. */
export function loadTaxonomy(relativePath: string): Taxonomy {
  const cached = cache.get(relativePath);
  if (cached) return cached;

  const fullPath = join(process.cwd(), relativePath);
  const raw = readFileSync(fullPath, "utf-8");
  const parsed = load(raw) as Taxonomy;

  if (!parsed?.tier_1_must_not_miss || !parsed?.tier_2_broader_awareness) {
    throw new Error(`Malformed taxonomy file: ${relativePath}`);
  }

  cache.set(relativePath, parsed);
  return parsed;
}
