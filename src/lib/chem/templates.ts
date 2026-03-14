/**
 * Pre-built molecule templates for the library.
 *
 * Each template contains SMILES, atom positions, metadata, and context.
 * Templates are organized into collections for browsing.
 *
 * IMPORTANT: Porphyrin and metalloporphyrin structures from the Zhang Lab
 * collection are representative scaffolds inspired by published work in
 * cobalt porphyrin catalysis, radical chemistry, and C-H functionalization.
 * They are educational references — not exact reproductions of proprietary
 * catalyst structures. For authoritative structures, consult the original
 * publications.
 */

export interface MoleculeTemplate {
  id: string;
  name: string;
  smiles: string;
  description: string;
  category: TemplateCategory;
  collection?: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Why this molecule matters — shown in the library */
  context?: string;
  /** Citation or source note */
  source?: string;
}

export type TemplateCategory =
  | "basic-organic"
  | "functional-groups"
  | "ring-systems"
  | "heterocycles"
  | "amino-acids"
  | "pharmaceuticals"
  | "natural-products"
  | "porphyrins"
  | "catalysts"
  | "solvents"
  | "polymers-monomers"
  | "nucleobases"
  | "sugars"
  | "steroids"
  | "research";

export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: MoleculeTemplate[];
}

// ─── Template Definitions ───────────────────────────────────

const BASIC_ORGANIC: MoleculeTemplate[] = [
  {
    id: "methane", name: "Methane", smiles: "C",
    description: "Simplest alkane. One carbon with four hydrogens.",
    category: "basic-organic", tags: ["alkane", "simple", "gas"],
    difficulty: "beginner",
    context: "The simplest organic molecule — a great starting point.",
  },
  {
    id: "ethane", name: "Ethane", smiles: "CC",
    description: "Two carbons joined by a single bond.",
    category: "basic-organic", tags: ["alkane", "simple"],
    difficulty: "beginner",
  },
  {
    id: "ethylene", name: "Ethylene", smiles: "C=C",
    description: "Simplest alkene. A carbon-carbon double bond.",
    category: "basic-organic", tags: ["alkene", "double-bond"],
    difficulty: "beginner",
    context: "The most produced organic compound industrially.",
  },
  {
    id: "acetylene", name: "Acetylene", smiles: "C#C",
    description: "Simplest alkyne. A carbon-carbon triple bond.",
    category: "basic-organic", tags: ["alkyne", "triple-bond"],
    difficulty: "beginner",
  },
  {
    id: "propane", name: "Propane", smiles: "CCC",
    description: "Three-carbon alkane chain.",
    category: "basic-organic", tags: ["alkane"],
    difficulty: "beginner",
  },
  {
    id: "butane", name: "Butane", smiles: "CCCC",
    description: "Four-carbon straight chain alkane.",
    category: "basic-organic", tags: ["alkane"],
    difficulty: "beginner",
  },
  {
    id: "isobutane", name: "Isobutane", smiles: "CC(C)C",
    description: "Branched four-carbon alkane.",
    category: "basic-organic", tags: ["alkane", "branched"],
    difficulty: "beginner",
    context: "Same formula as butane (C4H10) but different connectivity — a structural isomer.",
  },
  {
    id: "cyclohexane", name: "Cyclohexane", smiles: "C1CCCCC1",
    description: "Six-membered carbon ring. Chair conformation.",
    category: "basic-organic", tags: ["cycloalkane", "ring"],
    difficulty: "beginner",
    context: "The most stable 6-membered ring in organic chemistry.",
  },
  {
    id: "benzene", name: "Benzene", smiles: "c1ccccc1",
    description: "The archetypal aromatic ring. Six delocalized pi electrons.",
    category: "basic-organic", tags: ["aromatic", "ring"],
    difficulty: "beginner",
    context: "The foundation of aromatic chemistry. Huckel 4n+2 rule with n=1.",
  },
  {
    id: "1,3-butadiene", name: "1,3-Butadiene", smiles: "C=CC=C",
    description: "Conjugated diene. Two double bonds separated by one single bond.",
    category: "basic-organic", tags: ["diene", "conjugated"],
    difficulty: "intermediate",
  },
];

