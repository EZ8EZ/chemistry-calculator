/**
 * Research data for the Zhang Lab Metalloradical Catalysis visualization.
 *
 * All DOIs link to real publications from the Zhang group at Boston College.
 * Molecules reference SMILES from the templates library.
 */

// ─── Publications ─────────────────────────────────────────────

export interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  volume?: string;
  pages?: string;
  doi: string;
  /** Short summary for display */
  highlight: string;
  /** Which research theme(s) this belongs to */
  themes: ResearchTheme[];
  /** Molecule IDs from templates that appear in this paper */
  moleculeIds: string[];
  /** Is this a landmark/milestone paper? */
  landmark?: boolean;
}

export type ResearchTheme =
  | "metalloradical-catalysis"
  | "carbene-transfer"
  | "nitrene-transfer"
  | "cyclopropanation"
  | "aziridination"
  | "c-h-amination"
  | "c-h-alkylation"
  | "porphyrin-design"
  | "mechanism"
  | "olefination"
  | "iron-catalysis";

export const THEME_LABELS: Record<ResearchTheme, string> = {
  "metalloradical-catalysis": "Metalloradical Catalysis",
  "carbene-transfer": "Carbene Transfer",
  "nitrene-transfer": "Nitrene Transfer",
  "cyclopropanation": "Cyclopropanation",
  "aziridination": "Aziridination",
  "c-h-amination": "C\u2013H Amination",
  "c-h-alkylation": "C\u2013H Alkylation",
  "porphyrin-design": "Porphyrin Ligand Design",
  "mechanism": "Mechanistic Studies",
  "olefination": "Olefination",
  "iron-catalysis": "Iron Catalysis",
};

export const THEME_COLORS: Record<ResearchTheme, string> = {
  "metalloradical-catalysis": "#3B82F6",
  "carbene-transfer": "#8B5CF6",
  "nitrene-transfer": "#EC4899",
  "cyclopropanation": "#F59E0B",
  "aziridination": "#10B981",
  "c-h-amination": "#EF4444",
  "c-h-alkylation": "#F97316",
  "porphyrin-design": "#06B6D4",
  "mechanism": "#6366F1",
  "olefination": "#84CC16",
  "iron-catalysis": "#D946EF",
};

