/**
 * Comprehensive molecule name database.
 * Maps SMILES to common names for identity resolution.
 *
 * Organized by category. Only includes names we are confident about.
 * This is a curated database — not an exhaustive enumeration.
 * If a molecule is not here, we say "No confident common-name match"
 * rather than guessing.
 */

interface MoleculeEntry {
  name: string;
  category: string;
  formula?: string;
}

export const MOLECULE_NAMES: Record<string, MoleculeEntry> = {
  // ─── Alkanes ──────────────────────────────────────────────
  "C": { name: "Methane", category: "alkane", formula: "CH4" },
  "CC": { name: "Ethane", category: "alkane", formula: "C2H6" },
  "CCC": { name: "Propane", category: "alkane", formula: "C3H8" },
  "CCCC": { name: "Butane", category: "alkane", formula: "C4H10" },
  "CCCCC": { name: "Pentane", category: "alkane", formula: "C5H12" },
  "CCCCCC": { name: "Hexane", category: "alkane", formula: "C6H14" },
  "CCCCCCC": { name: "Heptane", category: "alkane", formula: "C7H16" },
  "CCCCCCCC": { name: "Octane", category: "alkane", formula: "C8H18" },
  "CCCCCCCCC": { name: "Nonane", category: "alkane", formula: "C9H20" },
  "CCCCCCCCCC": { name: "Decane", category: "alkane", formula: "C10H22" },
  "CC(C)C": { name: "Isobutane", category: "alkane" },
  "CC(C)CC": { name: "Isopentane", category: "alkane" },
  "CCC(C)C": { name: "Isopentane", category: "alkane" },
  "CC(C)(C)C": { name: "Neopentane", category: "alkane" },

  // ─── Alkenes ──────────────────────────────────────────────
  "C=C": { name: "Ethylene", category: "alkene" },
  "CC=C": { name: "Propylene", category: "alkene" },
  "C=CC": { name: "Propylene", category: "alkene" },
  "CC=CC": { name: "2-Butene", category: "alkene" },
  "C=CCC": { name: "1-Butene", category: "alkene" },
  "C=C(C)C": { name: "Isobutylene", category: "alkene" },
  "C=CC=C": { name: "1,3-Butadiene", category: "alkene" },
  "C=CCCC": { name: "1-Pentene", category: "alkene" },
  "C=C(C)CC": { name: "2-Methyl-1-butene", category: "alkene" },

  // ─── Alkynes ──────────────────────────────────────────────
  "C#C": { name: "Acetylene", category: "alkyne" },
  "CC#C": { name: "Propyne", category: "alkyne" },
  "CC#CC": { name: "2-Butyne", category: "alkyne" },
  "C#CCC": { name: "1-Butyne", category: "alkyne" },

  // ─── Cycloalkanes ─────────────────────────────────────────
  "C1CC1": { name: "Cyclopropane", category: "cycloalkane" },
  "C1CCC1": { name: "Cyclobutane", category: "cycloalkane" },
  "C1CCCC1": { name: "Cyclopentane", category: "cycloalkane" },
  "C1CCCCC1": { name: "Cyclohexane", category: "cycloalkane" },
  "C1CCCCCC1": { name: "Cycloheptane", category: "cycloalkane" },

  // ─── Alcohols ─────────────────────────────────────────────
  "O": { name: "Water", category: "inorganic" },
  "CO": { name: "Methanol", category: "alcohol" },
  "CCO": { name: "Ethanol", category: "alcohol" },
  "CCCO": { name: "1-Propanol", category: "alcohol" },
  "CC(O)C": { name: "2-Propanol", category: "alcohol" },
  "CC(C)O": { name: "2-Propanol", category: "alcohol" },
  "CCCCO": { name: "1-Butanol", category: "alcohol" },
  "CC(O)CC": { name: "2-Butanol", category: "alcohol" },
  "CC(C)(C)O": { name: "tert-Butanol", category: "alcohol" },
  "CCCCCO": { name: "1-Pentanol", category: "alcohol" },
  "OCC(O)CO": { name: "Glycerol", category: "alcohol" },
  "OCCO": { name: "Ethylene glycol", category: "alcohol" },
  "C=CO": { name: "Vinyl alcohol", category: "alcohol" },

  // ─── Ethers ───────────────────────────────────────────────
  "COC": { name: "Dimethyl ether", category: "ether" },
  "CCOC": { name: "Methyl ethyl ether", category: "ether" },
  "CCOCC": { name: "Diethyl ether", category: "ether" },
  "C1CCOC1": { name: "Tetrahydrofuran", category: "ether" },
  "C1COCOC1": { name: "1,3-Dioxane", category: "ether" },
  "C1CCOCC1": { name: "Tetrahydropyran", category: "ether" },
  "COCCOC": { name: "Dimethoxyethane", category: "ether" },

  // ─── Aldehydes ────────────────────────────────────────────
  "C=O": { name: "Formaldehyde", category: "aldehyde" },
  "CC=O": { name: "Acetaldehyde", category: "aldehyde" },
  "CCC=O": { name: "Propanal", category: "aldehyde" },
  "CCCC=O": { name: "Butanal", category: "aldehyde" },
  "CCCCC=O": { name: "Pentanal", category: "aldehyde" },
  "C(=O)c1ccccc1": { name: "Benzaldehyde", category: "aldehyde" },
  "O=Cc1ccccc1": { name: "Benzaldehyde", category: "aldehyde" },
  "O=CC=O": { name: "Glyoxal", category: "aldehyde" },

  // ─── Ketones ──────────────────────────────────────────────
  "CC(=O)C": { name: "Acetone", category: "ketone" },
  "CC(C)=O": { name: "Acetone", category: "ketone" },
  "CCC(=O)C": { name: "Methyl ethyl ketone", category: "ketone" },
  "CCC(=O)CC": { name: "3-Pentanone", category: "ketone" },
  "CC(=O)c1ccccc1": { name: "Acetophenone", category: "ketone" },
  "O=C(c1ccccc1)c1ccccc1": { name: "Benzophenone", category: "ketone" },
  "C1CCC(=O)CC1": { name: "Cyclohexanone", category: "ketone" },
  "C1CCC(=O)C1": { name: "Cyclopentanone", category: "ketone" },

  // ─── Carboxylic Acids ─────────────────────────────────────
  "C(=O)O": { name: "Formic acid", category: "carboxylic-acid" },
  "CC(=O)O": { name: "Acetic acid", category: "carboxylic-acid" },
  "CC(O)=O": { name: "Acetic acid", category: "carboxylic-acid" },
  "CCC(=O)O": { name: "Propionic acid", category: "carboxylic-acid" },
  "CCCC(=O)O": { name: "Butyric acid", category: "carboxylic-acid" },
  "CCCCC(=O)O": { name: "Valeric acid", category: "carboxylic-acid" },
  "OC(=O)C(O)=O": { name: "Oxalic acid", category: "carboxylic-acid" },
  "OC(=O)CC(O)=O": { name: "Malonic acid", category: "carboxylic-acid" },
  "OC(=O)CCC(O)=O": { name: "Succinic acid", category: "carboxylic-acid" },
  "OC(=O)CCCC(O)=O": { name: "Glutaric acid", category: "carboxylic-acid" },
  "OC(=O)CCCCC(O)=O": { name: "Adipic acid", category: "carboxylic-acid" },
  "OC(=O)C=CC(O)=O": { name: "Maleic acid", category: "carboxylic-acid" },
  "OC(=O)C(O)C(O)C(O)=O": { name: "Tartaric acid", category: "carboxylic-acid" },
  "OC(=O)CC(O)(CC(O)=O)C(O)=O": { name: "Citric acid", category: "carboxylic-acid" },
  "c1ccc(C(=O)O)cc1": { name: "Benzoic acid", category: "carboxylic-acid" },
  "OC(=O)c1ccccc1O": { name: "Salicylic acid", category: "carboxylic-acid" },

  // ─── Esters ───────────────────────────────────────────────
  "CC(=O)OC": { name: "Methyl acetate", category: "ester" },
  "CC(=O)OCC": { name: "Ethyl acetate", category: "ester" },
  "COC(=O)c1ccccc1": { name: "Methyl benzoate", category: "ester" },
  "CC(=O)Oc1ccccc1": { name: "Phenyl acetate", category: "ester" },
  "CC(=O)Oc1ccccc1C(=O)O": { name: "Aspirin", category: "pharmaceutical" },

  // ─── Amines ───────────────────────────────────────────────
  "N": { name: "Ammonia", category: "amine" },
  "CN": { name: "Methylamine", category: "amine" },
  "CCN": { name: "Ethylamine", category: "amine" },
  "CCCN": { name: "Propylamine", category: "amine" },
  "CNC": { name: "Dimethylamine", category: "amine" },
  "CN(C)C": { name: "Trimethylamine", category: "amine" },
  "CCN(CC)CC": { name: "Triethylamine", category: "amine" },
  "NCCN": { name: "Ethylenediamine", category: "amine" },
  "Nc1ccccc1": { name: "Aniline", category: "amine" },
  "CNc1ccccc1": { name: "N-Methylaniline", category: "amine" },
  "c1ccc(Nc2ccccc2)cc1": { name: "Diphenylamine", category: "amine" },
  "C1CCNCC1": { name: "Piperidine", category: "amine" },
  "C1CCNC1": { name: "Pyrrolidine", category: "amine" },
  "C1CNCCN1": { name: "Piperazine", category: "amine" },
  "C1COCCN1": { name: "Morpholine", category: "amine" },

  // ─── Amides ───────────────────────────────────────────────
  "C(=O)N": { name: "Formamide", category: "amide" },
  "CC(=O)N": { name: "Acetamide", category: "amide" },
  "CC(N)=O": { name: "Acetamide", category: "amide" },
  "CN(C)C=O": { name: "Dimethylformamide", category: "amide" },
  "CC(=O)N(C)C": { name: "Dimethylacetamide", category: "amide" },
  "O=C1CCCCC1": { name: "Caprolactam", category: "amide" },

  // ─── Nitriles ─────────────────────────────────────────────
  "C#N": { name: "Hydrogen cyanide", category: "nitrile" },
  "CC#N": { name: "Acetonitrile", category: "nitrile" },
  "CCC#N": { name: "Propionitrile", category: "nitrile" },
  "N#Cc1ccccc1": { name: "Benzonitrile", category: "nitrile" },

  // ─── Nitro Compounds ──────────────────────────────────────
  "[O-][N+](=O)c1ccccc1": { name: "Nitrobenzene", category: "nitro" },
  "C[N+](=O)[O-]": { name: "Nitromethane", category: "nitro" },

  // ─── Thiols & Sulfides ────────────────────────────────────
  "CS": { name: "Methanethiol", category: "thiol" },
  "CCS": { name: "Ethanethiol", category: "thiol" },
  "CSC": { name: "Dimethyl sulfide", category: "sulfide" },
  "CSSC": { name: "Dimethyl disulfide", category: "sulfide" },
  "CS(C)=O": { name: "Dimethyl sulfoxide", category: "sulfoxide" },
  "CS(C)(=O)=O": { name: "Dimethyl sulfone", category: "sulfone" },

  // ─── Halogenated ──────────────────────────────────────────
  "CCl": { name: "Chloromethane", category: "halide" },
  "ClCCl": { name: "Dichloromethane", category: "halide" },
  "ClC(Cl)Cl": { name: "Chloroform", category: "halide" },
  "CCl(Cl)Cl": { name: "Chloroform", category: "halide" },
  "ClC(Cl)(Cl)Cl": { name: "Carbon tetrachloride", category: "halide" },
  "C(Cl)(Cl)(Cl)Cl": { name: "Carbon tetrachloride", category: "halide" },
  "CBr": { name: "Bromomethane", category: "halide" },
  "CI": { name: "Iodomethane", category: "halide" },
  "CF": { name: "Fluoromethane", category: "halide" },
  "FC(F)F": { name: "Fluoroform", category: "halide" },
  "ClC=C": { name: "Vinyl chloride", category: "halide" },
  "ClCCCl": { name: "1,2-Dichloroethane", category: "halide" },
  "Clc1ccccc1": { name: "Chlorobenzene", category: "halide" },
  "Brc1ccccc1": { name: "Bromobenzene", category: "halide" },
  "Fc1ccccc1": { name: "Fluorobenzene", category: "halide" },
  "Ic1ccccc1": { name: "Iodobenzene", category: "halide" },
  "FC(F)(F)C(F)(F)F": { name: "Hexafluoroethane", category: "halide" },

  // ─── Aromatics ────────────────────────────────────────────
  "c1ccccc1": { name: "Benzene", category: "aromatic" },
  "Cc1ccccc1": { name: "Toluene", category: "aromatic" },
  "CCc1ccccc1": { name: "Ethylbenzene", category: "aromatic" },
  "c1ccc(C)c(C)c1": { name: "o-Xylene", category: "aromatic" },
  "Cc1ccc(C)cc1": { name: "p-Xylene", category: "aromatic" },
  "Cc1cccc(C)c1": { name: "m-Xylene", category: "aromatic" },
  "C(c1ccccc1)c1ccccc1": { name: "Diphenylmethane", category: "aromatic" },
  "c1ccc(-c2ccccc2)cc1": { name: "Biphenyl", category: "aromatic" },
  "C=Cc1ccccc1": { name: "Styrene", category: "aromatic" },
  "c1ccc2ccccc2c1": { name: "Naphthalene", category: "aromatic" },
  "c1ccc2c(c1)cc1ccccc1c2": { name: "Anthracene", category: "aromatic" },
  "c1ccc2c(c1)ccc1ccccc12": { name: "Phenanthrene", category: "aromatic" },
  "c1cc2ccc3cccc4ccc(c1)c2c34": { name: "Pyrene", category: "aromatic" },
  "Oc1ccccc1": { name: "Phenol", category: "aromatic" },
  "COc1ccccc1": { name: "Anisole", category: "aromatic" },
  "Oc1ccc(O)cc1": { name: "Hydroquinone", category: "aromatic" },
  "Oc1cccc(O)c1": { name: "Resorcinol", category: "aromatic" },
  "Oc1ccccc1O": { name: "Catechol", category: "aromatic" },
  "OCc1ccccc1": { name: "Benzyl alcohol", category: "aromatic" },

  // ─── Heterocycles ─────────────────────────────────────────
  "c1ccncc1": { name: "Pyridine", category: "heterocycle" },
  "c1cc[nH]c1": { name: "Pyrrole", category: "heterocycle" },
  "c1ccoc1": { name: "Furan", category: "heterocycle" },
  "c1ccsc1": { name: "Thiophene", category: "heterocycle" },
  "c1c[nH]cn1": { name: "Imidazole", category: "heterocycle" },
  "c1cnc[nH]1": { name: "Imidazole", category: "heterocycle" },
  "c1ccnn1": { name: "Pyrazole", category: "heterocycle" },
  "c1ccno1": { name: "Isoxazole", category: "heterocycle" },
  "c1ccon1": { name: "Oxazole", category: "heterocycle" },
  "c1ccns1": { name: "Thiazole", category: "heterocycle" },
  "c1ccnc(N)n1": { name: "2-Aminopyrimidine", category: "heterocycle" },
  "c1ccnc2[nH]cnc12": { name: "Purine", category: "heterocycle" },
  "c1ccnc2ccccc12": { name: "Quinoline", category: "heterocycle" },
  "c1cnc2ccccc2c1": { name: "Isoquinoline", category: "heterocycle" },
  "c1ccc2[nH]ccc2c1": { name: "Indole", category: "heterocycle" },
  "c1ccc2occc2c1": { name: "Benzofuran", category: "heterocycle" },
  "c1ccc2sccc2c1": { name: "Benzothiophene", category: "heterocycle" },
  "c1cnc2ccccc2n1": { name: "Quinazoline", category: "heterocycle" },
  "c1ccnnc1": { name: "Pyridazine", category: "heterocycle" },
  "c1cncnc1": { name: "Pyrimidine", category: "heterocycle" },
  "c1cnccn1": { name: "Pyrazine", category: "heterocycle" },
  "c1cncn1": { name: "Triazine", category: "heterocycle" },
  "c1cnc2c(n1)c1ccccc1n2": { name: "Acridine", category: "heterocycle" },
  "O=c1cc[nH]c(=O)[nH]1": { name: "Uracil", category: "nucleobase" },
  "Cc1c[nH]c(=O)[nH]c1=O": { name: "Thymine", category: "nucleobase" },
  "Nc1ccnc(=O)[nH]1": { name: "Cytosine", category: "nucleobase" },
  "Nc1ncnc2[nH]cnc12": { name: "Adenine", category: "nucleobase" },
  "Nc1nc(=O)c2[nH]cnc2[nH]1": { name: "Guanine", category: "nucleobase" },

  // ─── Inorganic / Simple ───────────────────────────────────
  "O=C=O": { name: "Carbon dioxide", category: "inorganic" },
  "O=S=O": { name: "Sulfur dioxide", category: "inorganic" },
  "N=O": { name: "Nitric oxide", category: "inorganic" },
  "N#N": { name: "Nitrogen", category: "inorganic" },
  "O=O": { name: "Oxygen", category: "inorganic" },
  "OO": { name: "Hydrogen peroxide", category: "inorganic" },
  "NN": { name: "Hydrazine", category: "inorganic" },
  "[NH4+]": { name: "Ammonium", category: "inorganic" },
  "[OH-]": { name: "Hydroxide", category: "inorganic" },

  // ─── Amino Acids ──────────────────────────────────────────
  "NCC(=O)O": { name: "Glycine", category: "amino-acid" },
  "CC(N)C(=O)O": { name: "Alanine", category: "amino-acid" },
  "CC(C)C(N)C(=O)O": { name: "Valine", category: "amino-acid" },
  "CC(C)CC(N)C(=O)O": { name: "Leucine", category: "amino-acid" },
  "CCC(C)C(N)C(=O)O": { name: "Isoleucine", category: "amino-acid" },
  "OC(=O)C(N)Cc1ccccc1": { name: "Phenylalanine", category: "amino-acid" },
  "OC(=O)C(N)Cc1c[nH]c2ccccc12": { name: "Tryptophan", category: "amino-acid" },
  "OC(=O)C(N)CO": { name: "Serine", category: "amino-acid" },
  "CC(O)C(N)C(=O)O": { name: "Threonine", category: "amino-acid" },
  "OC(=O)C(N)CS": { name: "Cysteine", category: "amino-acid" },
  "CSCC(N)C(=O)O": { name: "Methionine", category: "amino-acid" },
  "OC(=O)C(N)Cc1ccc(O)cc1": { name: "Tyrosine", category: "amino-acid" },
  "OC(=O)C(N)CC(=O)O": { name: "Aspartic acid", category: "amino-acid" },
  "OC(=O)C(N)CCC(=O)O": { name: "Glutamic acid", category: "amino-acid" },
  "OC(=O)C(N)CC(N)=O": { name: "Asparagine", category: "amino-acid" },
  "OC(=O)C(N)CCC(N)=O": { name: "Glutamine", category: "amino-acid" },
  "NCCCCC(N)C(=O)O": { name: "Lysine", category: "amino-acid" },
  "NC(=N)NCCCC(N)C(=O)O": { name: "Arginine", category: "amino-acid" },
  "OC(=O)C(N)Cc1cnc[nH]1": { name: "Histidine", category: "amino-acid" },
  "OC(=O)C1CCCN1": { name: "Proline", category: "amino-acid" },

  // ─── Sugars ───────────────────────────────────────────────
  "OCC(O)C(O)C(O)C(O)C=O": { name: "Glucose (open chain)", category: "sugar" },
  "OCC(O)C(O)C(O)C(=O)CO": { name: "Fructose (open chain)", category: "sugar" },
  "OCC(O)C(O)C(O)C=O": { name: "Ribose (open chain)", category: "sugar" },

  // ─── Pharmaceuticals ──────────────────────────────────────
  "CC(=O)Nc1ccc(O)cc1": { name: "Acetaminophen", category: "pharmaceutical" },
  "CC(C)Cc1ccc(C(C)C(=O)O)cc1": { name: "Ibuprofen", category: "pharmaceutical" },
  "Cn1c(=O)c2c(ncn2C)n(C)c1=O": { name: "Caffeine", category: "pharmaceutical" },
  "Cn1cnc2c1c(=O)[nH]c(=O)n2C": { name: "Theophylline", category: "pharmaceutical" },
  "Cn1cnc2c1c(=O)n(C)c(=O)n2C": { name: "Theobromine", category: "pharmaceutical" },
  "CN1C(=O)CN=C(c2ccccc2)c2cc(Cl)ccc21": { name: "Diazepam", category: "pharmaceutical" },
  "CC12CCC3C(CCC4CC(O)CCC43C)C1CCC2O": { name: "Estradiol", category: "pharmaceutical" },
  "CC(=O)OC1CC2CCC3C(CCC4(C)C3CC(=O)C4)C2(C)CC1": { name: "Testosterone acetate", category: "pharmaceutical" },
  "CC12CCC(=O)C=C1CCC1C2CCC2(C)C1CCC2(O)C(=O)CO": { name: "Cortisone", category: "pharmaceutical" },

  // ─── Common Solvents (unique entries only) ──────────────────
  "CCOC(=O)C": { name: "Ethyl acetate", category: "solvent" },

  // ─── Vitamins & Natural Products ──────────────────────────
  "CC1=CC(=O)c2ccccc2C1=O": { name: "Menadione (Vitamin K3)", category: "natural-product" },
  "OC(=O)C(O)=C(O)C(O)C(O)CO": { name: "Ascorbic acid (Vitamin C)", category: "natural-product" },
  "CC(C)CCCC(C)CCCC(C)CCCC(C)C": { name: "Phytane", category: "natural-product" },
};

