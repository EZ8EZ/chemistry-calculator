/**
 * Tests for the molecular graph engine.
 * Covers: atom/bond creation, valence checks, formula computation,
 * ring detection, aromaticity, stereochemistry, SMILES generation,
 * and metadata computation.
 */

import {
  createEmptyMolecule,
  createAtom,
  createBond,
  getAtomById,
  getBondsForAtom,
  getNeighbors,
  getBondBetween,
  getBondOrderSum,
  getImplicitHydrogens,
  getRemainingValence,
  getFragments,
  detectRings,
  perceiveAromaticity,
  detectStereocenters,
  checkValence,
  validateMolecule,
  computeFormula,
  computeExactMass,
  computeMolecularWeight,
  generateSmiles,
  generateMolFile,
  generateXYZFile,
  computeMetadata,
  cloneMolecule,
  resetIdCounter,
} from "@/lib/chem/graph";
import { calcImplicitHydrogens, getElement, getDefaultValence } from "@/lib/chem/elements";
import { Molecule, Atom, Bond, BondOrder } from "@/lib/chem/types";

// Helper: build a simple molecule
function buildMethane(): Molecule {
  const mol = createEmptyMolecule();
  const c = createAtom("C", 0, { x: 0, y: 0 });
  mol.atoms.push(c);
  return mol;
}

function buildEthane(): Molecule {
  const mol = createEmptyMolecule();
  const c1 = createAtom("C", 0, { x: 0, y: 0 });
  const c2 = createAtom("C", 1, { x: 1.5, y: 0 });
  mol.atoms.push(c1, c2);
  mol.bonds.push(createBond(c1.id, c2.id, 1));
  return mol;
}

function buildEthylene(): Molecule {
  const mol = createEmptyMolecule();
  const c1 = createAtom("C", 0, { x: 0, y: 0 });
  const c2 = createAtom("C", 1, { x: 1.5, y: 0 });
  mol.atoms.push(c1, c2);
  mol.bonds.push(createBond(c1.id, c2.id, 2));
  return mol;
}

function buildWater(): Molecule {
  const mol = createEmptyMolecule();
  const o = createAtom("O", 0, { x: 0, y: 0 });
  mol.atoms.push(o);
  return mol;
}

function buildCyclohexane(): Molecule {
  const mol = createEmptyMolecule();
  const atoms: Atom[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const atom = createAtom("C", i, {
      x: Math.cos(angle) * 1.5,
      y: Math.sin(angle) * 1.5,
    });
    atoms.push(atom);
    mol.atoms.push(atom);
  }
  for (let i = 0; i < 6; i++) {
    mol.bonds.push(createBond(atoms[i].id, atoms[(i + 1) % 6].id, 1));
  }
  return mol;
}

beforeEach(() => {
  resetIdCounter();
});

// ─── Element Data ───────────────────────────────────────────

describe("Element Data", () => {
  test("getElement returns correct data for carbon", () => {
    const c = getElement("C");
    expect(c).toBeDefined();
    expect(c!.atomicNumber).toBe(6);
    expect(c!.defaultValences).toEqual([4]);
    expect(c!.maxValence).toBe(4);
  });

  test("getElement returns correct data for nitrogen", () => {
    const n = getElement("N");
    expect(n).toBeDefined();
    expect(n!.atomicNumber).toBe(7);
    expect(n!.defaultValences).toEqual([3]);
  });

  test("getElement returns undefined for unknown element", () => {
    expect(getElement("Xx")).toBeUndefined();
  });

  test("calcImplicitHydrogens for carbon with no bonds", () => {
    expect(calcImplicitHydrogens("C", 0, 0)).toBe(4);
  });

  test("calcImplicitHydrogens for carbon with 1 single bond", () => {
    expect(calcImplicitHydrogens("C", 1, 0)).toBe(3);
  });

  test("calcImplicitHydrogens for carbon with 2 double bond orders", () => {
    expect(calcImplicitHydrogens("C", 2, 0)).toBe(2);
  });

  test("calcImplicitHydrogens for nitrogen with 0 bonds", () => {
    expect(calcImplicitHydrogens("N", 0, 0)).toBe(3);
  });

  test("calcImplicitHydrogens for oxygen with 0 bonds", () => {
    expect(calcImplicitHydrogens("O", 0, 0)).toBe(2);
  });

  test("calcImplicitHydrogens with positive charge", () => {
    // NH4+ has charge +1, bond order sum of 4
    expect(calcImplicitHydrogens("N", 4, 1)).toBe(0);
  });

  test("getDefaultValence returns 4 for carbon", () => {
    expect(getDefaultValence("C")).toBe(4);
  });
});