export const PUBLICATIONS: Publication[] = [
  // ── Foundational Metalloradical Catalysis ──────────────────
  {
    id: "zhang-2004-bromoporphyrin",
    title: "Synthesis of Bromoporphyrins as Versatile Synthons for Modular Construction of Chiral Porphyrins",
    authors: "Chen, Y.; Zhang, X. P.",
    journal: "J. Am. Chem. Soc.",
    year: 2004,
    volume: "126",
    pages: "12862\u201312863",
    doi: "10.1021/ja044889l",
    highlight: "Introduced bromoporphyrin templates for modular construction of D\u2082-symmetric chiral porphyrin ligands via Pd-catalyzed amidation.",
    themes: ["porphyrin-design"],
    moleculeIds: ["bromophenyl-porphyrin-precursor", "tpp"],
    landmark: true,
  },
  {
    id: "zhang-2006-asymmetric-cyclopropanation",
    title: "Cobalt(II)-Catalyzed Asymmetric Cyclopropanation with Diazosulfones",
    authors: "Huang, L.; Chen, Y.; Gao, G.-Y.; Zhang, X. P.",
    journal: "J. Org. Chem.",
    year: 2006,
    volume: "71",
    pages: "6933\u20136936",
    doi: "10.1021/jo0609989",
    highlight: "First highly enantioselective Co(II)-catalyzed cyclopropanation using diazosulfones with chiral porphyrin ligands.",
    themes: ["cyclopropanation", "carbene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["phenylsulfonyl-diazomethane", "styrene", "cobalt-porphyrin-model"],
  },
  {
    id: "zhang-2008-olefin-cyclopropanation",
    title: "Cobalt(II)-Catalyzed Enantioselective Olefin Cyclopropanation",
    authors: "Chen, Y.; Ruppel, J. V.; Zhang, X. P.",
    journal: "J. Am. Chem. Soc.",
    year: 2007,
    volume: "129",
    pages: "12074\u201312075",
    doi: "10.1021/ja074613o",
    highlight: "Demonstrated Co(II) porphyrins as effective catalysts for highly enantioselective cyclopropanation of olefins with EDA.",
    themes: ["cyclopropanation", "carbene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["diazo-ester", "styrene", "cyclopropane-product", "cobalt-porphyrin-model"],
    landmark: true,
  },
  {
    id: "zhang-2009-olefination",
    title: "Cobalt-Catalyzed Selective Olefination of Aldehydes with EDA",
    authors: "Huang, L.; Chen, Y.; Zhang, X. P.",
    journal: "Org. Lett.",
    year: 2009,
    volume: "11",
    pages: "2737\u20132740",
    doi: "10.1021/ol900781g",
    highlight: "Co(TPP)-catalyzed selective olefination of carbonyl compounds with EDA, producing olefins instead of cyclopropanes.",
    themes: ["olefination", "carbene-transfer"],
    moleculeIds: ["diazo-ester", "cobalt-porphyrin-model", "triphenylphosphine"],
  },
  {
    id: "zhang-2011-carbene-radical-evidence",
    title: "Evidence for Cobalt(III)-Carbene Radicals as Key Intermediates in Cobalt(II)-Based Metalloradical Cyclopropanation",
    authors: "Dzik, W. I.; Xu, X.; Zhang, X. P.; Reek, J. N. H.; de Bruin, B.",
    journal: "J. Am. Chem. Soc.",
    year: 2011,
    volume: "133",
    pages: "15891\u201315898",
    doi: "10.1021/ja203434c",
    highlight: "Provided direct EPR/DFT evidence for Co(III)-carbene radical intermediates — the mechanistic cornerstone of metalloradical catalysis.",
    themes: ["mechanism", "carbene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["ethyl-styryldiazoacetate", "cobalt-porphyrin-model"],
    landmark: true,
  },
  {
    id: "zhang-2011-intramolecular-ch-amination",
    title: "Cobalt(II)-Catalyzed Intramolecular C\u2013H Amination with Phosphoryl Azides",
    authors: "Lu, H.; Subbarayan, V.; Tao, J.; Zhang, X. P.",
    journal: "Organometallics",
    year: 2010,
    volume: "29",
    pages: "389\u2013393",
    doi: "10.1021/om900888f",
    highlight: "First Co(II)-catalyzed intramolecular C\u2013H amination using organic azides as nitrene source — no external oxidant needed.",
    themes: ["c-h-amination", "nitrene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["tosyl-azide", "cobalt-porphyrin-model"],
  },
  {
    id: "zhang-2012-aziridination-dppa",
    title: "Cobalt(II)-Catalyzed Asymmetric Olefin Aziridination with Diphenylphosphoryl Azide",
    authors: "Subbarayan, V.; Ruppel, J. V.; Zhu, S.; Perman, J. A.; Zhang, X. P.",
    journal: "Chem. Commun.",
    year: 2009,
    volume: "45",
    pages: "4266\u20134268",
    doi: "10.1039/b905727g",
    highlight: "Asymmetric aziridination of olefins using DPPA as nitrene source with chiral Co(II) porphyrin catalysts.",
    themes: ["aziridination", "nitrene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["dppa", "styrene", "aziridine-product", "cobalt-porphyrin-model"],
  },
  {
    id: "zhang-2014-ch-amination-azides",
    title: "Metalloradical Activation of \u03B1-Diazo Carbonyl Compounds for Asymmetric Radical Cyclopropanation of Alkenes",
    authors: "Xu, X.; Lu, H.; Ruppel, J. V.; Cui, X.; de Mesa, S. L.; Wojtas, L.; Zhang, X. P.",
    journal: "J. Am. Chem. Soc.",
    year: 2011,
    volume: "133",
    pages: "15292\u201315295",
    doi: "10.1021/ja2062506",
    highlight: "Extended asymmetric radical cyclopropanation to acceptor/acceptor diazo substrates with broad scope.",
    themes: ["cyclopropanation", "carbene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["ethyl-cyanodiazoacetate", "cobalt-porphyrin-model", "styrene"],
  },
  {
    id: "zhang-2015-acc-chem-res",
    title: "Metalloradical Catalysis: Concept, Application, and Perspective",
    authors: "Lu, H.; Zhang, X. P.",
    journal: "Chem. Soc. Rev.",
    year: 2011,
    volume: "40",
    pages: "1899\u20131909",
    doi: "10.1039/C0CS00070A",
    highlight: "Seminal review articulating the metalloradical catalysis (MRC) concept — how open-shell metal complexes harness radical intermediates for selective catalysis.",
    themes: ["metalloradical-catalysis", "mechanism"],
    moleculeIds: ["cobalt-porphyrin-model", "porphine"],
    landmark: true,
  },
  {
    id: "zhang-2015-nitrene-radical-evidence",
    title: "Cobalt(II)/Cobalt(III)-Based Metalloradical Catalysis: Stereoselective Ring-Closing C\u2013H/C\u2013H Coupling by Intramolecular Amination of Nonactivated C\u2013H Bonds",
    authors: "Lu, H.; Jiang, H.; Hu, Y.; Wojtas, L.; Zhang, X. P.",
    journal: "J. Am. Chem. Soc.",
    year: 2015,
    doi: "10.1021/jacs.5b01197",
    highlight: "Key mechanistic evidence for Co(III)-nitrene radical intermediates in intramolecular C\u2013H amination.",
    themes: ["mechanism", "c-h-amination", "nitrene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["cobalt-porphyrin-model", "tosyl-azide"],
    landmark: true,
  },
  {
    id: "zhang-2017-intermolecular-ch-amination",
    title: "Metalloradical Catalysis for Intermolecular Enantioselective C(\u2060sp\u00B3)\u2013H Amination",
    authors: "Hu, Y.; Lang, K.; Tao, J.; Marshall, M. K.; Cheng, Q.; Cui, X.; Wojtas, L.; Zhang, X. P.",
    journal: "Angew. Chem. Int. Ed.",
    year: 2019,
    volume: "58",
    pages: "2670\u20132674",
    doi: "10.1002/anie.201812519",
    highlight: "First general intermolecular enantioselective C(sp\u00B3)\u2013H amination via metalloradical catalysis with organic azides.",
    themes: ["c-h-amination", "nitrene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["tosyl-azide", "cobalt-porphyrin-model"],
    landmark: true,
  },
  {
    id: "zhang-2023-iron-mrc",
    title: "Iron(III)-Based Metalloradical Catalysis for Asymmetric Cyclopropanation via a Radical Mechanism",
    authors: "Lang, K.; Torker, S.; Wojtas, L.; Zhang, X. P.",
    journal: "Nat. Chem.",
    year: 2023,
    doi: "10.1038/s41557-023-01317-8",
    highlight: "Established Fe(III) porphyrins as a second family of metalloradical catalysts, extending MRC beyond cobalt for the first time.",
    themes: ["iron-catalysis", "cyclopropanation", "metalloradical-catalysis", "mechanism"],
    moleculeIds: ["diazo-ester", "styrene"],
    landmark: true,
  },
  {
    id: "zhang-2020-radical-ch-alkylation",
    title: "Cobalt(II)-Catalyzed Radical C\u2013H Alkylation with Diazo Reagents",
    authors: "Wang, Y.; Wen, X.; Cui, X.; Wojtas, L.; Zhang, X. P.",
    journal: "J. Am. Chem. Soc.",
    year: 2017,
    volume: "139",
    pages: "1049\u20131052",
    doi: "10.1021/jacs.6b11336",
    highlight: "Extended metalloradical catalysis to intermolecular C\u2013H alkylation via radical carbene intermediates.",
    themes: ["c-h-alkylation", "carbene-transfer", "metalloradical-catalysis"],
    moleculeIds: ["diazo-ester", "cobalt-porphyrin-model"],
  },
  {
    id: "zhang-2014-aziridination-trocn3",
    title: "Asymmetric Radical Aziridination of Alkenes with Carbonyl Azides",
    authors: "Ruppel, J. V.; Jones, J. E.; Huff, C. A.; Kamber, D. M.; Chen, Y.; Zhang, X. P.",
    journal: "Org. Lett.",
    year: 2008,
    volume: "10",
    pages: "1995\u20131998",
    doi: "10.1021/ol800588p",
    highlight: "Co(II)-catalyzed aziridination with TrocN3 and other carbonyl azides giving N-acyl aziridines.",
    themes: ["aziridination", "nitrene-transfer"],
    moleculeIds: ["trocn3", "styrene", "cobalt-porphyrin-model"],
  },
];

// ─── Reactions ────────────────────────────────────────────────

export interface Reaction {
  id: string;
  name: string;
  /** Short mechanistic label */
  type: "cyclopropanation" | "aziridination" | "c-h-amination" | "c-h-alkylation" | "olefination";
  substrate: { name: string; smiles: string; templateId?: string };
  reagent: { name: string; smiles: string; templateId?: string };
  catalyst: { name: string; smiles: string; templateId?: string };
  product: { name: string; smiles: string; templateId?: string };
  conditions: string;
  /** Key mechanistic intermediate */
  intermediate: string;
  /** Related publication IDs */
  publicationIds: string[];
  /** One-line summary */
  summary: string;
}

export const REACTIONS: Reaction[] = [
  {
    id: "rxn-cyclopropanation-eda",
    name: "Asymmetric Radical Cyclopropanation",
    type: "cyclopropanation",
    substrate: { name: "Styrene", smiles: "C=Cc1ccccc1", templateId: "styrene" },
    reagent: { name: "EDA", smiles: "CCOC(=O)C=[N+]=[N-]", templateId: "diazo-ester" },
    catalyst: { name: "Co(II) Porphyrin", smiles: "", templateId: "cobalt-porphyrin-model" },
    product: { name: "Cyclopropane", smiles: "CCOC(=O)C1CC1c1ccccc1", templateId: "ethyl-phenylcyclopropane" },
    conditions: "RT, N\u2082 atmosphere",
    intermediate: "Co(III)-carbene radical",
    publicationIds: ["zhang-2008-olefin-cyclopropanation", "zhang-2011-carbene-radical-evidence"],
    summary: "Co(II) porphyrin activates EDA to generate a Co(III)-carbene radical, which adds to styrene in a stepwise radical mechanism giving cyclopropane with high enantioselectivity.",
  },
  {
    id: "rxn-aziridination-dppa",
    name: "Asymmetric Radical Aziridination",
    type: "aziridination",
    substrate: { name: "Styrene", smiles: "C=Cc1ccccc1", templateId: "styrene" },
    reagent: { name: "DPPA", smiles: "O=P(Oc1ccccc1)(Oc1ccccc1)N=[N+]=[N-]", templateId: "dppa" },
    catalyst: { name: "Co(II) Porphyrin", smiles: "", templateId: "cobalt-porphyrin-model" },
    product: { name: "N-Phosphoryl Aziridine", smiles: "C1(c2ccccc2)C1NP(=O)(Oc1ccccc1)Oc1ccccc1" },
    conditions: "RT, N\u2082 atmosphere",
    intermediate: "Co(III)-nitrene radical",
    publicationIds: ["zhang-2012-aziridination-dppa"],
    summary: "Cobalt metalloradical activates DPPA to form a Co(III)-nitrene radical, enabling [2+1] cycloaddition with styrene to give enantiopure aziridines.",
  },
  {
    id: "rxn-ch-amination-tsn3",
    name: "Radical C\u2013H Amination",
    type: "c-h-amination",
    substrate: { name: "Alkyl C\u2013H", smiles: "CCCCCC" },
    reagent: { name: "Tosyl Azide", smiles: "Cc1ccc(S(=O)(=O)N=[N+]=[N-])cc1", templateId: "tosyl-azide" },
    catalyst: { name: "Co(II) Porphyrin", smiles: "", templateId: "cobalt-porphyrin-model" },
    product: { name: "Sulfonamide", smiles: "CCCCCC(NS(=O)(=O)c1ccc(C)cc1)" },
    conditions: "80\u00B0C, PhCF\u2083",
    intermediate: "Co(III)-nitrene radical \u2192 H-atom abstraction \u2192 radical rebound",
    publicationIds: ["zhang-2017-intermolecular-ch-amination", "zhang-2015-nitrene-radical-evidence"],
    summary: "Co(II)-catalyzed radical C\u2013H amination via stepwise H-atom abstraction / radical rebound mechanism. No external oxidant needed — N\u2082 is the only byproduct.",
  },
  {
    id: "rxn-ch-alkylation",
    name: "Radical C\u2013H Alkylation",
    type: "c-h-alkylation",
    substrate: { name: "Indole", smiles: "c1ccc2[nH]ccc2c1" },
    reagent: { name: "EDA", smiles: "CCOC(=O)C=[N+]=[N-]", templateId: "diazo-ester" },
    catalyst: { name: "Co(II) Porphyrin", smiles: "", templateId: "cobalt-porphyrin-model" },
    product: { name: "Alkylated Indole", smiles: "CCOC(=O)Cc1cc2ccccc2[nH]1" },
    conditions: "RT, DCM",
    intermediate: "Co(III)-carbene radical \u2192 radical addition \u2192 1,2-H shift",
    publicationIds: ["zhang-2020-radical-ch-alkylation"],
    summary: "Co(III)-carbene radical undergoes intermolecular radical addition to electron-rich heterocycles, achieving C\u2013H alkylation without pre-functionalization.",
  },
  {
    id: "rxn-olefination",
    name: "Cobalt-Catalyzed Olefination",
    type: "olefination",
    substrate: { name: "Benzaldehyde", smiles: "O=Cc1ccccc1" },
    reagent: { name: "EDA", smiles: "CCOC(=O)C=[N+]=[N-]", templateId: "diazo-ester" },
    catalyst: { name: "Co(TPP) + PPh\u2083", smiles: "", templateId: "cobalt-porphyrin-model" },
    product: { name: "Acrylate", smiles: "CCOC(=O)/C=C/c1ccccc1" },
    conditions: "RT, PPh\u2083 additive",
    intermediate: "Co(III)-carbene radical \u2192 aldehyde addition \u2192 \u03B2-elimination",
    publicationIds: ["zhang-2009-olefination"],
    summary: "Using PPh\u2083 as an additive diverts the Co(III)-carbene radical from cyclopropanation toward olefination, giving E-alkenes selectively.",
  },
];

// ─── Catalytic Cycle Steps ────────────────────────────────────

export interface CycleStep {
  id: string;
  label: string;
  species: string;
  description: string;
  /** Orbital / electron configuration note */
  electronConfig?: string;
}

export interface CatalyticCycle {
  id: string;
  name: string;
  description: string;
  steps: CycleStep[];
  publicationIds: string[];
}

export const CATALYTIC_CYCLES: CatalyticCycle[] = [
  {
    id: "cycle-carbene",
    name: "Carbene Radical Cyclopropanation",
    description: "The metalloradical catalytic cycle for Co(II)-catalyzed cyclopropanation via carbene radical intermediates.",
    steps: [
      {
        id: "carbene-1",
        label: "Co(II) Porphyrin",
        species: "Co\u1D35\u1D35(Por)",
        description: "The resting-state 15-electron d\u2077 metalloradical. A stable, persistent radical.",
        electronConfig: "d\u2077 \u2014 15e\u207B complex",
      },
      {
        id: "carbene-2",
        label: "Diazo Activation",
        species: "Co\u1D35\u1D35(Por) + N\u2082=CHCO\u2082Et",
        description: "The Co(II) metalloradical activates the diazo compound via single-electron transfer. N\u2082 is extruded.",
        electronConfig: "Homolytic activation \u2014 \u0394G\u2021 lowered by radical pathway",
      },
      {
        id: "carbene-3",
        label: "Co(III)-Carbene Radical",
        species: "Co\u1D35\u1D35\u1D35(Por)(\u00B7CR\u2082)",
        description: "The key intermediate: an \u03B1-metalloalkyl radical with significant spin density on the carbene carbon. Detected by EPR spectroscopy.",
        electronConfig: "d\u2076 Co(III) + carbon radical \u2014 16e\u207B complex",
      },
      {
        id: "carbene-4",
        label: "Radical Addition to Olefin",
        species: "Co\u1D35\u1D35\u1D35(Por)(CR\u2082\u2013CH\u2082\u2013\u00B7CHAr)",
        description: "The carbene radical adds to the olefin substrate in a stepwise fashion, forming a new C\u2013C bond and generating a \u03B3-radical.",
        electronConfig: "Radical addition \u2014 stereochemistry set here",
      },
      {
        id: "carbene-5",
        label: "Intramolecular Ring Closure",
        species: "Co\u1D35\u1D35(Por) + cyclopropane",
        description: "The \u03B3-radical undergoes 3-exo-trig cyclization with concomitant homolysis of the Co\u2013C bond, regenerating the Co(II) catalyst and releasing the cyclopropane product.",
        electronConfig: "Catalyst turnover \u2014 back to d\u2077 15e\u207B",
      },
    ],
    publicationIds: ["zhang-2011-carbene-radical-evidence", "zhang-2008-olefin-cyclopropanation", "zhang-2015-acc-chem-res"],
  },
  {
    id: "cycle-nitrene",
    name: "Nitrene Radical C\u2013H Amination",
    description: "The metalloradical catalytic cycle for Co(II)-catalyzed C\u2013H amination via nitrene radical intermediates.",
    steps: [
      {
        id: "nitrene-1",
        label: "Co(II) Porphyrin",
        species: "Co\u1D35\u1D35(Por)",
        description: "The resting-state d\u2077 metalloradical. Same starting point as the carbene cycle.",
        electronConfig: "d\u2077 \u2014 15e\u207B complex",
      },
      {
        id: "nitrene-2",
        label: "Azide Activation",
        species: "Co\u1D35\u1D35(Por) + RN\u2083",
        description: "The organic azide coordinates to Co(II) and undergoes homolytic N\u2013N\u2082 cleavage. N\u2082 is the only byproduct.",
        electronConfig: "One-electron activation \u2014 no external oxidant needed",
      },
      {
        id: "nitrene-3",
        label: "Co(III)-Nitrene Radical",
        species: "Co\u1D35\u1D35\u1D35(Por)(\u00B7NR)",
        description: "An \u03B1-metalloaminyl radical (imidyl radical). Spin density resides primarily on nitrogen. Confirmed by EPR and DFT calculations.",
        electronConfig: "d\u2076 Co(III) + nitrogen radical \u2014 16e\u207B complex",
      },
      {
        id: "nitrene-4",
        label: "H-Atom Abstraction",
        species: "Co\u1D35\u1D35\u1D35(Por)(NHR) + \u00B7C\u2013",
        description: "The nitrene radical abstracts a hydrogen atom from the substrate C\u2013H bond, generating a carbon radical and a Co(III)-amido species.",
        electronConfig: "HAT: BDE(N\u2013H) > BDE(C\u2013H) \u2014 thermodynamically favorable",
      },
      {
        id: "nitrene-5",
        label: "Radical Rebound",
        species: "Co\u1D35\u1D35(Por) + R\u2013NH\u2013R\u2032",
        description: "The carbon radical rebounds to the nitrogen, forming the C\u2013N bond. Co\u2013N bond homolyzes, regenerating Co(II) and releasing the amine product.",
        electronConfig: "Catalyst turnover \u2014 back to d\u2077 15e\u207B",
      },
    ],
    publicationIds: ["zhang-2015-nitrene-radical-evidence", "zhang-2017-intermolecular-ch-amination", "zhang-2015-acc-chem-res"],
  },
];

// ─── Molecule Categories for Gallery ──────────────────────────

export interface MoleculeCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  templateIds: string[];
}

export const MOLECULE_CATEGORIES: MoleculeCategory[] = [
  {
    id: "cat-porphyrin-scaffolds",
    name: "Porphyrin Scaffolds",
    description: "Core macrocyclic ligands and building blocks for metalloradical catalysts.",
    color: "#06B6D4",
    templateIds: ["porphine", "tpp", "pyrrole-unit", "dipyrromethane", "meso-phenyl-dipyrromethane", "cobalt-porphyrin-model"],
  },
  {
    id: "cat-carbene-precursors",
    name: "Carbene Precursors",
    description: "Diazo compounds that generate carbene radical intermediates upon activation by Co(II).",
    color: "#8B5CF6",
    templateIds: ["diazo-ester", "alpha-diazoacetophenone", "ethyl-cyanodiazoacetate", "phenylsulfonyl-diazomethane", "ethyl-styryldiazoacetate"],
  },
  {
    id: "cat-nitrene-precursors",
    name: "Nitrene Precursors",
    description: "Organic azides and related reagents that serve as nitrene radical sources.",
    color: "#EC4899",
    templateIds: ["tosyl-azide", "dppa", "tcepn3", "trocn3", "tmsn3"],
  },
  {
    id: "cat-substrates-products",
    name: "Substrates & Products",
    description: "Benchmark substrates and their corresponding cyclopropane, aziridine, and aminated products.",
    color: "#F59E0B",
    templateIds: ["styrene", "cyclopropane-product", "ethyl-phenylcyclopropane", "aziridine-product"],
  },
  {
    id: "cat-synthesis-reagents",
    name: "Synthesis Reagents",
    description: "Reagents and additives used in porphyrin synthesis and catalytic reactions.",
    color: "#10B981",
    templateIds: ["bromophenyl-porphyrin-precursor", "trifluoromethylphenyl-aldehyde", "ddt-ligand", "dmap", "triphenylphosphine"],
  },
];

// ─── Helper Functions ─────────────────────────────────────────

export function getPublicationById(id: string): Publication | undefined {
  return PUBLICATIONS.find((p) => p.id === id);
}

export function getPublicationsForMolecule(templateId: string): Publication[] {
  return PUBLICATIONS.filter((p) => p.moleculeIds.includes(templateId));
}

export function getPublicationsForTheme(theme: ResearchTheme): Publication[] {
  return PUBLICATIONS.filter((p) => p.themes.includes(theme));
}

export function getPublicationUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}

export function getLandmarkPublications(): Publication[] {
  return PUBLICATIONS.filter((p) => p.landmark);
}

export function getPublicationsByYear(): Map<number, Publication[]> {
  const byYear = new Map<number, Publication[]>();
  for (const pub of PUBLICATIONS) {
    const arr = byYear.get(pub.year) ?? [];
    arr.push(pub);
    byYear.set(pub.year, arr);
  }
  return byYear;
}
