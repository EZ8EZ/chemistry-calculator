import { loadTaxonomy } from "@/lib/taxonomy";
import { prefilterItem } from "@/lib/scoring/prefilter";

/**
 * Sanity check for the keyword pre-filter against known-relevant and
 * known-irrelevant sample titles/abstracts, per the build plan's step 8
 * verification. Run with: npx tsx scripts/test-prefilter.ts
 */
const cases: { profile: "peter" | "james"; title: string; abstract: string; expectPass: boolean; label: string }[] = [
  {
    profile: "peter",
    label: "Peter — clear Tier-1 hit (Co-porphyrin nitrene transfer)",
    title: "Cobalt(II)-Porphyrin-Catalyzed Asymmetric Intramolecular C–H Amination via Nitrene Radical Intermediates",
    abstract: "We report a metalloradical catalysis approach using chiral cobalt porphyrins to activate aryl azides, generating nitrene radical intermediates for stereoselective C-H amination.",
    expectPass: true,
  },
  {
    profile: "peter",
    label: "Peter — Tier-2 adjacent hit (Fe-porphyrin catalysis)",
    title: "Iron-Porphyrin Catalyzed Carbene Transfer for Cyclopropanation of Styrenes",
    abstract: "An iron-porphyrin catalyst enables carbene transfer from diazo reagents, affording cyclopropanes with good diastereoselectivity.",
    expectPass: true,
  },
  {
    profile: "peter",
    label: "Peter — clearly irrelevant (battery materials)",
    title: "Solid-State Electrolytes for Lithium-Ion Battery Applications",
    abstract: "We report a new garnet-type solid electrolyte with improved ionic conductivity for next-generation battery technology.",
    expectPass: false,
  },
  {
    profile: "james",
    label: "James — clear Tier-1 hit (LMCT / Ni C-S coupling)",
    title: "Engineering Non-Heme Enzymes for Nickel-Catalyzed C(sp2)-S Coupling via Ligand-to-Metal Charge Transfer Photocatalysis",
    abstract: "Directed evolution of a nickel-substituted non-heme iron enzyme enables photoinduced LMCT chemistry for thioether-forming cross-coupling.",
    expectPass: true,
  },
  {
    profile: "james",
    label: "James — Tier-2 adjacent hit (directed evolution platform)",
    title: "A High-Throughput Yeast Display Platform for Directed Evolution of Biocatalysts",
    abstract: "We describe a new microfluidic screening platform to accelerate directed evolution campaigns for engineered enzymes.",
    expectPass: true,
  },
  {
    profile: "james",
    label: "James — clearly irrelevant (astrophysics)",
    title: "Spectroscopic Detection of Exoplanet Atmospheres Using JWST",
    abstract: "We present near-infrared transmission spectra revealing water vapor in the atmosphere of a hot Jupiter exoplanet.",
    expectPass: false,
  },
];

const taxonomies = {
  peter: loadTaxonomy("taxonomy/peter.yaml"),
  james: loadTaxonomy("taxonomy/james.yaml"),
};

let failures = 0;
for (const c of cases) {
  const result = prefilterItem({ title: c.title, abstract: c.abstract }, taxonomies[c.profile]);
  const ok = result.passed === c.expectPass;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} — ${c.label} | expected passed=${c.expectPass}, got passed=${result.passed}` +
      (result.matchedTerms.length ? ` (matched: ${result.matchedTerms.join(", ")})` : ""),
  );
}

if (failures > 0) {
  console.error(`\n${failures}/${cases.length} case(s) failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${cases.length} cases passed.`);
}