// ─── Molecule Creation ──────────────────────────────────────

describe("Molecule Creation", () => {
  test("createEmptyMolecule returns valid empty molecule", () => {
    const mol = createEmptyMolecule();
    expect(mol.atoms).toHaveLength(0);
    expect(mol.bonds).toHaveLength(0);
  });

  test("createAtom creates atom with correct properties", () => {
    const atom = createAtom("C", 0, { x: 1, y: 2 });
    expect(atom.element).toBe("C");
    expect(atom.atomicNumber).toBe(6);
    expect(atom.formalCharge).toBe(0);
    expect(atom.isotope).toBe(0);
    expect(atom.position2d).toEqual({ x: 1, y: 2 });
  });

  test("createBond creates bond with correct properties", () => {
    const bond = createBond("a1", "a2", 2);
    expect(bond.source).toBe("a1");
    expect(bond.target).toBe("a2");
    expect(bond.order).toBe(2);
    expect(bond.stereo).toBe("none");
  });
});

// ─── Graph Queries ──────────────────────────────────────────

describe("Graph Queries", () => {
  test("getAtomById finds correct atom", () => {
    const mol = buildEthane();
    const atom = getAtomById(mol, mol.atoms[0].id);
    expect(atom).toBeDefined();
    expect(atom!.element).toBe("C");
  });

  test("getBondsForAtom returns correct bonds", () => {
    const mol = buildEthane();
    const bonds = getBondsForAtom(mol, mol.atoms[0].id);
    expect(bonds).toHaveLength(1);
  });

  test("getNeighbors returns adjacent atoms", () => {
    const mol = buildEthane();
    const neighbors = getNeighbors(mol, mol.atoms[0].id);
    expect(neighbors).toHaveLength(1);
    expect(neighbors[0].element).toBe("C");
  });

  test("getBondBetween finds bond between two atoms", () => {
    const mol = buildEthane();
    const bond = getBondBetween(mol, mol.atoms[0].id, mol.atoms[1].id);
    expect(bond).toBeDefined();
    expect(bond!.order).toBe(1);
  });

  test("getBondOrderSum calculates correctly", () => {
    const mol = buildEthylene();
    const sum = getBondOrderSum(mol, mol.atoms[0].id);
    expect(sum).toBe(2);
  });

  test("getImplicitHydrogens for methane carbon", () => {
    const mol = buildMethane();
    const h = getImplicitHydrogens(mol, mol.atoms[0].id);
    expect(h).toBe(4);
  });

  test("getImplicitHydrogens for ethane carbon", () => {
    const mol = buildEthane();
    const h = getImplicitHydrogens(mol, mol.atoms[0].id);
    expect(h).toBe(3);
  });

  test("getImplicitHydrogens for ethylene carbon", () => {
    const mol = buildEthylene();
    const h = getImplicitHydrogens(mol, mol.atoms[0].id);
    expect(h).toBe(2);
  });
});

// ─── Connectivity ───────────────────────────────────────────

