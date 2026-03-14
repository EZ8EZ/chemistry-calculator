/**
 * Molecular graph engine.
 * Atoms are nodes, bonds are edges. This is the source of truth.
 */

import {
  Atom, Bond, BondOrder, BondStereo, ChiralTag, Molecule,
  MoleculeMetadata, SanitizationStatus, ChemWarning, Point2D,
} from "./types";
import { ELEMENTS, calcImplicitHydrogens, getElement } from "./elements";

let nextId = 1;
function genId(prefix: string): string {
  return `${prefix}_${nextId++}`;
}

/** Reset ID counter (for testing) */
export function resetIdCounter(): void {
  nextId = 1;
}

// ─── Factory ────────────────────────────────────────────────

export function createEmptyMolecule(): Molecule {
  return {
    atoms: [],
    bonds: [],
    metadata: createEmptyMetadata(),
  };
}

function createEmptyMetadata(): MoleculeMetadata {
  return {
    formula: "",
    exactMass: 0,
    molecularWeight: 0,
    totalFormalCharge: 0,
    atomCount: 0,
    heavyAtomCount: 0,
    bondCount: 0,
    ringCount: 0,
    aromaticRingCount: 0,
    stereocenterCount: 0,
    ezBondCount: 0,
    fragmentCount: 0,
    smiles: "",
    isomericSmiles: "",
    inchi: "",
    inchiKey: "",
    sanitizationStatus: "unchecked",
    warnings: [],
  };
}

export function createAtom(
  element: string,
  index: number,
  position2d?: Point2D
): Atom {
  const elem = getElement(element);
  return {
    id: genId("a"),
    element,
    atomicNumber: elem?.atomicNumber ?? 0,
    isotope: 0,
    formalCharge: 0,
    radicalElectrons: 0,
    explicitHCount: null,
    aromatic: false,
    chiralTag: "none",
    position2d: position2d ?? null,
    position3d: null,
    index,
  };
}

export function createBond(
  sourceId: string,
  targetId: string,
  order: BondOrder = 1,
  stereo: BondStereo = "none"
): Bond {
  return {
    id: genId("b"),
    source: sourceId,
    target: targetId,
    order,
    aromatic: order === 1.5,
    stereo,
  };
}

// ─── Graph Queries ──────────────────────────────────────────

export function getAtomById(mol: Molecule, id: string): Atom | undefined {
  return mol.atoms.find((a) => a.id === id);
}

export function getBondById(mol: Molecule, id: string): Bond | undefined {
  return mol.bonds.find((b) => b.id === id);
}

export function getBondsForAtom(mol: Molecule, atomId: string): Bond[] {
  return mol.bonds.filter((b) => b.source === atomId || b.target === atomId);
}

export function getNeighbors(mol: Molecule, atomId: string): Atom[] {
  const bonds = getBondsForAtom(mol, atomId);
  return bonds.map((b) => {
    const neighborId = b.source === atomId ? b.target : b.source;
    return mol.atoms.find((a) => a.id === neighborId)!;
  }).filter(Boolean);
}

export function getBondBetween(mol: Molecule, atomId1: string, atomId2: string): Bond | undefined {
  return mol.bonds.find(
    (b) =>
      (b.source === atomId1 && b.target === atomId2) ||
      (b.source === atomId2 && b.target === atomId1)
  );
}

export function getBondOrderSum(mol: Molecule, atomId: string): number {
  const bonds = getBondsForAtom(mol, atomId);
  return bonds.reduce((sum, b) => sum + b.order, 0);
}

export function getTotalHydrogenCount(mol: Molecule, atomId: string): number {
  const atom = getAtomById(mol, atomId);
  if (!atom) return 0;

  // Count explicit H neighbors
  const hNeighbors = getNeighbors(mol, atomId).filter(
    (n) => n.element === "H"
  ).length;

  if (atom.explicitHCount !== null) {
    return atom.explicitHCount;
  }

  // Calculate implicit
  const bondSum = getBondOrderSum(mol, atomId);
  const implicitH = calcImplicitHydrogens(atom.element, bondSum, atom.formalCharge);
  return hNeighbors + implicitH;
}

