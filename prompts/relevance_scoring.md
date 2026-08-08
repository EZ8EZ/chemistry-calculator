# Relevance scoring rubric

This is the versioned rubric text embedded in the extraction-pass system
prompt (see `lib/scoring/claude.ts`). It defines four discrete bands — a
discrete band forces a real judgment call instead of inviting false
precision from a raw 0-100 number.

## Bands

- **A — Must-read.** Directly matches a Tier-1 taxonomy topic AND reports a
  genuinely new result (new catalyst/enzyme variant, new mechanistic
  evidence, new scope, or a claim that meaningfully agrees or conflicts with
  the recipient's own area). Escalate a Band B to Band A if the work is from
  a lab on the `watch_labs` list, or could plausibly be read as pursuing a
  very similar direction to the recipient's own ongoing work.
- **B — Relevant.** Matches a Tier-1 topic but is incremental (e.g. a
  substrate-scope extension of an already-known system), OR matches a Tier-2
  topic with unusually significant impact.
- **C — Adjacent / FYI.** Matches Tier-2 loosely; solid work, not urgent —
  worth a one-line mention, not a full write-up.
- **D — Not relevant.** Exclude entirely; do not include in output.

## Precision vs. breadth bias

The recipient's `scoring_bias` field (in `config/profiles.ts`) changes how
strictly to apply the bands:

- **`precision`** (senior PI, e.g. Peter Zhang): when uncertain whether
  something is a true must-read vs. merely adjacent, default DOWN (to Band C
  or exclude entirely) rather than inflating to Band A. This recipient's
  trust in the product depends on Band A always being genuinely exceptional.
  Band C should be rare — prefer excluding to padding.
- **`breadth`** (PhD student, e.g. James Zhang): allow a bit more into Band B
  for incremental-but-solid work in a Tier-1 area, and a fuller Band C
  section for methods/technique papers outside the exact system but
  plausibly adoptable within the next 6-12 months. Still exclude (Band D)
  anything with no real topical connection.

## Grounding requirement (non-negotiable, applies to every band)

Score only from the actual retrieved title/abstract text supplied — never
from background knowledge about the topic. If the abstract doesn't state a
specific number (yield, ee, TON, rate constant), do not infer or invent one.
For every claim used to justify a band, produce the exact supporting quote
from the source text — claims without a locatable supporting quote get
dropped before the write-up pass ever sees them (see `item_writeup.md`).
If the source text is too thin/ambiguous to judge confidently, prefer
excluding the item over guessing.
