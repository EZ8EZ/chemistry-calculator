/**
 * Tests for molecular editing operations.
 * Covers: addAtom, removeAtom, addBond, removeBond, changeBondOrder,
 * charge, isotope, radical, stereochemistry, ring closure.
 */

import {
  createEmptyMolecule,
  createAtom,
  createBond,
  computeMetadata,
  resetIdCounter,
} from "@/lib/chem/graph";
import {
  addAtom,
  removeAtom,
  addBond,
  removeBond,
  changeBondOrder,
  setFormalCharge,
  setIsotope,
  setRadical,
  setChirality,
  setBondStereo,
  toggleExplicitHydrogens,
  closeRing,
  clearMolecule,
  findAttachmentSites,
} from "@/lib/chem/operations";
import { Molecule, BondOrder } from "@/lib/chem/types";

function buildLinearC3(): Molecule {
  const mol = createEmptyMolecule();
  const c1 = createAtom("C", 0, { x: 0, y: 0 });
  const c2 = createAtom("C", 1, { x: 1.5, y: 0 });
  const c3 = createAtom("C", 2, { x: 3, y: 0 });
  mol.atoms.push(c1, c2, c3);
  mol.bonds.push(createBond(c1.id, c2.id, 1));
  mol.bonds.push(createBond(c2.id, c3.id, 1));
  mol.metadata = computeMetadata(mol);
  return mol;
}

beforeEach(() => {
  resetIdCounter();
});

// ─── Add Atom ───────────────────────────────────────────────

describe("addAtom", () => {
  test("add free carbon to empty molecule", () => {
    const mol = createEmptyMolecule();
    const result = addAtom(mol, "C", null);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms).toHaveLength(1);
    expect(result.molecule.atoms[0].element).toBe("C");
  });

  test("add carbon bonded to existing carbon", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0, { x: 0, y: 0 });
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = addAtom(mol, "C", c.id);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms).toHaveLength(2);
    expect(result.molecule.bonds).toHaveLength(1);
  });

  test("add oxygen with double bond", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0, { x: 0, y: 0 });
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = addAtom(mol, "O", c.id, 2);
    expect(result.success).toBe(true);
    expect(result.molecule.bonds[0].order).toBe(2);
  });

  test("reject add when valence exceeded", () => {
    // Build carbon with 4 existing bonds (saturated)
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0, { x: 0, y: 0 });
    const h1 = createAtom("H", 1, { x: 1, y: 0 });
    const h2 = createAtom("H", 2, { x: -1, y: 0 });
    const h3 = createAtom("H", 3, { x: 0, y: 1 });
    const h4 = createAtom("H", 4, { x: 0, y: -1 });
    mol.atoms.push(c, h1, h2, h3, h4);
    mol.bonds.push(createBond(c.id, h1.id, 1));
    mol.bonds.push(createBond(c.id, h2.id, 1));
    mol.bonds.push(createBond(c.id, h3.id, 1));
    mol.bonds.push(createBond(c.id, h4.id, 1));
    mol.metadata = computeMetadata(mol);

    const result = addAtom(mol, "C", c.id);
    expect(result.success).toBe(false);
    expect(result.message).toContain("valence");
  });

  test("reject unknown element", () => {
    const mol = createEmptyMolecule();
    const result = addAtom(mol, "Xx", null);
    expect(result.success).toBe(false);
  });
});

// ─── Remove Atom ────────────────────────────────────────────