export function getImplicitHydrogens(mol: Molecule, atomId: string): number {
  const atom = getAtomById(mol, atomId);
  if (!atom) return 0;
  if (atom.explicitHCount !== null) return 0;
  const bondSum = getBondOrderSum(mol, atomId);
  return calcImplicitHydrogens(atom.element, bondSum, atom.formalCharge);
}

export function getRemainingValence(mol: Molecule, atomId: string): number {
  const atom = getAtomById(mol, atomId);
  if (!atom) return 0;
  const elem = getElement(atom.element);
  if (!elem) return 0;

  const bondSum = getBondOrderSum(mol, atomId);
  const implicitH = getImplicitHydrogens(mol, atomId);

  // The maximum available valence
  const maxV = elem.maxValence;
  return Math.max(0, maxV - bondSum - implicitH + atom.formalCharge);
}

// ─── Connectivity ───────────────────────────────────────────

/** Get connected components (fragments) */
export function getFragments(mol: Molecule): string[][] {
  if (mol.atoms.length === 0) return [];

  const visited = new Set<string>();
  const fragments: string[][] = [];

  for (const atom of mol.atoms) {
    if (visited.has(atom.id)) continue;

    const fragment: string[] = [];
    const queue: string[] = [atom.id];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      fragment.push(current);

      const neighbors = getNeighbors(mol, current);
      for (const n of neighbors) {
        if (!visited.has(n.id)) {
          queue.push(n.id);
        }
      }
    }

    fragments.push(fragment);
  }

  return fragments;
}

// ─── Ring Detection (SSSR via simple DFS) ───────────────────

export function detectRings(mol: Molecule): string[][] {
  // Simple ring detection using DFS
  // Returns arrays of atom IDs forming rings
  const rings: string[][] = [];
  const maxRingSize = 8;

  for (const atom of mol.atoms) {
    findRingsDFS(mol, atom.id, [atom.id], atom.id, maxRingSize, rings);
  }

  // Deduplicate rings (canonical form: sorted, smallest id first)
  const uniqueRings = deduplicateRings(rings);
  return uniqueRings;
}

function findRingsDFS(
  mol: Molecule,
  currentId: string,
  path: string[],
  targetId: string,
  maxSize: number,
  results: string[][]
): void {
  if (path.length > maxSize) return;

  const neighbors = getNeighbors(mol, currentId);
  for (const neighbor of neighbors) {
    // Don't go back the way we came
    if (path.length > 1 && neighbor.id === path[path.length - 2]) continue;

    if (neighbor.id === targetId && path.length >= 3) {
      results.push([...path]);
      continue;
    }

    if (!path.includes(neighbor.id)) {
      findRingsDFS(mol, neighbor.id, [...path, neighbor.id], targetId, maxSize, results);
    }
  }
}

function deduplicateRings(rings: string[][]): string[][] {
  const seen = new Set<string>();
  const unique: string[][] = [];

  for (const ring of rings) {
    const canonical = canonicalizeRing(ring);
    const key = canonical.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(canonical);
    }
  }

  return unique;
}

function canonicalizeRing(ring: string[]): string[] {
  const sorted = [...ring].sort();
  return sorted;
}

// ─── Aromaticity Perception ─────────────────────────────────

export function perceiveAromaticity(mol: Molecule): Set<string> {
  const aromaticAtomIds = new Set<string>();
  const rings = detectRings(mol);

  for (const ring of rings) {
    if (isAromaticRing(mol, ring)) {
      for (const atomId of ring) {
        aromaticAtomIds.add(atomId);
      }
    }
  }

  return aromaticAtomIds;
}

