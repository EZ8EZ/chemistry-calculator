import { writeFileSync } from "fs";
import { renderDigestEmail, type DigestItem } from "@/lib/email/render";
import { profiles } from "@/config/profiles";

/**
 * Renders a synthetic digest for each profile using fake but realistic
 * item data — no DB, no API keys, no external calls. Writes HTML files to
 * /tmp for visual inspection. Run with: npx tsx scripts/preview-email.ts
 */
const peterItems: DigestItem[] = [
  {
    itemScoreId: 1,
    band: "A",
    title: "A Cobalt(III)-Nitrene Radical Intermediate Directly Observed by Time-Resolved EPR During Intramolecular C–H Amination",
    journal: "Journal of the American Chemical Society",
    authors: ["A. Researcher", "B. Coworker"],
    url: "https://doi.org/10.1021/jacs.example.0001",
    doi: "10.1021/jacs.example.0001",
    summary: {
      hook: "Direct spectroscopic evidence for the Co(III)-nitrene radical intermediate your group has long proposed mechanistically.",
      key_finding: "The authors report time-resolved EPR signals consistent with a doublet-state Co(III)-nitrene radical during intramolecular C-H amination of an aliphatic azide, with a measured rate constant for H-atom abstraction of 4.2 x 10^4 s^-1.",
      mechanism_novelty: "First direct spectroscopic (rather than computational/kinetic) observation of this specific radical intermediate.",
      relation_to_work: "Directly supports the stepwise radical mechanism your 2022 Nature Chemistry paper argued for on kinetic grounds alone.",
      competing_group_note: "From a group not currently on your watch-list — worth flagging as new entrant.",
      scoop_risk_flag: null,
    },
  },
  {
    itemScoreId: 2,
    band: "B",
    title: "Iron-Porphyrin Catalyzed Asymmetric Cyclopropanation of Unactivated Alkenes",
    journal: "ACS Catalysis",
    authors: ["C. Chen"],
    url: "https://doi.org/10.1021/acscatal.example.0002",
    doi: "10.1021/acscatal.example.0002",
    summary: {
      hook: "An Fe-porphyrin variant extends metalloradical cyclopropanation to unactivated alkenes.",
      key_finding: "The authors report 88% ee and 91% yield for cyclopropanation of a terminal unactivated alkene using a D2-symmetric iron amidoporphyrin catalyst.",
      relation_to_work: "Same ligand platform as your Co-based systems — worth comparing substrate scope.",
    },
  },
  {
    itemScoreId: 3,
    band: "C",
    title: "DFT Study of Spin-State Crossing in Manganese-Porphyrin Nitrene Transfer",
    journal: "Inorganic Chemistry",
    authors: ["D. Diaz"],
    url: "https://doi.org/10.1021/inorgchem.example.0003",
    doi: null,
    summary: { hook: "The authors report a computed low-spin to high-spin crossing along the nitrene-transfer coordinate for a Mn-porphyrin system." },
  },
];

const jamesItems: DigestItem[] = [
  {
    itemScoreId: 4,
    band: "A",
    title: "Directed Evolution of a Nickel-Substituted Non-Heme Enzyme for Enantioselective C(sp2)–S Bond Formation",
    journal: "Nature Synthesis",
    authors: ["E. Evans", "F. Fisher"],
    url: "https://doi.org/10.1038/s44160-example-0004",
    doi: "10.1038/s44160-example-0004",
    summary: {
      hook: "A directly competing approach to Ni-LMCT photoenzymatic C-S coupling, from a different enzyme scaffold than PsEFE.",
      key_finding: "The authors report directed evolution of a nickel-substituted non-heme iron enzyme (a different scaffold than PsEFE) achieving 91% ee and up to 640 TTN for aryl-thiol cross-coupling under blue-light irradiation.",
      mechanism_novelty: "Uses a different non-heme scaffold than the Huang lab's PsEFE-based system, suggesting the Ni-LMCT strategy generalizes across enzyme families.",
      relation_to_work: "Directly comparable to your Ni-PsEFE system — worth comparing turnover numbers and ee directly.",
      competing_group_note: null,
      scoop_risk_flag: "This explores a very similar enzyme-engineering strategy to your own project — read closely, not a certainty of overlap.",
    },
  },
  {
    itemScoreId: 5,
    band: "B",
    title: "A Microfluidic Droplet Screening Platform for High-Throughput Directed Evolution",
    journal: "Nature Chemistry",
    authors: ["G. Garcia"],
    url: "https://doi.org/10.1038/nchem.example.0005",
    doi: "10.1038/nchem.example.0005",
    summary: {
      hook: "A new microfluidic screening platform that could speed up your own directed-evolution campaigns.",
      key_finding: "The authors report a droplet-based microfluidic platform screening >10^5 enzyme variants/hour, a roughly 20x throughput increase over plate-based screening.",
      relation_to_work: "Directly applicable technique for scaling up your PsEFE variant libraries.",
    },
  },
  {
    itemScoreId: 6,
    band: "C",
    title: "Cerium-LMCT Photocatalysis for C–H Abstraction in Alcohol Oxidation",
    journal: "Chemical Science",
    authors: ["H. Huang (unrelated)"],
    url: "https://doi.org/10.1039/chemsci.example.0006",
    doi: null,
    summary: { hook: "The authors report cerium-LMCT-generated alkoxy radicals for selective C-H abstraction adjacent to alcohols — small-molecule LMCT methodology, not enzymatic." },
  },
  {
    itemScoreId: 7,
    band: "C",
    title: "Ancestral Sequence Reconstruction Accelerates Non-Heme Iron Biocatalyst Engineering",
    journal: "ACS Central Science",
    authors: ["I. Ito"],
    url: "https://doi.org/10.1021/acscentsci.example.0007",
    doi: null,
    summary: { hook: "The authors report using ancestral sequence reconstruction to identify more evolvable non-heme iron enzyme starting points." },
  },
];

const peterEmail = renderDigestEmail(profiles[0], "since Wed, Jul 29", peterItems);
const jamesEmail = renderDigestEmail(profiles[1], "since Wed, Jul 29", jamesItems);

writeFileSync("/tmp/preview-peter.html", peterEmail.html);
writeFileSync("/tmp/preview-james.html", jamesEmail.html);

console.log("=== Peter ===");
console.log("Subject:", peterEmail.subject);
console.log("Included item_score IDs:", peterEmail.includedItemScoreIds);
console.log("\n--- plain text ---\n");
console.log(peterEmail.text);

console.log("\n\n=== James ===");
console.log("Subject:", jamesEmail.subject);
console.log("Included item_score IDs:", jamesEmail.includedItemScoreIds);
console.log("\n--- plain text ---\n");
console.log(jamesEmail.text);

console.log("\n\nHTML written to /tmp/preview-peter.html and /tmp/preview-james.html");

// Also test the "quiet stretch" fallback with zero items.
const quiet = renderDigestEmail(profiles[0], "since Sun, Aug 2", []);
writeFileSync("/tmp/preview-peter-quiet.html", quiet.html);
console.log("\n=== Peter (quiet stretch) ===");
console.log("Subject:", quiet.subject);