describe("removeAtom", () => {
  test("remove atom from molecule", () => {
    const mol = buildLinearC3();
    const result = removeAtom(mol, mol.atoms[2].id);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms).toHaveLength(2);
  });

  test("remove middle atom splits molecule", () => {
    const mol = buildLinearC3();
    const result = removeAtom(mol, mol.atoms[1].id);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms).toHaveLength(2);
    // Bonds to middle atom should be removed
    expect(result.molecule.bonds).toHaveLength(0);
  });

  test("remove nonexistent atom fails", () => {
    const mol = buildLinearC3();
    const result = removeAtom(mol, "nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── Add Bond ───────────────────────────────────────────────

describe("addBond", () => {
  test("add bond between two atoms", () => {
    const mol = createEmptyMolecule();
    const c1 = createAtom("C", 0, { x: 0, y: 0 });
    const c2 = createAtom("C", 1, { x: 1.5, y: 0 });
    mol.atoms.push(c1, c2);
    mol.metadata = computeMetadata(mol);

    const result = addBond(mol, c1.id, c2.id);
    expect(result.success).toBe(true);
    expect(result.molecule.bonds).toHaveLength(1);
  });

  test("reject duplicate bond", () => {
    const mol = buildLinearC3();
    const result = addBond(mol, mol.atoms[0].id, mol.atoms[1].id);
    expect(result.success).toBe(false);
    expect(result.message).toContain("already exists");
  });
});

// ─── Remove Bond ────────────────────────────────────────────

describe("removeBond", () => {
  test("remove bond from molecule", () => {
    const mol = buildLinearC3();
    const result = removeBond(mol, mol.bonds[0].id);
    expect(result.success).toBe(true);
    expect(result.molecule.bonds).toHaveLength(1);
  });

  test("remove nonexistent bond fails", () => {
    const mol = buildLinearC3();
    const result = removeBond(mol, "nonexistent");
    expect(result.success).toBe(false);
  });
});

// ─── Change Bond Order ──────────────────────────────────────

describe("changeBondOrder", () => {
  test("change single to double", () => {
    const mol = buildLinearC3();
    const result = changeBondOrder(mol, mol.bonds[0].id, 2);
    expect(result.success).toBe(true);
    expect(result.molecule.bonds.find((b) => b.id === mol.bonds[0].id)!.order).toBe(2);
  });

  test("reject order change that exceeds valence", () => {
    // Make C with 4 bonds, try to increase one to double
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0, { x: 0, y: 0 });
    const h1 = createAtom("H", 1);
    const h2 = createAtom("H", 2);
    const h3 = createAtom("H", 3);
    const c2 = createAtom("C", 4, { x: 1.5, y: 0 });
    mol.atoms.push(c, h1, h2, h3, c2);
    const bond1 = createBond(c.id, h1.id, 1);
    mol.bonds.push(bond1);
    mol.bonds.push(createBond(c.id, h2.id, 1));
    mol.bonds.push(createBond(c.id, h3.id, 1));
    mol.bonds.push(createBond(c.id, c2.id, 1));
    mol.metadata = computeMetadata(mol);

    const result = changeBondOrder(mol, bond1.id, 2);
    expect(result.success).toBe(false);
  });
});

// ─── Charge ─────────────────────────────────────────────────

describe("setFormalCharge", () => {
  test("set charge on atom", () => {
    const mol = createEmptyMolecule();
    const n = createAtom("N", 0, { x: 0, y: 0 });
    mol.atoms.push(n);
    mol.metadata = computeMetadata(mol);

    const result = setFormalCharge(mol, n.id, 1);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].formalCharge).toBe(1);
  });

  test("set negative charge", () => {
    const mol = createEmptyMolecule();
    const o = createAtom("O", 0);
    mol.atoms.push(o);
    mol.metadata = computeMetadata(mol);

    const result = setFormalCharge(mol, o.id, -1);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].formalCharge).toBe(-1);
  });
});

// ─── Isotope ────────────────────────────────────────────────

describe("setIsotope", () => {
  test("set isotope label", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = setIsotope(mol, c.id, 13);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].isotope).toBe(13);
  });

  test("clear isotope", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    c.isotope = 14;
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = setIsotope(mol, c.id, 0);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].isotope).toBe(0);
  });
});

// ─── Radical ────────────────────────────────────────────────

describe("setRadical", () => {
  test("set 1 radical electron", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = setRadical(mol, c.id, 1);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].radicalElectrons).toBe(1);
  });

  test("reject invalid radical count", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = setRadical(mol, c.id, 3);
    expect(result.success).toBe(false);
  });
});

// ─── Stereochemistry ────────────────────────────────────────