function isAromaticRing(mol: Molecule, ringAtomIds: string[]): boolean {
  // Huckel's rule: 4n+2 pi electrons
  const ringSize = ringAtomIds.length;
  if (ringSize < 5 || ringSize > 7) return false;

  let piElectrons = 0;
  const atomSet = new Set(ringAtomIds);

  for (const atomId of ringAtomIds) {
    const atom = getAtomById(mol, atomId);
    if (!atom) return false;

    // Count pi electrons contributed by this atom
    const bondsInRing = getBondsForAtom(mol, atomId).filter(
      (b) => atomSet.has(b.source) && atomSet.has(b.target)
    );

    const hasDoubleBondInRing = bondsInRing.some((b) => b.order === 2);

    if (hasDoubleBondInRing) {
      piElectrons += 1; // contributes 1 pi electron per double bond end
    } else if (atom.element === "N" || atom.element === "O" || atom.element === "S") {
      // Lone pair donors in conjugated systems
      const totalBondOrder = getBondOrderSum(mol, atomId);
      const elem = getElement(atom.element);
      if (elem) {
        const defaultV = elem.defaultValences[0];
        if (totalBondOrder < defaultV) {
          piElectrons += 2; // lone pair contribution
        }
      }
    }
  }

  // Check Huckel's rule: 4n+2 for n = 0,1,2,...
  for (let n = 0; n <= 3; n++) {
    if (piElectrons === 4 * n + 2) return true;
  }

  return false;
}

// ─── Stereocenter Detection ─────────────────────────────────

export function detectStereocenters(mol: Molecule): string[] {
  const centers: string[] = [];

  for (const atom of mol.atoms) {
    if (isPotentialStereocenter(mol, atom)) {
      centers.push(atom.id);
    }
  }

  return centers;
}

function isPotentialStereocenter(mol: Molecule, atom: Atom): boolean {
  // Must be sp3 carbon (or other tetrahedral center) with 4 different substituents
  if (atom.element !== "C" && atom.element !== "N" && atom.element !== "Si") {
    return false;
  }

  const neighbors = getNeighbors(mol, atom.id);
  const implicitH = getImplicitHydrogens(mol, atom.id);
  const totalNeighbors = neighbors.length + implicitH;

  if (totalNeighbors !== 4) return false;

  // Check all bonds are single bonds
  const bonds = getBondsForAtom(mol, atom.id);
  if (bonds.some((b) => b.order !== 1)) return false;

  // Simple check: all neighbors must be different elements
  // (Full CIP priority comparison would be needed for complete detection)
  const neighborElements = neighbors.map((n) => n.element);
  if (implicitH > 0) {
    for (let i = 0; i < implicitH; i++) neighborElements.push("H");
  }

  // If all 4 are the same, not a stereocenter
  const unique = new Set(neighborElements);
  if (unique.size === 1) return false;

  // If there are duplicate elements, we'd need CIP priority for full detection
  // For now, flag as potential if at least 3 different substituent types
  if (unique.size >= 3) return true;

  // For 2 unique types with 4 neighbors, need deeper analysis
  // Flag as potential for user inspection
  if (unique.size === 2 && neighborElements.length === 4) {
    // e.g., CHCl2F - still a stereocenter check
    const counts = new Map<string, number>();
    for (const e of neighborElements) {
      counts.set(e, (counts.get(e) ?? 0) + 1);
    }
    // If any element appears 3+ times, not a stereocenter
    for (const count of counts.values()) {
      if (count >= 3) return false;
    }
    return true;
  }

  return false;
}

// ─── Valence Validation ─────────────────────────────────────

export interface ValenceCheckResult {
  valid: boolean;
  warnings: ChemWarning[];
}