const FUNCTIONAL_GROUPS: MoleculeTemplate[] = [
  {
    id: "methanol", name: "Methanol", smiles: "CO",
    description: "Simplest alcohol. Hydroxyl group on carbon.",
    category: "functional-groups", tags: ["alcohol", "hydroxyl"],
    difficulty: "beginner",
  },
  {
    id: "ethanol", name: "Ethanol", smiles: "CCO",
    description: "Two-carbon alcohol. The alcohol in beverages.",
    category: "functional-groups", tags: ["alcohol"],
    difficulty: "beginner",
  },
  {
    id: "acetic-acid", name: "Acetic Acid", smiles: "CC(=O)O",
    description: "Simplest carboxylic acid with a methyl group. Vinegar.",
    category: "functional-groups", tags: ["carboxylic-acid"],
    difficulty: "beginner",
  },
  {
    id: "formaldehyde", name: "Formaldehyde", smiles: "C=O",
    description: "Simplest aldehyde. A carbonyl with one hydrogen.",
    category: "functional-groups", tags: ["aldehyde", "carbonyl"],
    difficulty: "beginner",
  },
  {
    id: "acetone", name: "Acetone", smiles: "CC(=O)C",
    description: "Simplest ketone. Carbonyl flanked by two methyl groups.",
    category: "functional-groups", tags: ["ketone", "carbonyl", "solvent"],
    difficulty: "beginner",
  },
  {
    id: "methylamine", name: "Methylamine", smiles: "CN",
    description: "Simplest primary amine.",
    category: "functional-groups", tags: ["amine"],
    difficulty: "beginner",
  },
  {
    id: "dimethyl-ether", name: "Dimethyl Ether", smiles: "COC",
    description: "Simplest ether. Oxygen between two methyls.",
    category: "functional-groups", tags: ["ether"],
    difficulty: "beginner",
  },
  {
    id: "acetonitrile", name: "Acetonitrile", smiles: "CC#N",
    description: "Methyl group with a nitrile. Common solvent.",
    category: "functional-groups", tags: ["nitrile", "solvent"],
    difficulty: "beginner",
  },
  {
    id: "ethyl-acetate", name: "Ethyl Acetate", smiles: "CC(=O)OCC",
    description: "Ester. Fruity-smelling solvent.",
    category: "functional-groups", tags: ["ester", "solvent"],
    difficulty: "intermediate",
  },
  {
    id: "acetamide", name: "Acetamide", smiles: "CC(=O)N",
    description: "Simplest amide with a methyl group.",
    category: "functional-groups", tags: ["amide"],
    difficulty: "intermediate",
  },
  {
    id: "dmso", name: "DMSO", smiles: "CS(C)=O",
    description: "Dimethyl sulfoxide. Universal solvent in chemistry.",
    category: "functional-groups", tags: ["sulfoxide", "solvent"],
    difficulty: "intermediate",
  },
  {
    id: "thf", name: "THF", smiles: "C1CCOC1",
    description: "Tetrahydrofuran. Common ethereal solvent.",
    category: "functional-groups", tags: ["ether", "solvent", "ring"],
    difficulty: "intermediate",
  },
];

const HETEROCYCLES: MoleculeTemplate[] = [
  {
    id: "pyridine", name: "Pyridine", smiles: "c1ccncc1",
    description: "Six-membered aromatic ring with one nitrogen.",
    category: "heterocycles", tags: ["aromatic", "nitrogen"],
    difficulty: "intermediate",
    context: "Fundamental nitrogen heterocycle. Ubiquitous in pharmaceuticals.",
  },
  {
    id: "pyrrole", name: "Pyrrole", smiles: "c1cc[nH]c1",
    description: "Five-membered aromatic ring with NH. Key to porphyrin chemistry.",
    category: "heterocycles", tags: ["aromatic", "nitrogen"],
    difficulty: "intermediate",
    context: "Four pyrrole units make a porphyrin — the basis of heme and chlorophyll.",
  },
  {
    id: "furan", name: "Furan", smiles: "c1ccoc1",
    description: "Five-membered aromatic ring with oxygen.",
    category: "heterocycles", tags: ["aromatic", "oxygen"],
    difficulty: "intermediate",
  },
  {
    id: "thiophene", name: "Thiophene", smiles: "c1ccsc1",
    description: "Five-membered aromatic ring with sulfur.",
    category: "heterocycles", tags: ["aromatic", "sulfur"],
    difficulty: "intermediate",
  },
  {
    id: "imidazole", name: "Imidazole", smiles: "c1c[nH]cn1",
    description: "Five-membered ring with two nitrogens. Found in histidine.",
    category: "heterocycles", tags: ["aromatic", "nitrogen"],
    difficulty: "intermediate",
    context: "Critical heterocycle in biology — part of histidine, histamine, and many drugs.",
  },
  {
    id: "indole", name: "Indole", smiles: "c1ccc2[nH]ccc2c1",
    description: "Bicyclic system: benzene fused to pyrrole. Found in tryptophan.",
    category: "heterocycles", tags: ["aromatic", "bicyclic", "nitrogen"],
    difficulty: "intermediate",
  },
  {
    id: "quinoline", name: "Quinoline", smiles: "c1ccnc2ccccc12",
    description: "Benzene fused to pyridine. Antimalarial scaffold.",
    category: "heterocycles", tags: ["aromatic", "bicyclic", "nitrogen"],
    difficulty: "intermediate",
  },
  {
    id: "purine", name: "Purine", smiles: "c1ccnc2[nH]cnc12",
    description: "Bicyclic system. Scaffold of adenine and guanine.",
    category: "heterocycles", tags: ["aromatic", "bicyclic", "nucleobase"],
    difficulty: "advanced",
    context: "The purine ring is half of the genetic code — adenine and guanine are purines.",
  },
  {
    id: "pyrimidine", name: "Pyrimidine", smiles: "c1cncnc1",
    description: "Six-membered ring with two nitrogens. Scaffold of C, T, U.",
    category: "heterocycles", tags: ["aromatic", "nitrogen"],
    difficulty: "intermediate",
  },
  {
    id: "piperidine", name: "Piperidine", smiles: "C1CCNCC1",
    description: "Saturated six-membered ring with nitrogen. Common in drugs.",
    category: "heterocycles", tags: ["saturated", "nitrogen"],
    difficulty: "intermediate",
  },
  {
    id: "morpholine", name: "Morpholine", smiles: "C1COCCN1",
    description: "Six-membered ring with O and N. Pharmacophore.",
    category: "heterocycles", tags: ["saturated", "nitrogen", "oxygen"],
    difficulty: "intermediate",
  },
  {
    id: "piperazine", name: "Piperazine", smiles: "C1CNCCN1",
    description: "Six-membered ring with two nitrogens. Drug building block.",
    category: "heterocycles", tags: ["saturated", "nitrogen"],
    difficulty: "intermediate",
  },
];