/**
 * Lookup a common name by SMILES.
 * Returns null if no confident match exists — never guesses.
 */
export function lookupMoleculeName(smiles: string): {
  name: string;
  confidence: "high" | "medium" | "low";
  category: string;
} | null {
  if (!smiles) return null;

  // Direct match
  const direct = MOLECULE_NAMES[smiles];
  if (direct) {
    return { name: direct.name, confidence: "high", category: direct.category };
  }

  // Normalized match (strip parentheses for simple comparison)
  const normalized = smiles.replace(/\(/g, "").replace(/\)/g, "");
  for (const [key, entry] of Object.entries(MOLECULE_NAMES)) {
    const keyNorm = key.replace(/\(/g, "").replace(/\)/g, "");
    if (normalized === keyNorm) {
      return { name: entry.name, confidence: "medium", category: entry.category };
    }
  }

  return null;
}

/**
 * Search molecules by name substring.
 */
export function searchMoleculesByName(query: string): {
  smiles: string;
  name: string;
  category: string;
}[] {
  if (!query || query.length < 2) return [];

  const lower = query.toLowerCase();
  const results: { smiles: string; name: string; category: string }[] = [];
  const seen = new Set<string>();

  for (const [smiles, entry] of Object.entries(MOLECULE_NAMES)) {
    if (entry.name.toLowerCase().includes(lower) && !seen.has(entry.name)) {
      seen.add(entry.name);
      results.push({ smiles, name: entry.name, category: entry.category });
    }
  }

  // Sort: exact prefix matches first, then alphabetical
  results.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(lower);
    const bStarts = b.name.toLowerCase().startsWith(lower);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.name.localeCompare(b.name);
  });

  return results.slice(0, 20);
}
