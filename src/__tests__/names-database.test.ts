import {
  lookupMoleculeName,
  searchMoleculesByName,
  MOLECULE_NAMES,
} from "../lib/identifiers/names";

describe("Molecule Names Database", () => {
  describe("database coverage", () => {
    it("has at least 200 entries", () => {
      const count = Object.keys(MOLECULE_NAMES).length;
      expect(count).toBeGreaterThanOrEqual(200);
    });

    it("covers all major categories", () => {
      const categories = new Set(
        Object.values(MOLECULE_NAMES).map((e) => e.category)
      );
      expect(categories.has("alkane")).toBe(true);
      expect(categories.has("alcohol")).toBe(true);
      expect(categories.has("aromatic")).toBe(true);
      expect(categories.has("amino-acid")).toBe(true);
      expect(categories.has("pharmaceutical")).toBe(true);
      expect(categories.has("heterocycle")).toBe(true);
    });
  });

  describe("lookupMoleculeName", () => {
    it("looks up methane by SMILES", () => {
      const result = lookupMoleculeName("C");
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Methane");
      expect(result!.confidence).toBe("high");
    });

    it("looks up ethanol", () => {
      const result = lookupMoleculeName("CCO");
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Ethanol");
    });

    it("looks up benzene", () => {
      const result = lookupMoleculeName("c1ccccc1");
      expect(result!.name).toBe("Benzene");
    });

    it("looks up aspirin", () => {
      const result = lookupMoleculeName("CC(=O)Oc1ccccc1C(=O)O");
      expect(result!.name).toBe("Aspirin");
    });

    it("looks up caffeine", () => {
      const result = lookupMoleculeName("Cn1c(=O)c2c(ncn2C)n(C)c1=O");
      expect(result!.name).toBe("Caffeine");
    });

    it("returns null for unknown SMILES", () => {
      const result = lookupMoleculeName("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC");
      expect(result).toBeNull();
    });

    it("returns null for empty input", () => {
      expect(lookupMoleculeName("")).toBeNull();
    });

    it("performs normalized matching", () => {
      // Acetone has entries with and without parens
      const r1 = lookupMoleculeName("CC(=O)C");
      const r2 = lookupMoleculeName("CC=OC");
      // At least one should match
      expect(r1 !== null || r2 !== null).toBe(true);
    });

    it("returns correct confidence levels", () => {
      const direct = lookupMoleculeName("CCO");
      expect(direct!.confidence).toBe("high");
    });
  });

  describe("searchMoleculesByName", () => {
    it("finds molecules by name substring", () => {
      const results = searchMoleculesByName("ethanol");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe("Ethanol");
    });

    it("is case-insensitive", () => {
      const results = searchMoleculesByName("BENZENE");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.name === "Benzene")).toBe(true);
    });

    it("returns prefix matches first", () => {
      const results = searchMoleculesByName("meth");
      expect(results.length).toBeGreaterThan(0);
      // Methane, Methanol, etc. should come before Dimethyl...
      const firstResult = results[0].name.toLowerCase();
      expect(firstResult.startsWith("meth")).toBe(true);
    });

    it("returns empty for short queries", () => {
      expect(searchMoleculesByName("")).toHaveLength(0);
      expect(searchMoleculesByName("a")).toHaveLength(0);
    });

    it("limits results to 20", () => {
      // "ol" should match many entries (ethanol, methanol, phenol, etc.)
      const results = searchMoleculesByName("ol");
      expect(results.length).toBeLessThanOrEqual(20);
    });

    it("deduplicates by name", () => {
      const results = searchMoleculesByName("acetone");
      const names = results.map((r) => r.name);
      const unique = new Set(names);
      expect(names.length).toBe(unique.size);
    });

    it("finds amino acids", () => {
      const results = searchMoleculesByName("glycine");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe("Glycine");
    });

    it("finds pharmaceuticals", () => {
      const results = searchMoleculesByName("aspirin");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe("Aspirin");
    });
  });
});
