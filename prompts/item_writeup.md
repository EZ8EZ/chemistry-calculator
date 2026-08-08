# Item write-up — two-pass grounding design

To prevent hallucinated "findings" that aren't actually in the source, item
write-ups are generated in two separate Claude calls (see
`lib/scoring/claude.ts`: `extractAndScoreItems` then `writeUpItems`), with a
deterministic verification step in between.

## Pass 1 — extraction + scoring (`extractAndScoreItems`)

Given each candidate's title/authors/journal/abstract, the model outputs
*only*, per item: a band (A-D, per `relevance_scoring.md`), a list of
`claims`, where each claim is `{ text, supporting_quote }` — `text` is a
plain-English statement of one specific finding/mechanism/method detail, and
`supporting_quote` is the exact (or near-exact) span from the abstract that
supports it. No prose write-up is produced in this pass — just structured
facts. This keeps the "did the model make this up" question mechanically
checkable rather than a matter of prose-reading trust.

## Verification (deterministic, in code — `lib/scoring/verify.ts`)

Every `supporting_quote` is checked with a fuzzy substring match against the
item's actual abstract text (case/whitespace-normalized). Claims that fail
this check are dropped. If an item assigned Band A or B ends up with zero
surviving claims, it is downgraded to Band C (or dropped if Band C also
requires substance) rather than allowed through with an ungrounded write-up.

## Pass 2 — prose write-up (`writeUpItems`)

Given *only* the verified claims list (not the original abstract) plus the
recipient's profile summary, the model writes the final per-item fields:

1. `hook` — one line: why this matters to *this* recipient specifically,
   tied to a specific verified claim.
2. `key_finding` — 2-4 sentences, plain but technically precise, built only
   from verified claims.
3. `mechanism_novelty` — 1-3 sentences on what's specifically new (new
   catalyst/ligand/evolution strategy/technique), vs. incremental scope
   extension.
4. `relation_to_work` — 1-2 sentences connecting it to the recipient's
   specific research direction (from their taxonomy `profile_summary`).
5. `competing_group_note` — only if a verified claim ties the item to a name
   on the recipient's `watch_labs` list; otherwise omit rather than guess.
6. `scoop_risk_flag` — only if applicable, and always hedged ("may overlap
   with...", never asserted as fact) — the model is explicitly instructed
   this is a possibility for the human to judge, not a certainty, since it
   cannot know the recipient's unpublished internal work.

Epistemic-labeling rule enforced in the system prompt for this pass: phrase
findings as "the authors report/observe/claim X," never "X is true" — the
write-up describes what the paper says, not independently verified fact.
Band C items skip this pass entirely and get a 1-2 line collapsed entry
built directly from Pass 1's top claim instead (see `send-digest` route).