describe("Connectivity", () => {
  test("getFragments returns 1 fragment for connected molecule", () => {
    const mol = buildEthane();
    const frags = getFragments(mol);
    expect(frags).toHaveLength(1);
    expect(frags[0]).toHaveLength(2);
  });

  test("getFragments returns 2 fragments for disconnected molecule", () => {
    const mol = createEmptyMolecule();
    const c1 = createAtom("C", 0, { x: 0, y: 0 });
    const c2 = createAtom("C", 1, { x: 3, y: 0 });
    mol.atoms.push(c1, c2);
    // No bond between them
    const frags = getFragments(mol);
    expect(frags).toHaveLength(2);
  });

  test("getFragments returns empty for empty molecule", () => {
    const mol = createEmptyMolecule();
    expect(getFragments(mol)).toHaveLength(0);
  });
});

// ─── Ring Detection ─────────────────────────────────────────

describe("Ring Detection", () => {
  test("detectRings finds ring in cyclohexane", () => {
    const mol = buildCyclohexane();
    const rings = detectRings(mol);
    expect(rings.length).toBeGreaterThanOrEqual(1);
    // Should find at least the 6-membered ring
    const sixRing = rings.find((r) => r.length === 6);
    expect(sixRing).toBeDefined();
  });

  test("detectRings returns empty for linear molecule", () => {
    const mol = buildEthane();
    const rings = detectRings(mol);
    expect(rings).toHaveLength(0);
  });
});

// ─── Valence Checking ───────────────────────────────────────

describe("Valence Checking", () => {
  test("checkValence is valid for methane carbon", () => {
    const mol = buildMethane();
    const result = checkValence(mol, mol.atoms[0].id);
    expect(result.valid).toBe(true);
  });

  test("checkValence detects exceeded valence", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    const c2 = createAtom("C", 1);
    const c3 = createAtom("C", 2);
    const c4 = createAtom("C", 3);
    const c5 = createAtom("C", 4);
    const c6 = createAtom("C", 5);
    mol.atoms.push(c, c2, c3, c4, c5, c6);
    // 5 single bonds to carbon (exceeds valence 4)
    mol.bonds.push(createBond(c.id, c2.id, 1));
    mol.bonds.push(createBond(c.id, c3.id, 1));
    mol.bonds.push(createBond(c.id, c4.id, 1));
    mol.bonds.push(createBond(c.id, c5.id, 1));
    mol.bonds.push(createBond(c.id, c6.id, 1));

    const result = checkValence(mol, c.id);
    const hasValenceError = result.warnings.some(
      (w) => w.type === "valence-exceeded" || w.type === "unusual-valence"
    );
    expect(hasValenceError).toBe(true);
  });

  test("validateMolecule reports disconnected fragments", () => {
    const mol = createEmptyMolecule();
    mol.atoms.push(createAtom("C", 0));
    mol.atoms.push(createAtom("O", 1, { x: 5, y: 0 }));
    const warnings = validateMolecule(mol);
    const hasFragmentWarning = warnings.some(
      (w) => w.type === "disconnected-fragments"
    );
    expect(hasFragmentWarning).toBe(true);
  });
});

// ─── Formula Computation ────────────────────────────────────

describe("Formula Computation", () => {
  test("single carbon gives CH4", () => {
    const mol = buildMethane();
    expect(computeFormula(mol)).toBe("CH4");
  });

  test("ethane gives C2H6", () => {
    const mol = buildEthane();
    expect(computeFormula(mol)).toBe("C2H6");
  });

  test("ethylene gives C2H4", () => {
    const mol = buildEthylene();
    expect(computeFormula(mol)).toBe("C2H4");
  });

  test("water gives H2O", () => {
    const mol = buildWater();
    expect(computeFormula(mol)).toBe("H2O");
  });

  test("empty molecule gives empty string", () => {
    const mol = createEmptyMolecule();
    expect(computeFormula(mol)).toBe("");
  });
});

// ─── Mass Computation ───────────────────────────────────────

describe("Mass Computation", () => {
  test("methane exact mass is approximately 16", () => {
    const mol = buildMethane();
    const mass = computeExactMass(mol);
    expect(mass).toBeCloseTo(16.031, 2);
  });

  test("water molecular weight is approximately 18", () => {
    const mol = buildWater();
    const mw = computeMolecularWeight(mol);
    expect(mw).toBeCloseTo(18.015, 1);
  });
});