const AMINO_ACIDS: MoleculeTemplate[] = [
  {
    id: "glycine", name: "Glycine", smiles: "NCC(=O)O",
    description: "Simplest amino acid. No side chain.",
    category: "amino-acids", tags: ["amino-acid", "protein"],
    difficulty: "beginner",
  },
  {
    id: "alanine", name: "Alanine", smiles: "CC(N)C(=O)O",
    description: "Amino acid with a methyl side chain.",
    category: "amino-acids", tags: ["amino-acid", "nonpolar"],
    difficulty: "beginner",
  },
  {
    id: "phenylalanine", name: "Phenylalanine", smiles: "NC(Cc1ccccc1)C(=O)O",
    description: "Amino acid with a phenyl side chain.",
    category: "amino-acids", tags: ["amino-acid", "aromatic"],
    difficulty: "intermediate",
  },
  {
    id: "tryptophan", name: "Tryptophan", smiles: "NC(Cc1c[nH]c2ccccc12)C(=O)O",
    description: "Amino acid with an indole side chain. Largest natural amino acid.",
    category: "amino-acids", tags: ["amino-acid", "aromatic", "indole"],
    difficulty: "advanced",
  },
  {
    id: "cysteine", name: "Cysteine", smiles: "NC(CS)C(=O)O",
    description: "Amino acid with a thiol side chain. Forms disulfide bonds.",
    category: "amino-acids", tags: ["amino-acid", "thiol"],
    difficulty: "intermediate",
  },
  {
    id: "histidine", name: "Histidine", smiles: "NC(Cc1cnc[nH]1)C(=O)O",
    description: "Amino acid with an imidazole side chain.",
    category: "amino-acids", tags: ["amino-acid", "imidazole"],
    difficulty: "intermediate",
  },
  {
    id: "proline", name: "Proline", smiles: "OC(=O)C1CCCN1",
    description: "Cyclic amino acid. Introduces kinks in proteins.",
    category: "amino-acids", tags: ["amino-acid", "cyclic"],
    difficulty: "intermediate",
  },
];

