export type ProfileSlug = "peter_zhang" | "james_zhang";

export interface Profile {
  slug: ProfileSlug;
  name: string;
  email: string;
  /** Path to this profile's taxonomy YAML, relative to the repo root. */
  taxonomyPath: string;
  /**
   * How much this profile favors precision over breadth. Fed into the
   * Claude scoring prompt (see prompts/relevance_scoring.md).
   */
  scoringBias: "precision" | "breadth";
  /** Hard per-section item caps for the digest email (see lib/email/render.ts). */
  digestCaps: { hero: number; relevant: number; adjacent: number };
}

export const profiles: Profile[] = [
  {
    slug: "peter_zhang",
    name: "Peter Zhang",
    email: process.env.PETER_ZHANG_EMAIL ?? "",
    taxonomyPath: "taxonomy/peter.yaml",
    scoringBias: "precision",
    digestCaps: { hero: 1, relevant: 4, adjacent: 3 },
  },
  {
    slug: "james_zhang",
    name: "James Zhang",
    email: process.env.JAMES_ZHANG_EMAIL ?? "",
    taxonomyPath: "taxonomy/james.yaml",
    scoringBias: "breadth",
    digestCaps: { hero: 2, relevant: 5, adjacent: 4 },
  },
];