// ─── SMILES Generation ──────────────────────────────────────

describe("SMILES Generation", () => {
  test("single carbon generates C", () => {
    const mol = buildMethane();
    expect(generateSmiles(mol)).toBe("C");
  });

  test("ethane generates CC", () => {
    const mol = buildEthane();
    expect(generateSmiles(mol)).toBe("CC");
  });

  test("ethylene generates C=C", () => {
    const mol = buildEthylene();
    expect(generateSmiles(mol)).toBe("C=C");
  });

  test("empty molecule generates empty string", () => {
    const mol = createEmptyMolecule();
    expect(generateSmiles(mol)).toBe("");
  });

  test("disconnected fragments joined with .", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0, { x: 0, y: 0 });
    const o = createAtom("O", 1, { x: 3, y: 0 });
    mol.atoms.push(c, o);
    const smiles = generateSmiles(mol);
    expect(smiles).toContain(".");
  });

  test("isomeric SMILES includes chirality", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    c.chiralTag = "R";
    const f = createAtom("F", 1, { x: 1, y: 0 });
    const cl = createAtom("Cl", 2, { x: -1, y: 0 });
    const br = createAtom("Br", 3, { x: 0, y: 1 });
    mol.atoms.push(c, f, cl, br);
    mol.bonds.push(createBond(c.id, f.id, 1));
    mol.bonds.push(createBond(c.id, cl.id, 1));
    mol.bonds.push(createBond(c.id, br.id, 1));
    const smiles = generateSmiles(mol, true);
    expect(smiles).toContain("@@");
  });
});

// ─── MOL File Generation ────────────────────────────────────

describe("MOL File Generation", () => {
  test("generates valid MOL file header", () => {
    const mol = buildEthane();
    const molFile = generateMolFile(mol);
    expect(molFile).toContain("Valence Studio");
    expect(molFile).toContain("V2000");
    expect(molFile).toContain("M  END");
  });

  test("MOL file has correct atom and bond count", () => {
    const mol = buildEthane();
    const molFile = generateMolFile(mol);
    const lines = molFile.split("\n");
    const countsLine = lines[3];
    expect(countsLine.trim().startsWith("2")).toBe(true); // 2 atoms
  });
});

// ─── XYZ File Generation ────────────────────────────────────

describe("XYZ File Generation", () => {
  test("generates valid XYZ file", () => {
    const mol = buildMethane();
    const xyz = generateXYZFile(mol);
    const lines = xyz.split("\n");
    expect(parseInt(lines[0])).toBeGreaterThanOrEqual(1);
    expect(lines[1]).toContain("Valence Studio");
  });
});

// ─── Metadata Computation ───────────────────────────────────

describe("Metadata Computation", () => {
  test("computes correct metadata for ethane", () => {
    const mol = buildEthane();
    const meta = computeMetadata(mol);
    expect(meta.formula).toBe("C2H6");
    expect(meta.atomCount).toBe(2);
    expect(meta.bondCount).toBe(1);
    expect(meta.smiles).toBe("CC");
    expect(meta.sanitizationStatus).toBe("valid");
  });

  test("computes ring count for cyclohexane", () => {
    const mol = buildCyclohexane();
    const meta = computeMetadata(mol);
    expect(meta.ringCount).toBeGreaterThanOrEqual(1);
  });
});

// ─── Clone ──────────────────────────────────────────────────

describe("Clone", () => {
  test("cloneMolecule creates independent copy", () => {
    const mol = buildEthane();
    const clone = cloneMolecule(mol);
    expect(clone.atoms).toHaveLength(mol.atoms.length);
    expect(clone.bonds).toHaveLength(mol.bonds.length);
    // Modify clone, original should not change
    clone.atoms.push(createAtom("O", 2));
    expect(mol.atoms).toHaveLength(2);
    expect(clone.atoms).toHaveLength(3);
  });
});