export function checkValence(mol: Molecule, atomId: string): ValenceCheckResult {
  const atom = getAtomById(mol, atomId);
  if (!atom) return { valid: true, warnings: [] };

  const elem = getElement(atom.element);
  if (!elem) return { valid: true, warnings: [] };

  const bondSum = getBondOrderSum(mol, atomId);
  const implicitH = getImplicitHydrogens(mol, atomId);
  const totalValence = bondSum + implicitH;

  const warnings: ChemWarning[] = [];

  // Check against allowed valences
  const effectiveValence = bondSum - atom.formalCharge;
  const isStandardValence = elem.defaultValences.includes(effectiveValence);
  const exceedsMax = effectiveValence > elem.maxValence;

  if (exceedsMax) {
    warnings.push({
      type: "valence-exceeded",
      message: `${atom.element} has valence ${effectiveValence}, exceeding maximum of ${elem.maxValence}`,
      atomIds: [atomId],
      severity: "error",
    });
  } else if (!isStandardValence && bondSum > 0) {
    if (effectiveValence > elem.defaultValences[elem.defaultValences.length - 1]) {
      warnings.push({
        type: "unusual-valence",
        message: `${atom.element} has unusual valence ${effectiveValence} (standard: ${elem.defaultValences.join(", ")})`,
        atomIds: [atomId],
        severity: "warning",
      });
    }
  }

  if (atom.formalCharge !== 0) {
    warnings.push({
      type: "charged-species",
      message: `${atom.element} has formal charge ${atom.formalCharge > 0 ? "+" : ""}${atom.formalCharge}`,
      atomIds: [atomId],
      severity: "info",
    });
  }

  if (atom.radicalElectrons > 0) {
    warnings.push({
      type: "radical",
      message: `${atom.element} has ${atom.radicalElectrons} radical electron(s)`,
      atomIds: [atomId],
      severity: "warning",
    });
  }

  return {
    valid: warnings.every((w) => w.severity !== "error"),
    warnings,
  };
}

export function validateMolecule(mol: Molecule): ChemWarning[] {
  const warnings: ChemWarning[] = [];

  // Check each atom's valence
  for (const atom of mol.atoms) {
    const result = checkValence(mol, atom.id);
    warnings.push(...result.warnings);
  }

  // Check for disconnected fragments
  const fragments = getFragments(mol);
  if (fragments.length > 1) {
    warnings.push({
      type: "disconnected-fragments",
      message: `Molecule has ${fragments.length} disconnected fragments`,
      severity: "info",
    });
  }

  // Check for unresolved stereocenters
  const stereocenters = detectStereocenters(mol);
  for (const centerId of stereocenters) {
    const atom = getAtomById(mol, centerId);
    if (atom && atom.chiralTag === "none") {
      warnings.push({
        type: "unresolved-stereocenter",
        message: `Atom ${atom.element}${atom.index} is a potential stereocenter with unspecified configuration`,
        atomIds: [centerId],
        severity: "info",
      });
    }
  }

  return warnings;
}

// ─── Molecular Formula ──────────────────────────────────────

export function computeFormula(mol: Molecule): string {
  if (mol.atoms.length === 0) return "";

  const counts = new Map<string, number>();

  for (const atom of mol.atoms) {
    counts.set(atom.element, (counts.get(atom.element) ?? 0) + 1);

    // Add implicit hydrogens
    const implicitH = getImplicitHydrogens(mol, atom.id);
    if (implicitH > 0) {
      counts.set("H", (counts.get("H") ?? 0) + implicitH);
    }
  }

  // Hill system: C first, H second, then alphabetical
  const parts: string[] = [];

  if (counts.has("C")) {
    parts.push("C" + (counts.get("C")! > 1 ? counts.get("C") : ""));
    counts.delete("C");
  }
  if (counts.has("H")) {
    parts.push("H" + (counts.get("H")! > 1 ? counts.get("H") : ""));
    counts.delete("H");
  }

  const remaining = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [element, count] of remaining) {
    parts.push(element + (count > 1 ? count : ""));
  }

  return parts.join("");
}

// ─── Mass Calculation ───────────────────────────────────────