const PHARMACEUTICALS: MoleculeTemplate[] = [
  {
    id: "aspirin", name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O",
    description: "Acetylsalicylic acid. Anti-inflammatory, antipyretic.",
    category: "pharmaceuticals", tags: ["nsaid", "anti-inflammatory"],
    difficulty: "intermediate",
    context: "One of the most widely used drugs in history. An acetylated salicylic acid.",
  },
  {
    id: "acetaminophen", name: "Acetaminophen", smiles: "CC(=O)Nc1ccc(O)cc1",
    description: "Tylenol / paracetamol. Analgesic and antipyretic.",
    category: "pharmaceuticals", tags: ["analgesic"],
    difficulty: "intermediate",
  },
  {
    id: "ibuprofen", name: "Ibuprofen", smiles: "CC(C)Cc1ccc(C(C)C(=O)O)cc1",
    description: "NSAID. Anti-inflammatory pain reliever.",
    category: "pharmaceuticals", tags: ["nsaid"],
    difficulty: "intermediate",
  },
  {
    id: "caffeine", name: "Caffeine", smiles: "Cn1c(=O)c2c(ncn2C)n(C)c1=O",
    description: "Trimethylxanthine. The world's most consumed psychoactive substance.",
    category: "pharmaceuticals", tags: ["stimulant", "xanthine"],
    difficulty: "advanced",
    context: "A purine derivative with three methyl groups. Found in coffee, tea, and chocolate.",
  },
  {
    id: "penicillin-g", name: "Penicillin G", smiles: "CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O",
    description: "Beta-lactam antibiotic. Revolutionary drug discovery.",
    category: "pharmaceuticals", tags: ["antibiotic", "beta-lactam"],
    difficulty: "advanced",
    context: "The first widely used antibiotic. Features a strained beta-lactam ring.",
  },
  {
    id: "diazepam", name: "Diazepam", smiles: "CN1C(=O)CN=C(c2ccccc2)c2cc(Cl)ccc21",
    description: "Valium. Benzodiazepine anxiolytic.",
    category: "pharmaceuticals", tags: ["benzodiazepine"],
    difficulty: "advanced",
  },
  {
    id: "salicylic-acid", name: "Salicylic Acid", smiles: "OC(=O)c1ccccc1O",
    description: "Parent compound of aspirin. Used in skincare.",
    category: "pharmaceuticals", tags: ["phenol", "acid"],
    difficulty: "intermediate",
  },
  {
    id: "lidocaine", name: "Lidocaine", smiles: "CCN(CC)CC(=O)Nc1c(C)cccc1C",
    description: "Local anesthetic. Amide-type.",
    category: "pharmaceuticals", tags: ["anesthetic", "amide"],
    difficulty: "advanced",
  },
];

const NUCLEOBASES: MoleculeTemplate[] = [
  {
    id: "adenine", name: "Adenine", smiles: "Nc1ncnc2[nH]cnc12",
    description: "Purine nucleobase. Pairs with thymine (DNA) or uracil (RNA).",
    category: "nucleobases", tags: ["purine", "dna", "rna"],
    difficulty: "intermediate",
    context: "One of the four DNA bases. Also part of ATP, the energy currency of cells.",
  },
  {
    id: "guanine", name: "Guanine", smiles: "Nc1nc(=O)c2[nH]cnc2[nH]1",
    description: "Purine nucleobase. Pairs with cytosine.",
    category: "nucleobases", tags: ["purine", "dna", "rna"],
    difficulty: "intermediate",
  },
  {
    id: "cytosine", name: "Cytosine", smiles: "Nc1ccnc(=O)[nH]1",
    description: "Pyrimidine nucleobase. Pairs with guanine.",
    category: "nucleobases", tags: ["pyrimidine", "dna", "rna"],
    difficulty: "intermediate",
  },
  {
    id: "thymine", name: "Thymine", smiles: "Cc1c[nH]c(=O)[nH]c1=O",
    description: "Pyrimidine nucleobase. Pairs with adenine in DNA.",
    category: "nucleobases", tags: ["pyrimidine", "dna"],
    difficulty: "intermediate",
  },
  {
    id: "uracil", name: "Uracil", smiles: "O=c1cc[nH]c(=O)[nH]1",
    description: "Pyrimidine nucleobase. Replaces thymine in RNA.",
    category: "nucleobases", tags: ["pyrimidine", "rna"],
    difficulty: "intermediate",
  },
];

// ─── Zhang Lab Porphyrin Chemistry Collection ───────────────
// Structures inspired by the research of Prof. X. Peter Zhang (Boston College)
// Focus: cobalt porphyrin catalysis, metalloradical catalysis,
// carbene/nitrene transfer, radical C-H functionalization

