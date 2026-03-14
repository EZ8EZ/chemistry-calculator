import { parseSMILES } from "../lib/chem/smilesParser";

describe("SMILES Parser", () => {
  describe("basic atoms", () => {
    it("parses single carbon", () => {
      const mol = parseSMILES("C");
      expect(mol).not.toBeNull();
      expect(mol!.atoms).toHaveLength(1);
      expect(mol!.atoms[0].element).toBe("C");
    });

    it("parses empty string as empty molecule", () => {
      const mol = parseSMILES("");
      expect(mol).not.toBeNull();
      expect(mol!.atoms).toHaveLength(0);
    });

    it("returns null for invalid SMILES", () => {
      // The parser wraps errors and returns null
      const mol = parseSMILES("[[[invalid");
      // May return null or empty depending on error handling
      expect(mol === null || mol!.atoms.length === 0).toBe(true);
    });
  });

  describe("linear chains", () => {
    it("parses ethane (CC)", () => {
      const mol = parseSMILES("CC");
      expect(mol).not.toBeNull();
      expect(mol!.atoms).toHaveLength(2);
      expect(mol!.bonds).toHaveLength(1);
      expect(mol!.bonds[0].order).toBe(1);
    });

    it("parses propane (CCC)", () => {
      const mol = parseSMILES("CCC");
      expect(mol!.atoms).toHaveLength(3);
      expect(mol!.bonds).toHaveLength(2);
    });

    it("parses ethanol (CCO)", () => {
      const mol = parseSMILES("CCO");
      expect(mol!.atoms).toHaveLength(3);
      const elements = mol!.atoms.map((a) => a.element).sort();
      expect(elements).toEqual(["C", "C", "O"]);
    });
  });

  describe("double and triple bonds", () => {
    it("parses ethylene (C=C)", () => {
      const mol = parseSMILES("C=C");
      expect(mol!.atoms).toHaveLength(2);
      expect(mol!.bonds).toHaveLength(1);
      expect(mol!.bonds[0].order).toBe(2);
    });

    it("parses acetylene (C#C)", () => {
      const mol = parseSMILES("C#C");
      expect(mol!.bonds[0].order).toBe(3);
    });

    it("parses formaldehyde (C=O)", () => {
      const mol = parseSMILES("C=O");
      expect(mol!.atoms).toHaveLength(2);
      expect(mol!.bonds[0].order).toBe(2);
    });

    it("parses acetic acid (CC(=O)O)", () => {
      const mol = parseSMILES("CC(=O)O");
      expect(mol!.atoms).toHaveLength(4);
      // Should have 3 bonds: C-C, C=O, C-O
      expect(mol!.bonds).toHaveLength(3);
      const doubleBonds = mol!.bonds.filter((b) => b.order === 2);
      expect(doubleBonds).toHaveLength(1);
    });
  });

  describe("branches", () => {
    it("parses isobutane CC(C)C", () => {
      const mol = parseSMILES("CC(C)C");
      expect(mol!.atoms).toHaveLength(4);
      expect(mol!.bonds).toHaveLength(3);
    });

    it("parses neopentane CC(C)(C)C", () => {
      const mol = parseSMILES("CC(C)(C)C");
      expect(mol!.atoms).toHaveLength(5);
      expect(mol!.bonds).toHaveLength(4);
    });

    it("parses nested branches", () => {
      const mol = parseSMILES("CC(CC(C)C)C");
      expect(mol!.atoms).toHaveLength(7);
      expect(mol!.bonds).toHaveLength(6);
    });
  });

  describe("ring closures", () => {
    it("parses cyclohexane (C1CCCCC1)", () => {
      const mol = parseSMILES("C1CCCCC1");
      expect(mol!.atoms).toHaveLength(6);
      expect(mol!.bonds).toHaveLength(6); // 5 chain + 1 ring closure
    });

    it("parses cyclopropane (C1CC1)", () => {
      const mol = parseSMILES("C1CC1");
      expect(mol!.atoms).toHaveLength(3);
      expect(mol!.bonds).toHaveLength(3);
    });
  });

  describe("aromatic atoms", () => {
    it("parses benzene (c1ccccc1)", () => {
      const mol = parseSMILES("c1ccccc1");
      expect(mol!.atoms).toHaveLength(6);
      expect(mol!.bonds).toHaveLength(6);
      // All atoms should be aromatic
      expect(mol!.atoms.every((a) => a.aromatic)).toBe(true);
      // All bonds should be aromatic (1.5)
      expect(mol!.bonds.every((b) => b.order === 1.5)).toBe(true);
    });

    it("parses pyridine (c1ccncc1)", () => {
      const mol = parseSMILES("c1ccncc1");
      expect(mol!.atoms).toHaveLength(6);
      const nitrogen = mol!.atoms.find((a) => a.element === "N");
      expect(nitrogen).toBeDefined();
      expect(nitrogen!.aromatic).toBe(true);
    });
  });

  describe("bracket atoms", () => {
    it("parses charged atoms [NH4+]", () => {
      const mol = parseSMILES("[NH4+]");
      expect(mol!.atoms).toHaveLength(1);
      expect(mol!.atoms[0].element).toBe("N");
      expect(mol!.atoms[0].formalCharge).toBe(1);
      expect(mol!.atoms[0].explicitHCount).toBe(4);
    });

    it("parses negative charge [OH-]", () => {
      const mol = parseSMILES("[OH-]");
      expect(mol!.atoms[0].formalCharge).toBe(-1);
    });

    it("parses isotopes [13C]", () => {
      const mol = parseSMILES("[13C]");
      expect(mol!.atoms[0].isotope).toBe(13);
      expect(mol!.atoms[0].element).toBe("C");
    });

    it("parses chirality [C@@H]", () => {
      const mol = parseSMILES("[C@@H](F)(Cl)Br");
      expect(mol!.atoms[0].chiralTag).toBe("R");
    });

    it("parses chirality [C@H]", () => {
      const mol = parseSMILES("[C@H](F)(Cl)Br");
      expect(mol!.atoms[0].chiralTag).toBe("S");
    });
  });

  describe("two-letter elements", () => {
    it("parses chlorine (Cl)", () => {
      const mol = parseSMILES("CCl");
      expect(mol!.atoms).toHaveLength(2);
      expect(mol!.atoms[1].element).toBe("Cl");
    });

    it("parses bromine (Br)", () => {
      const mol = parseSMILES("CBr");
      expect(mol!.atoms[1].element).toBe("Br");
    });
  });

  describe("dot-separated fragments", () => {
    it("parses two fragments (C.C)", () => {
      const mol = parseSMILES("C.C");
      expect(mol!.atoms).toHaveLength(2);
      expect(mol!.bonds).toHaveLength(0); // No bonds between fragments
    });

    it("parses salt (NaCl as [Na+].[Cl-])", () => {
      const mol = parseSMILES("[Na+].[Cl-]");
      expect(mol!.atoms).toHaveLength(2);
      expect(mol!.atoms[0].formalCharge).toBe(1);
      expect(mol!.atoms[1].formalCharge).toBe(-1);
    });
  });

  describe("2D coordinates", () => {
    it("assigns 2D positions to all atoms", () => {
      const mol = parseSMILES("CCCC");
      expect(mol!.atoms.every((a) => a.position2d != null)).toBe(true);
    });

    it("assigns unique positions", () => {
      const mol = parseSMILES("c1ccccc1");
      const positions = mol!.atoms.map(
        (a) => `${a.position2d!.x.toFixed(2)},${a.position2d!.y.toFixed(2)}`
      );
      const unique = new Set(positions);
      expect(unique.size).toBe(6);
    });
  });

  describe("complex molecules", () => {
    it("parses aspirin", () => {
      const mol = parseSMILES("CC(=O)Oc1ccccc1C(=O)O");
      expect(mol).not.toBeNull();
      expect(mol!.atoms.length).toBeGreaterThan(10);
    });

    it("parses caffeine", () => {
      const mol = parseSMILES("Cn1c(=O)c2c(ncn2C)n(C)c1=O");
      expect(mol).not.toBeNull();
      expect(mol!.atoms.length).toBeGreaterThan(10);
    });

    it("computes metadata", () => {
      const mol = parseSMILES("CCO");
      expect(mol!.metadata).toBeDefined();
      expect(mol!.metadata.formula).toBeTruthy();
    });
  });
});