export function computeExactMass(mol: Molecule): number {
  let mass = 0;

  for (const atom of mol.atoms) {
    const elem = getElement(atom.element);
    if (!elem) continue;

    if (atom.isotope > 0) {
      // Use isotope mass (simplified - would need isotope table)
      mass += atom.isotope;
    } else {
      mass += elem.exactMass;
    }

    // Add implicit hydrogen mass
    const implicitH = getImplicitHydrogens(mol, atom.id);
    mass += implicitH * 1.00783;
  }

  return Math.round(mass * 100000) / 100000;
}

export function computeMolecularWeight(mol: Molecule): number {
  let weight = 0;

  for (const atom of mol.atoms) {
    const elem = getElement(atom.element);
    if (!elem) continue;
    weight += elem.mass;

    const implicitH = getImplicitHydrogens(mol, atom.id);
    weight += implicitH * 1.008;
  }

  return Math.round(weight * 1000) / 1000;
}

// ─── SMILES Generation (basic) ──────────────────────────────

export function generateSmiles(mol: Molecule, isomeric: boolean = false): string {
  if (mol.atoms.length === 0) return "";

  const fragments = getFragments(mol);
  const fragmentSmiles: string[] = [];

  for (const fragment of fragments) {
    const smiles = generateFragmentSmiles(mol, fragment, isomeric);
    fragmentSmiles.push(smiles);
  }

  return fragmentSmiles.join(".");
}

function generateFragmentSmiles(
  mol: Molecule,
  atomIds: string[],
  isomeric: boolean
): string {
  if (atomIds.length === 0) return "";

  const visited = new Set<string>();
  const ringClosures = new Map<string, number>();
  let ringCounter = 1;

  // Detect ring bonds for this fragment
  const fragmentAtomSet = new Set(atomIds);
  const ringBonds: Set<string> = new Set();

  // Find back edges (ring closure bonds) via DFS
  const dfsVisited = new Set<string>();
  const dfsStack = new Set<string>();

  function findRingBonds(atomId: string, parentId: string | null) {
    dfsVisited.add(atomId);
    dfsStack.add(atomId);

    const neighbors = getNeighbors(mol, atomId).filter((n) =>
      fragmentAtomSet.has(n.id)
    );

    for (const neighbor of neighbors) {
      if (neighbor.id === parentId) continue;

      if (dfsStack.has(neighbor.id)) {
        // Back edge - ring closure
        const bondKey = [atomId, neighbor.id].sort().join("-");
        ringBonds.add(bondKey);
      } else if (!dfsVisited.has(neighbor.id)) {
        findRingBonds(neighbor.id, atomId);
      }
    }

    dfsStack.delete(atomId);
  }

  findRingBonds(atomIds[0], null);

  // Generate SMILES via DFS
  function atomToSmiles(atomId: string): string {
    const atom = getAtomById(mol, atomId);
    if (!atom) return "?";

    visited.add(atomId);

    // Build atom string
    let atomStr = "";
    const needsBrackets =
      atom.formalCharge !== 0 ||
      atom.isotope > 0 ||
      atom.explicitHCount !== null ||
      atom.radicalElectrons > 0 ||
      (isomeric && atom.chiralTag !== "none" && atom.chiralTag !== "unspecified") ||
      !["B", "C", "N", "O", "P", "S", "F", "Cl", "Br", "I"].includes(atom.element);

    if (needsBrackets) {
      atomStr += "[";
      if (atom.isotope > 0) atomStr += atom.isotope;
      atomStr += atom.aromatic ? atom.element.toLowerCase() : atom.element;
      if (isomeric && atom.chiralTag === "R") atomStr += "@@";
      if (isomeric && atom.chiralTag === "S") atomStr += "@";
      if (atom.explicitHCount !== null && atom.explicitHCount > 0) {
        atomStr += "H" + (atom.explicitHCount > 1 ? atom.explicitHCount : "");
      }
      if (atom.formalCharge > 0) {
        atomStr += "+" + (atom.formalCharge > 1 ? atom.formalCharge : "");
      } else if (atom.formalCharge < 0) {
        atomStr += "-" + (atom.formalCharge < -1 ? Math.abs(atom.formalCharge) : "");
      }
      atomStr += "]";
    } else {
      atomStr += atom.aromatic ? atom.element.toLowerCase() : atom.element;
    }

    // Handle ring closures at this atom
    const bonds = getBondsForAtom(mol, atomId).filter((b) =>
      fragmentAtomSet.has(b.source) && fragmentAtomSet.has(b.target)
    );

    for (const bond of bonds) {
      const neighborId = bond.source === atomId ? bond.target : bond.source;
      const bondKey = [atomId, neighborId].sort().join("-");

      if (ringBonds.has(bondKey)) {
        if (!ringClosures.has(bondKey)) {
          // First visit - open ring
          const rNum = ringCounter++;
          ringClosures.set(bondKey, rNum);
          let bondChar = "";
          if (bond.order === 2) bondChar = "=";
          else if (bond.order === 3) bondChar = "#";
          atomStr += bondChar + (rNum > 9 ? `%${rNum}` : rNum);
        } else if (visited.has(neighborId)) {
          // Second visit - close ring
          const rNum = ringClosures.get(bondKey)!;
          atomStr += rNum > 9 ? `%${rNum}` : rNum;
        }
      }
    }

    // Visit unvisited non-ring neighbors
    const unvisitedNeighbors = bonds
      .filter((b) => {
        const nId = b.source === atomId ? b.target : b.source;
        const bk = [atomId, nId].sort().join("-");
        return !visited.has(nId) && !ringBonds.has(bk);
      })
      .map((b) => ({
        bond: b,
        neighborId: b.source === atomId ? b.target : b.source,
      }));

    if (unvisitedNeighbors.length === 0) {
      return atomStr;
    }

    // First branch is inline, rest are in parentheses
    const branches = unvisitedNeighbors.map(({ bond, neighborId }) => {
      let bondChar = "";
      if (bond.order === 2) bondChar = "=";
      else if (bond.order === 3) bondChar = "#";
      else if (bond.aromatic) bondChar = ":";
      return bondChar + atomToSmiles(neighborId);
    });

    // First branch inline
    atomStr += branches[0];

    // Additional branches in parentheses
    for (let i = 1; i < branches.length; i++) {
      atomStr += `(${branches[i]})`;
    }

    return atomStr;
  }

  return atomToSmiles(atomIds[0]);
}

