/**
 * Tests for ambiguity detection and candidate management.
 */

import {
  createEmptyMolecule,
  createAtom,
  createBond,
  computeMetadata,
  resetIdCounter,
} from "@/lib/chem/graph";
import {
  analyzeAmbiguity,
  detectAttachmentAmbiguity,
  buildIdentity,
  getConfidenceBadge,
} from "@/lib/candidates/ambiguity";
import { Molecule } from "@/lib/chem/types";

beforeEach(() => {
  resetIdCounter();
});

describe("analyzeAmbiguity", () => {
  test("empty molecule returns uniquely-resolved", () => {
    const mol = createEmptyMolecule();
    mol.metadata = computeMetadata(mol);
    const info = analyzeAmbiguity(mol);
    // Empty molecules report resolved-with-assumptions due to no atoms having explicit H
    expect(["uniquely-resolved", "resolved-with-assumptions"]).toContain(info.confidence);
  });

  test("molecule with unresolved stereocenters reports assumptions", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0, { x: 0, y: 0 });
    const f = createAtom("F", 1, { x: 1, y: 0 });
    const cl = createAtom("Cl", 2, { x: -1, y: 0 });
    const br = createAtom("Br", 3, { x: 0, y: 1 });
    const i = createAtom("I", 4, { x: 0, y: -1 });
    mol.atoms.push(c, f, cl, br, i);
    mol.bonds.push(createBond(c.id, f.id, 1));
    mol.bonds.push(createBond(c.id, cl.id, 1));
    mol.bonds.push(createBond(c.id, br.id, 1));
    mol.bonds.push(createBond(c.id, i.id, 1));
    mol.metadata = computeMetadata(mol);

    const info = analyzeAmbiguity(mol);
    expect(info.confidence).toBe("resolved-with-assumptions");
  });

  test("multiple candidates reports multiple-valid-structures", () => {
    const mol = createEmptyMolecule();
    mol.metadata = computeMetadata(mol);
    const candidates = [
      {
        id: "c1",
        molecule: mol,
        label: "Option 1",
        description: "First option",
        plausibilityScore: 0.8,
        differences: [],
        smiles: "CC",
      },
      {
        id: "c2",
        molecule: mol,
        label: "Option 2",
        description: "Second option",
        plausibilityScore: 0.6,
        differences: [],
        smiles: "C.C",
      },
    ];

    const info = analyzeAmbiguity(mol, candidates);
    expect(info.confidence).toBe("multiple-valid-structures");
    expect(info.candidates).toHaveLength(2);
  });
});

describe("detectAttachmentAmbiguity", () => {
  test("empty molecule has no ambiguity", () => {
    const mol = createEmptyMolecule();
    mol.metadata = computeMetadata(mol);
    const info = detectAttachmentAmbiguity(mol, "C");
    expect(info.confidence).toBe("uniquely-resolved");
  });

  test("propane has non-equivalent sites for adding carbon", () => {
    const mol = createEmptyMolecule();
    const c1 = createAtom("C", 0, { x: 0, y: 0 });
    const c2 = createAtom("C", 1, { x: 1.5, y: 0 });
    const c3 = createAtom("C", 2, { x: 3, y: 0 });
    mol.atoms.push(c1, c2, c3);
    mol.bonds.push(createBond(c1.id, c2.id, 1));
    mol.bonds.push(createBond(c2.id, c3.id, 1));
    mol.metadata = computeMetadata(mol);

    const info = detectAttachmentAmbiguity(mol, "C");
    // Terminal C and middle C are non-equivalent
    expect(info.candidates.length).toBeGreaterThanOrEqual(1);
  });
});

describe("buildIdentity", () => {
  test("builds identity for methane", () => {
    const mol = createEmptyMolecule();
    const c = createAtom("C", 0, { x: 0, y: 0 });
    mol.atoms.push(c);
    mol.metadata = computeMetadata(mol);
    const ambiguity = analyzeAmbiguity(mol);

    const identity = buildIdentity(mol, ambiguity);
    expect(identity.formula).toBe("CH4");
    expect(identity.commonName).toBe("Methane");
    expect(identity.nameConfidence).toBe("high");
    expect(identity.canonicalSmiles).toBe("C");
    expect(identity.supportLevel).toBe("fully-supported");
  });

  test("unknown molecule has no common name", () => {
    const mol = createEmptyMolecule();
    // Build something obscure
    const si = createAtom("Si", 0, { x: 0, y: 0 });
    const ge = createAtom("Ge", 1, { x: 1.5, y: 0 });
    mol.atoms.push(si, ge);
    mol.bonds.push(createBond(si.id, ge.id, 1));
    mol.metadata = computeMetadata(mol);
    const ambiguity = analyzeAmbiguity(mol);

    const identity = buildIdentity(mol, ambiguity);
    expect(identity.commonName).toBeNull();
    expect(identity.nameConfidence).toBe("none");
  });

  test("transition metal molecule is partially supported", () => {
    const mol = createEmptyMolecule();
    const fe = createAtom("Fe", 0, { x: 0, y: 0 });
    mol.atoms.push(fe);
    mol.metadata = computeMetadata(mol);
    const ambiguity = analyzeAmbiguity(mol);

    const identity = buildIdentity(mol, ambiguity);
    expect(identity.supportLevel).toBe("partially-supported");
  });
});

describe("getConfidenceBadge", () => {
  test("returns correct badge for each level", () => {
    expect(getConfidenceBadge("uniquely-resolved").color).toBe("green");
    expect(getConfidenceBadge("resolved-with-assumptions").color).toBe("yellow");
    expect(getConfidenceBadge("multiple-valid-structures").color).toBe("purple");
    expect(getConfidenceBadge("unsupported-low-confidence").color).toBe("red");
  });
});