describe("Stereochemistry", () => {
  test("set chirality on atom", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = setChirality(mol, c.id, "R");
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].chiralTag).toBe("R");
  });

  test("set bond stereo", () => {
    const mol = createEmptyMolecule();
    const c1 = createAtom("C", 0);
    const c2 = createAtom("C", 1, { x: 1.5, y: 0 });
    mol.atoms.push(c1, c2);
    const bond = createBond(c1.id, c2.id, 2);
    mol.bonds.push(bond);
    mol.metadata = computeMetadata(mol);

    const result = setBondStereo(mol, bond.id, "E");
    expect(result.success).toBe(true);
    expect(result.molecule.bonds[0].stereo).toBe("E");
  });
});

// ─── Explicit Hydrogens ─────────────────────────────────────

describe("toggleExplicitHydrogens", () => {
  test("toggle from implicit to explicit", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = toggleExplicitHydrogens(mol, c.id);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].explicitHCount).toBe(4);
  });

  test("toggle back to implicit", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    c.explicitHCount = 4;
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);

    const result = toggleExplicitHydrogens(mol, c.id);
    expect(result.success).toBe(true);
    expect(result.molecule.atoms[0].explicitHCount).toBeNull();
  });
});

// ─── Ring Closure ───────────────────────────────────────────

describe("closeRing", () => {
  test("close ring between terminal atoms", () => {
    const mol = buildLinearC3();
    const result = closeRing(mol, mol.atoms[0].id, mol.atoms[2].id);
    expect(result.success).toBe(true);
    expect(result.molecule.bonds).toHaveLength(3);
  });

  test("reject ring closure with existing bond", () => {
    const mol = buildLinearC3();
    const result = closeRing(mol, mol.atoms[0].id, mol.atoms[1].id);
    expect(result.success).toBe(false);
  });
});

// ─── Clear ──────────────────────────────────────────────────

describe("clearMolecule", () => {
  test("clears everything", () => {
    const result = clearMolecule();
    expect(result.success).toBe(true);
    expect(result.molecule.atoms).toHaveLength(0);
    expect(result.molecule.bonds).toHaveLength(0);
  });
});

// ─── Attachment Sites ───────────────────────────────────────

describe("findAttachmentSites", () => {
  test("find sites on ethane", () => {
    const mol = createEmptyMolecule();
    const c1 = createAtom("C", 0, { x: 0, y: 0 });
    const c2 = createAtom("C", 1, { x: 1.5, y: 0 });
    mol.atoms.push(c1, c2);
    mol.bonds.push(createBond(c1.id, c2.id, 1));
    mol.metadata = computeMetadata(mol);

    const candidates = findAttachmentSites(mol, "C");
    // Both carbons can accept another bond, but they're equivalent
    expect(candidates.length).toBeGreaterThanOrEqual(1);
  });

  test("no sites when all atoms saturated", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    const h1 = createAtom("H", 1);
    const h2 = createAtom("H", 2);
    const h3 = createAtom("H", 3);
    const h4 = createAtom("H", 4);
    mol.atoms.push(c, h1, h2, h3, h4);
    mol.bonds.push(createBond(c.id, h1.id, 1));
    mol.bonds.push(createBond(c.id, h2.id, 1));
    mol.bonds.push(createBond(c.id, h3.id, 1));
    mol.bonds.push(createBond(c.id, h4.id, 1));
    mol.metadata = computeMetadata(mol);

    const candidates = findAttachmentSites(mol, "C");
    // Only H atoms could potentially accept, but H maxValence is 1
    // so effectively no sites
    expect(candidates).toHaveLength(0);
  });
});

// ─── Immutability ───────────────────────────────────────────

describe("Operation Immutability", () => {
  test("addAtom does not mutate original molecule", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0);
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);
    const originalAtomCount = mol.atoms.length;

    addAtom(mol, "C", c.id);
    expect(mol.atoms.length).toBe(originalAtomCount);
  });

  test("removeAtom does not mutate original molecule", () => {
    const mol = buildLinearC3();
    const originalAtomCount = mol.atoms.length;

    removeAtom(mol, mol.atoms[0].id);
    expect(mol.atoms.length).toBe(originalAtomCount);
  });
});