// ─── MOL File Generation ────────────────────────────────────

export function generateMolFile(mol: Molecule): string {
  const lines: string[] = [];

  // Header
  lines.push("Valence Studio");
  lines.push("  ValenceStudio  3D");
  lines.push("");

  // Counts line
  const atomCount = mol.atoms.length;
  const bondCount = mol.bonds.length;
  lines.push(
    `${pad(atomCount, 3)}${pad(bondCount, 3)}  0  0  0  0  0  0  0  0999 V2000`
  );

  // Atom block
  for (const atom of mol.atoms) {
    const x = atom.position3d?.x ?? atom.position2d?.x ?? 0;
    const y = atom.position3d?.y ?? atom.position2d?.y ?? 0;
    const z = atom.position3d?.z ?? 0;
    const chg = atom.formalCharge === 0 ? 0 :
      atom.formalCharge === 1 ? 3 :
      atom.formalCharge === 2 ? 2 :
      atom.formalCharge === 3 ? 1 :
      atom.formalCharge === -1 ? 5 :
      atom.formalCharge === -2 ? 6 :
      atom.formalCharge === -3 ? 7 : 0;

    lines.push(
      `${padF(x, 10, 4)}${padF(y, 10, 4)}${padF(z, 10, 4)} ${padR(atom.element, 3)}` +
      ` 0${pad(chg, 3)}  0  0  0  0  0  0  0  0  0  0`
    );
  }

  // Bond block
  const atomIdToIdx = new Map<string, number>();
  mol.atoms.forEach((a, i) => atomIdToIdx.set(a.id, i + 1));

  for (const bond of mol.bonds) {
    const s = atomIdToIdx.get(bond.source) ?? 0;
    const t = atomIdToIdx.get(bond.target) ?? 0;
    const order = bond.order === 1.5 ? 4 : bond.order;
    const stereoVal = bond.stereo === "up" ? 1 : bond.stereo === "down" ? 6 : 0;
    lines.push(
      `${pad(s, 3)}${pad(t, 3)}${pad(order, 3)}${pad(stereoVal, 3)}  0  0  0`
    );
  }

  lines.push("M  END");
  return lines.join("\n");
}