const ZHANG_LAB_COLLECTION: MoleculeTemplate[] = [
  {
    id: "porphine", name: "Porphine (Free Base)", smiles: "c1cc2cc3ccc(cc4ccc(cc5ccc(cc1[nH]2)[nH]5)n4)[nH]3",
    description: "The unsubstituted porphyrin macrocycle. Four pyrrole units connected by methine bridges.",
    category: "porphyrins", tags: ["porphyrin", "macrocycle", "aromatic"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "The parent scaffold of all porphyrins. 18 pi electrons make it aromatic by Huckel's rule (4n+2, n=4). This macrocycle is the basis of heme, chlorophyll, and the catalysts studied in the Zhang lab.",
    source: "Core scaffold of porphyrin chemistry",
  },
  {
    id: "tpp", name: "Tetraphenylporphyrin (TPP)", smiles: "c1ccc(-c2ccc3cc4ccc(cc5ccc(cc6ccc(cc7ccc2[nH]7)[nH]6)-c2ccccc2)[nH]4)cc3-c2ccccc2)cc1",
    description: "Porphyrin with four phenyl groups at meso positions. Widely used model porphyrin.",
    category: "porphyrins", tags: ["porphyrin", "meso-substituted", "phenyl"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "TPP is one of the most studied porphyrins. The four meso-phenyl groups provide steric and electronic tunability. The Zhang lab uses modified TPP scaffolds as ligands for cobalt-catalyzed radical reactions.",
    source: "Foundational porphyrin ligand in Zhang lab catalysis",
  },
  {
    id: "pyrrole-unit", name: "Pyrrole", smiles: "c1cc[nH]c1",
    description: "The building block of porphyrins. Five-membered aromatic ring with NH.",
    category: "porphyrins", tags: ["pyrrole", "heterocycle", "building-block"],
    difficulty: "intermediate",
    collection: "zhang-lab",
    context: "Porphyrins are built from four pyrrole units. Understanding pyrrole is essential to understanding porphyrin chemistry.",
    source: "Porphyrin building block",
  },
  {
    id: "dipyrromethane", name: "Dipyrromethane", smiles: "c1cc[nH]c1Cc1cc[nH]c1",
    description: "Two pyrroles connected by a methylene bridge. Key intermediate in porphyrin synthesis.",
    category: "porphyrins", tags: ["pyrrole", "intermediate", "synthesis"],
    difficulty: "intermediate",
    collection: "zhang-lab",
    context: "Dipyrromethane is a key precursor in the Lindsey synthesis of meso-substituted porphyrins — the standard route used in the Zhang lab.",
    source: "Lindsey porphyrin synthesis intermediate",
  },
  {
    id: "meso-phenyl-dipyrromethane", name: "5-Phenyldipyrromethane", smiles: "c1cc[nH]c1C(c1ccccc1)c1cc[nH]c1",
    description: "Dipyrromethane with a phenyl group. Direct precursor to meso-phenyl porphyrins.",
    category: "porphyrins", tags: ["pyrrole", "phenyl", "intermediate"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "Condensation of two of these with an aldehyde gives a trans-A2B2 porphyrin — a common pattern in Zhang lab catalyst design.",
    source: "Porphyrin precursor",
  },
  {
    id: "cobalt-porphyrin-model", name: "Cobalt(II) Porphyrin (Simplified)", smiles: "c1cc2cc3ccc(cc4ccc(cc5ccc(cc1[nH]2)n5)n4)n3",
    description: "Simplified cobalt porphyrin representation. The Co center is coordinated by 4 pyrrole nitrogens.",
    category: "catalysts", tags: ["cobalt", "porphyrin", "metalloporphyrin", "catalyst"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "Cobalt(II) porphyrins are the signature catalysts of the Zhang lab. The Co(II) center generates metalloradical intermediates — cobalt-carbene and cobalt-nitrene radicals — that enable unprecedented C-H functionalization reactions. Note: Valence Studio partially supports metalloporphyrins; the Co-N coordination is represented structurally but coordination chemistry validation is limited.",
    source: "Zhang lab, Acc. Chem. Res. 2015, JACS multiple publications",
  },
  {
    id: "diazo-ester", name: "Ethyl Diazoacetate (EDA)", smiles: "CCOC(=O)C=[N+]=[N-]",
    description: "Classic carbene precursor. Decomposes to form a carbene intermediate.",
    category: "catalysts", tags: ["carbene", "diazo", "reagent"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "EDA is one of the most important carbene precursors in the Zhang lab's work. Cobalt porphyrins decompose diazo compounds to form cobalt-carbene radicals, which then insert into C-H bonds.",
    source: "Key reagent in Zhang lab radical C-H functionalization",
  },
  {
    id: "tosyl-azide", name: "Tosyl Azide", smiles: "Cc1ccc(S(=O)(=O)N=[N+]=[N-])cc1",
    description: "Sulfonyl azide. Nitrene precursor for C-H amination.",
    category: "catalysts", tags: ["nitrene", "azide", "reagent", "amination"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "Sulfonyl azides are nitrene precursors in Zhang lab's cobalt-catalyzed C-H amination reactions. The cobalt porphyrin generates a cobalt-nitrene radical that inserts into C-H bonds.",
    source: "Zhang lab nitrene chemistry, Nature Chem., Angew. Chem.",
  },
  {
    id: "cyclopropane-product", name: "1,1-Disubstituted Cyclopropane", smiles: "C1(C(=O)OCC)C(c2ccccc2)C1",
    description: "Cyclopropane product from carbene cycloaddition.",
    category: "research", tags: ["cyclopropane", "product", "carbene"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "Cyclopropanes are key products of the Zhang lab's cobalt-catalyzed carbene chemistry. The metalloradical mechanism enables high enantioselectivity — a major advance over traditional approaches.",
    source: "Product of Zhang lab radical cyclopropanation",
  },
  {
    id: "aziridine-product", name: "N-Tosyl Aziridine", smiles: "C1(c2ccccc2)C1NS(=O)(=O)c1ccc(C)cc1",
    description: "Aziridine from nitrene [2+1] cycloaddition to an alkene.",
    category: "research", tags: ["aziridine", "product", "nitrene"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "Aziridines are three-membered nitrogen heterocycles formed by Zhang lab's cobalt-catalyzed nitrene chemistry. The radical mechanism allows access to stereochemistry not achievable by ionic pathways.",
    source: "Product of Zhang lab radical aziridination",
  },
  {
    id: "bromophenyl-porphyrin-precursor", name: "4-Bromobenzaldehyde", smiles: "O=Cc1ccc(Br)cc1",
    description: "Aldehyde building block for porphyrin synthesis with a bromo handle for cross-coupling.",
    category: "porphyrins", tags: ["aldehyde", "building-block", "cross-coupling"],
    difficulty: "intermediate",
    collection: "zhang-lab",
    context: "Aryl aldehydes condense with pyrrole to form meso-substituted porphyrins. The bromine provides a handle for palladium-catalyzed cross-coupling to install additional functionality.",
    source: "Porphyrin synthesis building block",
  },
  {
    id: "trifluoromethylphenyl-aldehyde", name: "3,5-Bis(trifluoromethyl)benzaldehyde", smiles: "O=Cc1cc(C(F)(F)F)cc(C(F)(F)F)c1",
    description: "Electron-poor aryl aldehyde for porphyrin synthesis.",
    category: "porphyrins", tags: ["aldehyde", "fluorinated", "electron-poor"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "The Zhang lab uses electron-poor aryl groups on porphyrins to tune the reactivity of the cobalt center. The CF3 groups withdraw electron density and increase catalytic activity for certain radical transformations.",
    source: "Used in Zhang lab catalyst optimization",
  },
  {
    id: "dmap", name: "DMAP (4-Dimethylaminopyridine)", smiles: "CN(C)c1ccncc1",
    description: "Nucleophilic catalyst and base frequently used in organic synthesis.",
    category: "catalysts", tags: ["base", "catalyst", "pyridine"],
    difficulty: "intermediate",
    collection: "zhang-lab",
    context: "DMAP is a versatile nucleophilic catalyst used in many synthetic steps during porphyrin and catalyst preparation.",
  },
  {
    id: "ddt-ligand", name: "DDQ", smiles: "ClC1=C(Cl)C(=O)C(C#N)=C(C#N)C1=O",
    description: "2,3-Dichloro-5,6-dicyano-1,4-benzoquinone. Oxidant for porphyrin synthesis.",
    category: "catalysts", tags: ["oxidant", "reagent"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "DDQ is the standard oxidant used to aromatize porphyrinogens (reduced porphyrins) to porphyrins. Essential in Lindsey-type porphyrin synthesis used extensively in the Zhang lab.",
    source: "Key reagent in porphyrin synthesis",
  },
  {
    id: "styrene", name: "Styrene", smiles: "C=Cc1ccccc1",
    description: "Vinyl benzene. Common substrate for cyclopropanation and aziridination.",
    category: "research", tags: ["alkene", "substrate"],
    difficulty: "beginner",
    collection: "zhang-lab",
    context: "Styrene is one of the benchmark substrates for testing cobalt porphyrin-catalyzed radical cyclopropanation and aziridination in the Zhang lab.",
    source: "Benchmark substrate",
  },
  {
    id: "alpha-diazoacetophenone", name: "alpha-Diazoacetophenone", smiles: "O=C(C=[N+]=[N-])c1ccccc1",
    description: "Aryl-substituted diazo compound. Donor/acceptor carbene precursor.",
    category: "catalysts", tags: ["diazo", "carbene", "donor-acceptor"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "Donor/acceptor carbene precursors are used in the Zhang lab's metalloradical catalysis to achieve high selectivity in C-H functionalization. The phenyl group stabilizes the radical intermediate.",
    source: "Carbene source for Zhang lab selectivity studies",
  },
  {
    id: "tmsn3", name: "Trimethylsilyl Azide (TMSN3)", smiles: "C[Si](C)(C)N=[N+]=[N-]",
    description: "Silicon-protected azide. Mild nitrene source.",
    category: "catalysts", tags: ["azide", "nitrene", "silicon"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "TMSN3 and related organic azides are used as nitrene precursors in the Zhang lab's cobalt-catalyzed amination chemistry.",
    source: "Nitrene source reagent",
  },
  {
    id: "dppa", name: "Diphenyl Phosphoryl Azide (DPPA)", smiles: "O=P(Oc1ccccc1)(Oc1ccccc1)N=[N+]=[N-]",
    description: "Phosphoryl azide. Nitrene source for aziridination.",
    category: "catalysts", tags: ["azide", "nitrene", "phosphoryl", "aziridination"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "DPPA is a key nitrene source in the Zhang lab's cobalt-catalyzed asymmetric aziridination, producing N-phosphoryl aziridines with high enantioselectivity.",
    source: "Zhang et al., BJOC 2014, 10, 1282",
  },
  {
    id: "tcepn3", name: "Bis(2,2,2-trichloroethyl) Phosphoryl Azide (TcepN3)", smiles: "O=P(OCC(Cl)(Cl)Cl)(OCC(Cl)(Cl)Cl)N=[N+]=[N-]",
    description: "Specialized phosphoryl azide for low-temperature aziridination.",
    category: "catalysts", tags: ["azide", "nitrene", "phosphoryl", "asymmetric"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "TcepN3 enables low-temperature asymmetric aziridination with Co(II) chiral porphyrin catalysts, achieving excellent enantioselectivity.",
    source: "Zhang metalloradical catalysis studies",
  },
  {
    id: "trocn3", name: "Trichloroethoxycarbonyl Azide (TrocN3)", smiles: "O=C(OCC(Cl)(Cl)Cl)N=[N+]=[N-]",
    description: "Carbonyl azide nitrene source.",
    category: "catalysts", tags: ["azide", "nitrene", "carbonyl"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "TrocN3 is used as a nitrene source in the Zhang lab's asymmetric aziridination to produce N-carbonyl aziridines.",
    source: "Zhang metalloradical catalysis studies",
  },
  {
    id: "ethyl-cyanodiazoacetate", name: "Ethyl alpha-Cyanodiazoacetate", smiles: "CCOC(=O)C(C#N)=[N+]=[N-]",
    description: "Acceptor/acceptor diazo reagent for stereoselective cyclopropanation.",
    category: "catalysts", tags: ["diazo", "carbene", "cyano", "cyclopropanation"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "This acceptor/acceptor diazo reagent is used in the Zhang lab's Co(II)-catalyzed stereoselective cyclopropanation reactions.",
    source: "Zhang metalloradical catalysis studies",
  },
  {
    id: "phenylsulfonyl-diazomethane", name: "Phenylsulfonyl Diazomethane", smiles: "O=S(=O)(c1ccccc1)C=[N+]=[N-]",
    description: "Diazosulfone for asymmetric cyclopropanation.",
    category: "catalysts", tags: ["diazo", "carbene", "sulfonyl", "cyclopropanation"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "Diazosulfones are used as carbene precursors in Co(II)-catalyzed asymmetric cyclopropanation with chiral porphyrin ligands.",
    source: "Zhang metalloradical catalysis studies",
  },
  {
    id: "ethyl-styryldiazoacetate", name: "Ethyl Styryldiazoacetate", smiles: "CCOC(=O)C(=[N+]=[N-])/C=C/c1ccccc1",
    description: "Donor/acceptor diazo with vinyl group. Used to trap radical intermediates.",
    category: "catalysts", tags: ["diazo", "carbene", "donor-acceptor", "vinyl"],
    difficulty: "advanced",
    collection: "zhang-lab",
    context: "This donor/acceptor diazo reagent was used to trap and characterize Co(III)-vinylcarbene radical intermediates, providing key evidence for the metalloradical mechanism.",
    source: "Zhang et al., JACS 2011",
  },
  {
    id: "triphenylphosphine", name: "Triphenylphosphine", smiles: "c1ccc(cc1)P(c1ccccc1)c1ccccc1",
    description: "Phosphine ligand and additive in catalysis.",
    category: "catalysts", tags: ["phosphine", "ligand", "olefination"],
    difficulty: "intermediate",
    collection: "zhang-lab",
    context: "Triphenylphosphine is used as an additive in Co(TPP)-catalyzed selective olefination of carbonyl compounds with EDA.",
    source: "Zhang catalysis studies",
  },
  {
    id: "ethyl-phenylcyclopropane", name: "Ethyl 2-Phenylcyclopropane-1-carboxylate", smiles: "CCOC(=O)C1CC1c1ccccc1",
    description: "Benchmark cyclopropanation product (styrene + EDA).",
    category: "research", tags: ["cyclopropane", "product", "benchmark"],
    difficulty: "intermediate",
    collection: "zhang-lab",
    context: "This is the benchmark product from cyclopropanation of styrene with EDA — the model reaction used to develop and optimize metalloradical catalysts.",
    source: "Zhang metalloradical catalysis studies",
  },
];

const NATURAL_PRODUCTS: MoleculeTemplate[] = [
  {
    id: "cholesterol", name: "Cholesterol", smiles: "CC(C)CCCC(C)C1CCC2C1(C)CCC1C2CC=C2CC(O)CCC12C",
    description: "Essential steroid. Cell membrane component.",
    category: "steroids", tags: ["steroid", "lipid"],
    difficulty: "advanced",
    context: "The most abundant steroid in the body. A tetracyclic ring system.",
  },
  {
    id: "citric-acid", name: "Citric Acid", smiles: "OC(=O)CC(O)(CC(O)=O)C(O)=O",
    description: "Key intermediate in the Krebs cycle.",
    category: "natural-products", tags: ["acid", "metabolism"],
    difficulty: "intermediate",
  },
  {
    id: "glucose", name: "D-Glucose (Open Chain)", smiles: "OCC(O)C(O)C(O)C(O)C=O",
    description: "The most important monosaccharide. Energy source for cells.",
    category: "sugars", tags: ["sugar", "monosaccharide"],
    difficulty: "intermediate",
  },
  {
    id: "nicotine", name: "Nicotine", smiles: "CN1CCCC1c1cccnc1",
    description: "Alkaloid from tobacco. Acetylcholine receptor agonist.",
    category: "natural-products", tags: ["alkaloid"],
    difficulty: "advanced",
  },
  {
    id: "capsaicin", name: "Capsaicin", smiles: "COc1cc(CNC(=O)CCCC/C=C/C(C)C)ccc1O",
    description: "The compound responsible for chili pepper heat.",
    category: "natural-products", tags: ["vanilloid", "spicy"],
    difficulty: "advanced",
  },
  {
    id: "limonene", name: "Limonene", smiles: "CC1=CCC(CC1)C(=C)C",
    description: "Citrus terpene. Pleasant lemon scent.",
    category: "natural-products", tags: ["terpene", "monoterpene"],
    difficulty: "intermediate",
  },
];

// ─── Collections ────────────────────────────────────────────

export const TEMPLATE_COLLECTIONS: TemplateCollection[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Simple molecules to learn the basics of molecular structure.",
    icon: "▶",
    templates: BASIC_ORGANIC,
  },
  {
    id: "functional-groups",
    name: "Functional Groups",
    description: "Core functional groups in organic chemistry.",
    icon: "◆",
    templates: FUNCTIONAL_GROUPS,
  },
  {
    id: "heterocycles",
    name: "Heterocycles",
    description: "Ring systems with heteroatoms. The backbone of drug design.",
    icon: "⬡",
    templates: HETEROCYCLES,
  },
  {
    id: "amino-acids",
    name: "Amino Acids",
    description: "The 20 standard amino acids — building blocks of proteins.",
    icon: "◎",
    templates: AMINO_ACIDS,
  },
  {
    id: "pharmaceuticals",
    name: "Pharmaceuticals",
    description: "Well-known drug molecules and their structures.",
    icon: "✦",
    templates: PHARMACEUTICALS,
  },
  {
    id: "nucleobases",
    name: "Nucleobases",
    description: "The bases of DNA and RNA — A, G, C, T, U.",
    icon: "◇",
    templates: NUCLEOBASES,
  },
  {
    id: "natural-products",
    name: "Natural Products",
    description: "Molecules from nature — terpenes, steroids, alkaloids.",
    icon: "❋",
    templates: NATURAL_PRODUCTS,
  },
  {
    id: "zhang-lab",
    name: "Zhang Lab — Porphyrin & Radical Chemistry",
    description: "Molecules from the research of Prof. X. Peter Zhang at Boston College. Cobalt porphyrin catalysis, metalloradical chemistry, radical C-H functionalization, and carbene/nitrene transfer reactions.",
    icon: "⬢",
    templates: ZHANG_LAB_COLLECTION,
  },
];

/** Get all templates as a flat list */
export function getAllTemplates(): MoleculeTemplate[] {
  return TEMPLATE_COLLECTIONS.flatMap((c) => c.templates);
}

/** Search templates by name, description, or tags */
export function searchTemplates(query: string): MoleculeTemplate[] {
  if (!query || query.length < 2) return [];

  const lower = query.toLowerCase();
  return getAllTemplates().filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.includes(lower)) ||
      (t.context && t.context.toLowerCase().includes(lower))
  );
}

/** Get templates by difficulty */
export function getBeginnerTemplates(): MoleculeTemplate[] {
  return getAllTemplates().filter((t) => t.difficulty === "beginner");
}
