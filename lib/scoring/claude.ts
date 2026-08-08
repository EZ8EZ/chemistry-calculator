import { readFileSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import type { Profile } from "@/config/profiles";
import type { Taxonomy } from "@/lib/taxonomy";

const MODEL = "claude-sonnet-5";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

function readPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "prompts", name), "utf-8");
}

const RELEVANCE_RUBRIC = readPrompt("relevance_scoring.md");
const ITEM_WRITEUP_DOC = readPrompt("item_writeup.md");

export interface CandidateItem {
  id: number;
  title: string;
  authors: string[] | null;
  journal: string | null;
  abstract: string | null;
  doi: string | null;
  url: string;
}

export interface ExtractedClaim {
  text: string;
  supporting_quote: string;
}

export interface ExtractedItem {
  id: number;
  band: "A" | "B" | "C" | "D";
  claims: ExtractedClaim[];
}

export interface WriteupFields {
  id: number;
  hook: string;
  key_finding: string;
  mechanism_novelty: string;
  relation_to_work: string;
  competing_group_note: string | null;
  scoop_risk_flag: string | null;
}

function watchLabsBlock(taxonomy: Taxonomy): string {
  return taxonomy.watch_labs.map((l) => `- ${l.name} (${l.institution}): ${l.why}`).join("\n");
}

/** Pass 1: extraction + band scoring, grounded to supplied text only. */
export async function extractAndScoreItems(
  profile: Profile,
  taxonomy: Taxonomy,
  candidates: CandidateItem[],
): Promise<ExtractedItem[]> {
  if (candidates.length === 0) return [];

  const systemPrompt = [
    RELEVANCE_RUBRIC,
    "",
    `## Recipient profile: ${profile.name} (scoring_bias: ${profile.scoringBias})`,
    taxonomy.profile_summary,
    "",
    "### Watch-list labs (for scoop-risk / Band A escalation signal only — first-pass draft, may be incomplete):",
    watchLabsBlock(taxonomy),
  ].join("\n");

  const userContent = JSON.stringify(
    candidates.map((c) => ({
      id: c.id,
      title: c.title,
      authors: c.authors,
      journal: c.journal,
      abstract: c.abstract,
    })),
  );

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Score and extract grounded claims for each of these candidate items:\n\n${userContent}`,
      },
    ],
    tools: [
      {
        name: "submit_scores",
        description: "Submit the band + grounded claims for every candidate item.",
        input_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  band: { type: "string", enum: ["A", "B", "C", "D"] },
                  claims: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        supporting_quote: {
                          type: "string",
                          description: "Exact span copied from the item's abstract that supports this claim.",
                        },
                      },
                      required: ["text", "supporting_quote"],
                    },
                  },
                },
                required: ["id", "band", "claims"],
              },
            },
          },
          required: ["items"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_scores" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a submit_scores tool call");
  }
  const parsed = toolUse.input as { items: ExtractedItem[] };
  return parsed.items;
}

/** Pass 2: prose write-up, built ONLY from verified claims (never the raw abstract). */
export async function writeUpItems(
  profile: Profile,
  taxonomy: Taxonomy,
  items: { id: number; title: string; journal: string | null; claims: ExtractedClaim[] }[],
): Promise<WriteupFields[]> {
  if (items.length === 0) return [];

  const systemPrompt = [
    ITEM_WRITEUP_DOC,
    "",
    `## Recipient profile: ${profile.name}`,
    taxonomy.profile_summary,
    "",
    "Use ONLY the verified claims provided for each item — do not reintroduce",
    "anything not present in those claims. Phrase findings as 'the authors",
    "report/observe X', never as an independently verified fact.",
  ].join("\n");

  const userContent = JSON.stringify(
    items.map((i) => ({ id: i.id, title: i.title, journal: i.journal, verified_claims: i.claims })),
  );

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: "user", content: `Write up each of these items:\n\n${userContent}` }],
    tools: [
      {
        name: "submit_writeups",
        description: "Submit the polished write-up fields for every item.",
        input_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  hook: { type: "string" },
                  key_finding: { type: "string" },
                  mechanism_novelty: { type: "string" },
                  relation_to_work: { type: "string" },
                  competing_group_note: { type: ["string", "null"] },
                  scoop_risk_flag: { type: ["string", "null"] },
                },
                required: [
                  "id",
                  "hook",
                  "key_finding",
                  "mechanism_novelty",
                  "relation_to_work",
                  "competing_group_note",
                  "scoop_risk_flag",
                ],
              },
            },
          },
          required: ["items"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_writeups" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a submit_writeups tool call");
  }
  const parsed = toolUse.input as { items: WriteupFields[] };
  return parsed.items;
}