function pad(n: number, width: number): string {
  return String(n).padStart(width);
}

function padF(n: number, width: number, decimals: number): string {
  return n.toFixed(decimals).padStart(width);
}

function padR(s: string, width: number): string {
  return s.padEnd(width);
}

// ─── XYZ File Generation ────────────────────────────────────

export function generateXYZFile(mol: Molecule): string {
  const lines: string[] = [];
  const totalAtoms = mol.atoms.length;

  // Count implicit hydrogens for full representation
  let implicitHTotal = 0;
  for (const atom of mol.atoms) {
    implicitHTotal += getImplicitHydrogens(mol, atom.id);
  }

  lines.push(String(totalAtoms + implicitHTotal));
  lines.push("Generated by Valence Studio");

  for (const atom of mol.atoms) {
    const x = atom.position3d?.x ?? atom.position2d?.x ?? 0;
    const y = atom.position3d?.y ?? atom.position2d?.y ?? 0;
    const z = atom.position3d?.z ?? 0;
    lines.push(`${atom.element}  ${x.toFixed(6)}  ${y.toFixed(6)}  ${z.toFixed(6)}`);
  }

  return lines.join("\n");
}

// ─── Metadata Computation ───────────────────────────────────

export function computeMetadata(mol: Molecule): MoleculeMetadata {
  const warnings = validateMolecule(mol);
  const formula = computeFormula(mol);
  const exactMass = computeExactMass(mol);
  const mw = computeMolecularWeight(mol);
  const fragments = getFragments(mol);
  const rings = detectRings(mol);
  const aromaticAtoms = perceiveAromaticity(mol);
  const stereocenters = detectStereocenters(mol);
  const smiles = generateSmiles(mol, false);
  const isomericSmiles = generateSmiles(mol, true);

  // Count aromatic rings
  let aromaticRingCount = 0;
  for (const ring of rings) {
    if (ring.every((id) => aromaticAtoms.has(id))) {
      aromaticRingCount++;
    }
  }

  // Count E/Z bonds
  const ezBondCount = mol.bonds.filter(
    (b) => b.stereo === "E" || b.stereo === "Z"
  ).length;

  const hasErrors = warnings.some((w) => w.severity === "error");
  const hasWarnings = warnings.some((w) => w.severity === "warning");
  const sanitizationStatus: SanitizationStatus = hasErrors
    ? "invalid"
    : hasWarnings
    ? "warnings"
    : "valid";

  return {
    formula,
    exactMass,
    molecularWeight: mw,
    totalFormalCharge: mol.atoms.reduce((sum, a) => sum + a.formalCharge, 0),
    atomCount: mol.atoms.length,
    heavyAtomCount: mol.atoms.filter((a) => a.element !== "H").length,
    bondCount: mol.bonds.length,
    ringCount: rings.length,
    aromaticRingCount,
    stereocenterCount: stereocenters.length,
    ezBondCount,
    fragmentCount: fragments.length,
    smiles,
    isomericSmiles,
    inchi: "", // Would need RDKit for proper InChI
    inchiKey: "",
    sanitizationStatus,
    warnings,
  };
}

// ─── Deep Clone ─────────────────────────────────────────────

export function cloneMolecule(mol: Molecule): Molecule {
  return JSON.parse(JSON.stringify(mol));
}
