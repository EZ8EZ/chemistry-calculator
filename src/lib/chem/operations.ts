/**
 * Molecular editing operations.
 * Each operation takes a molecule and returns a new molecule (immutable pattern).
 * Operations validate chemistry rules and handle ambiguity.
 */

import {
  Atom, Bond, BondOrder, Molecule, ChemWarning,
  CandidateStructure, CandidateDifference, Point2D,
} from "./types";
import {
  createAtom, createBond, cloneMolecule, computeMetadata,
  getAtomById, getBondsForAtom, getNeighbors, getBondOrderSum,
  getImplicitHydrogens, getBondBetween, getFragments,
  generateSmiles,
} from "./graph";
import { getElement, calcImplicitHydrogens } from "./elements";

// ─── Operation Results ──────────────────────────────────────

export interface OperationResult {
  success: boolean;
  molecule: Molecule;
  candidates?: CandidateStructure[];
  warnings: ChemWarning[];
  message: string;
}

// ─── Add Atom ───────────────────────────────────────────────

/**
 * Add an atom to the molecule.
 * If targetAtomId is null, adds a free atom.
 * If targetAtomId is provided, creates a bond to the target.
 * Returns candidates if multiple valid placements exist.
 */
export function addAtom(
  mol: Molecule,
  element: string,
  targetAtomId: string | null,
  bondOrder: BondOrder = 1,
  position2d?: Point2D
): OperationResult {
  const newMol = cloneMolecule(mol);
  const elem = getElement(element);

  if (!elem) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: `Unknown element: ${element}`,
    };
  }

  // Free atom (no target)
  if (targetAtomId === null) {
    const pos = position2d ?? calculateFreeAtomPosition(newMol);
    const atom = createAtom(element, newMol.atoms.length, pos);
    newMol.atoms.push(atom);
    newMol.metadata = computeMetadata(newMol);

    return {
      success: true,
      molecule: newMol,
      warnings: [],
      message: `Added ${elem.name} atom`,
    };
  }

  // Bonded atom
  const targetAtom = getAtomById(newMol, targetAtomId);
  if (!targetAtom) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Target atom not found",
    };
  }

  // Check if target can accept this bond
  const targetBondSum = getBondOrderSum(newMol, targetAtomId);
  const targetImplicitH = getImplicitHydrogens(newMol, targetAtomId);
  const targetElem = getElement(targetAtom.element);

  if (!targetElem) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: `Unknown element on target: ${targetAtom.element}`,
    };
  }

  // Check valence: can the target accommodate this bond?
  const availableValence = targetElem.maxValence - targetBondSum + targetAtom.formalCharge;
  if (availableValence < bondOrder) {
    return {
      success: false,
      molecule: mol,
      warnings: [{
        type: "valence-exceeded",
        message: `${targetAtom.element} cannot accept a bond of order ${bondOrder}. Available valence: ${availableValence}`,
        atomIds: [targetAtomId],
        severity: "error",
      }],
      message: `That ${targetAtom.element} already satisfies its allowed valence under the current bond pattern`,
    };
  }

  // Calculate position for new atom
  const pos = position2d ?? calculateBondedAtomPosition(newMol, targetAtomId);
  const newAtom = createAtom(element, newMol.atoms.length, pos);
  newMol.atoms.push(newAtom);

  const bond = createBond(targetAtomId, newAtom.id, bondOrder);
  newMol.bonds.push(bond);

  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: `Added ${elem.name} bonded to ${targetAtom.element}${targetAtom.index} with ${bondOrderLabel(bondOrder)} bond`,
  };
}

/**
 * Find all valid attachment sites for adding an element to the molecule.
 * Returns candidate structures when multiple non-equivalent sites exist.
 */
export function findAttachmentSites(
  mol: Molecule,
  element: string,
  bondOrder: BondOrder = 1
): CandidateStructure[] {
  const candidates: CandidateStructure[] = [];
  const seen = new Set<string>();

  for (const atom of mol.atoms) {
    // Check if this atom can accept the bond
    const bondSum = getBondOrderSum(mol, atom.id);
    const elem = getElement(atom.element);
    if (!elem) continue;

    const available = elem.maxValence - bondSum + atom.formalCharge;
    if (available < bondOrder) continue;

    // Generate the candidate molecule
    const result = addAtom(mol, element, atom.id, bondOrder);
    if (!result.success) continue;

    // Deduplicate by canonical SMILES
    const smiles = generateSmiles(result.molecule, false);
    if (seen.has(smiles)) continue;
    seen.add(smiles);

    candidates.push({
      id: `candidate_${candidates.length}`,
      molecule: result.molecule,
      label: `Attach to ${atom.element}${atom.index}`,
      description: `${bondOrderLabel(bondOrder)} bond to ${atom.element} at position ${atom.index}`,
      plausibilityScore: scorePlausibility(result.molecule, atom, element, bondOrder),
      differences: [{
        type: "attachment-site",
        description: `Bonded to ${atom.element}${atom.index}`,
      }],
      smiles,
    });
  }

  // Sort by plausibility
  candidates.sort((a, b) => b.plausibilityScore - a.plausibilityScore);

  return candidates;
}

// ─── Remove Atom ────────────────────────────────────────────

export interface RemovalResult extends OperationResult {
  fragmentsCreated?: number;
  ringBroken?: boolean;
}

export function removeAtom(
  mol: Molecule,
  atomId: string
): RemovalResult {
  const atom = getAtomById(mol, atomId);
  if (!atom) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Atom not found",
    };
  }

  const newMol = cloneMolecule(mol);

  // Check what happens when we remove this atom
  const wasFragments = getFragments(mol).length;

  // Remove all bonds connected to this atom
  newMol.bonds = newMol.bonds.filter(
    (b) => b.source !== atomId && b.target !== atomId
  );

  // Remove the atom
  newMol.atoms = newMol.atoms.filter((a) => a.id !== atomId);

  // Reindex atoms
  newMol.atoms.forEach((a, i) => {
    a.index = i;
  });

  const nowFragments = getFragments(newMol).length;
  const fragmentsCreated = nowFragments - wasFragments + 1; // +1 because we removed one

  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: `Removed ${atom.element}${atom.index}${fragmentsCreated > 0 ? ` (created ${fragmentsCreated} new fragment(s))` : ""}`,
    fragmentsCreated: fragmentsCreated > 0 ? fragmentsCreated : undefined,
    ringBroken: false, // Would need ring detection comparison
  };
}

// ─── Add/Remove/Change Bond ─────────────────────────────────

export function addBond(
  mol: Molecule,
  atomId1: string,
  atomId2: string,
  order: BondOrder = 1
): OperationResult {
  // Check atoms exist
  const atom1 = getAtomById(mol, atomId1);
  const atom2 = getAtomById(mol, atomId2);

  if (!atom1 || !atom2) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "One or both atoms not found",
    };
  }

  // Check for existing bond
  const existing = getBondBetween(mol, atomId1, atomId2);
  if (existing) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: `Bond already exists between ${atom1.element}${atom1.index} and ${atom2.element}${atom2.index}`,
    };
  }

  // Check valence for both atoms
  for (const [atom, atomId] of [[atom1, atomId1], [atom2, atomId2]] as [Atom, string][]) {
    const bondSum = getBondOrderSum(mol, atomId);
    const elem = getElement(atom.element);
    if (!elem) continue;
    const available = elem.maxValence - bondSum + atom.formalCharge;
    if (available < order) {
      return {
        success: false,
        molecule: mol,
        warnings: [{
          type: "valence-exceeded",
          message: `${atom.element}${atom.index} cannot accept bond order ${order}`,
          atomIds: [atomId],
          severity: "error",
        }],
        message: `Adding this bond would exceed valence for ${atom.element}${atom.index}`,
      };
    }
  }

  const newMol = cloneMolecule(mol);
  const bond = createBond(atomId1, atomId2, order);
  newMol.bonds.push(bond);
  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: `Added ${bondOrderLabel(order)} bond between ${atom1.element}${atom1.index} and ${atom2.element}${atom2.index}`,
  };
}

export function removeBond(
  mol: Molecule,
  bondId: string
): OperationResult {
  const bond = mol.bonds.find((b) => b.id === bondId);
  if (!bond) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Bond not found",
    };
  }

  const newMol = cloneMolecule(mol);
  newMol.bonds = newMol.bonds.filter((b) => b.id !== bondId);
  newMol.metadata = computeMetadata(newMol);

  const atom1 = getAtomById(mol, bond.source);
  const atom2 = getAtomById(mol, bond.target);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: `Removed bond between ${atom1?.element}${atom1?.index} and ${atom2?.element}${atom2?.index}`,
  };
}

export function changeBondOrder(
  mol: Molecule,
  bondId: string,
  newOrder: BondOrder
): OperationResult {
  const bond = mol.bonds.find((b) => b.id === bondId);
  if (!bond) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Bond not found",
    };
  }

  // Check valence for both atoms with new bond order
  const orderDiff = newOrder - bond.order;
  for (const atomId of [bond.source, bond.target]) {
    const atom = getAtomById(mol, atomId);
    if (!atom) continue;
    const elem = getElement(atom.element);
    if (!elem) continue;
    const bondSum = getBondOrderSum(mol, atomId);
    const newBondSum = bondSum + orderDiff;
    if (newBondSum - atom.formalCharge > elem.maxValence) {
      return {
        success: false,
        molecule: mol,
        warnings: [{
          type: "valence-exceeded",
          message: `Changing bond order would exceed valence for ${atom.element}${atom.index}`,
          atomIds: [atomId],
          severity: "error",
        }],
        message: `Cannot change to ${bondOrderLabel(newOrder)} bond: would exceed valence for ${atom.element}${atom.index}`,
      };
    }
  }

  const newMol = cloneMolecule(mol);
  const targetBond = newMol.bonds.find((b) => b.id === bondId)!;
  targetBond.order = newOrder;
  targetBond.aromatic = newOrder === 1.5;
  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: `Changed bond to ${bondOrderLabel(newOrder)}`,
  };
}

// ─── Charge Operations ──────────────────────────────────────

export function setFormalCharge(
  mol: Molecule,
  atomId: string,
  charge: number
): OperationResult {
  const atom = getAtomById(mol, atomId);
  if (!atom) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Atom not found",
    };
  }

  const newMol = cloneMolecule(mol);
  const targetAtom = newMol.atoms.find((a) => a.id === atomId)!;
  targetAtom.formalCharge = charge;
  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: `Set formal charge of ${atom.element}${atom.index} to ${charge > 0 ? "+" : ""}${charge}`,
  };
}

// ─── Isotope Operations ─────────────────────────────────────

export function setIsotope(
  mol: Molecule,
  atomId: string,
  isotope: number
): OperationResult {
  const atom = getAtomById(mol, atomId);
  if (!atom) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Atom not found",
    };
  }

  const newMol = cloneMolecule(mol);
  const targetAtom = newMol.atoms.find((a) => a.id === atomId)!;
  targetAtom.isotope = isotope;
  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: isotope > 0
      ? `Set isotope of ${atom.element}${atom.index} to ${isotope}`
      : `Cleared isotope for ${atom.element}${atom.index}`,
  };
}

// ─── Radical Operations ─────────────────────────────────────

export function setRadical(
  mol: Molecule,
  atomId: string,
  radicalElectrons: number
): OperationResult {
  const atom = getAtomById(mol, atomId);
  if (!atom) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Atom not found",
    };
  }

  if (radicalElectrons < 0 || radicalElectrons > 2) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Radical electrons must be 0, 1, or 2",
    };
  }

  const newMol = cloneMolecule(mol);
  const targetAtom = newMol.atoms.find((a) => a.id === atomId)!;
  targetAtom.radicalElectrons = radicalElectrons;
  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: radicalElectrons > 0
      ? `Set ${radicalElectrons} radical electron(s) on ${atom.element}${atom.index}`
      : `Cleared radical on ${atom.element}${atom.index}`,
  };
}

// ─── Stereochemistry ────────────────────────────────────────

export function setChirality(
  mol: Molecule,
  atomId: string,
  tag: "none" | "R" | "S" | "unspecified"
): OperationResult {
  const atom = getAtomById(mol, atomId);
  if (!atom) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Atom not found",
    };
  }

  const newMol = cloneMolecule(mol);
  const targetAtom = newMol.atoms.find((a) => a.id === atomId)!;
  targetAtom.chiralTag = tag;
  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: tag === "none"
      ? `Cleared stereochemistry for ${atom.element}${atom.index}`
      : `Set ${atom.element}${atom.index} chirality to ${tag}`,
  };
}

export function setBondStereo(
  mol: Molecule,
  bondId: string,
  stereo: "none" | "E" | "Z" | "up" | "down"
): OperationResult {
  const bond = mol.bonds.find((b) => b.id === bondId);
  if (!bond) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Bond not found",
    };
  }

  const newMol = cloneMolecule(mol);
  const targetBond = newMol.bonds.find((b) => b.id === bondId)!;
  targetBond.stereo = stereo;
  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: `Set bond stereo to ${stereo}`,
  };
}

// ─── Explicit Hydrogen Toggle ───────────────────────────────

export function toggleExplicitHydrogens(
  mol: Molecule,
  atomId: string
): OperationResult {
  const atom = getAtomById(mol, atomId);
  if (!atom) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Atom not found",
    };
  }

  const newMol = cloneMolecule(mol);
  const targetAtom = newMol.atoms.find((a) => a.id === atomId)!;

  if (targetAtom.explicitHCount !== null) {
    // Switch back to implicit
    targetAtom.explicitHCount = null;
  } else {
    // Calculate current implicit H and make them explicit
    const bondSum = getBondOrderSum(mol, atomId);
    const implicitH = calcImplicitHydrogens(atom.element, bondSum, atom.formalCharge);
    targetAtom.explicitHCount = implicitH;
  }

  newMol.metadata = computeMetadata(newMol);

  return {
    success: true,
    molecule: newMol,
    warnings: newMol.metadata.warnings,
    message: targetAtom.explicitHCount !== null
      ? `Set explicit H count to ${targetAtom.explicitHCount} for ${atom.element}${atom.index}`
      : `Using implicit hydrogens for ${atom.element}${atom.index}`,
  };
}

// ─── Ring Closure ───────────────────────────────────────────

export function closeRing(
  mol: Molecule,
  atomId1: string,
  atomId2: string,
  bondOrder: BondOrder = 1
): OperationResult {
  // Ring closure is just a bond between existing atoms that creates a cycle
  const existing = getBondBetween(mol, atomId1, atomId2);
  if (existing) {
    return {
      success: false,
      molecule: mol,
      warnings: [],
      message: "Bond already exists between these atoms",
    };
  }

  const result = addBond(mol, atomId1, atomId2, bondOrder);
  if (result.success) {
    return {
      ...result,
      message: `Ring closure: ${result.message}`,
    };
  }
  return result;
}

// ─── Clear All ──────────────────────────────────────────────

export function clearMolecule(): OperationResult {
  const newMol = {
    atoms: [],
    bonds: [],
    metadata: computeMetadata({ atoms: [], bonds: [], metadata: {} as any }),
  };
  return {
    success: true,
    molecule: newMol as Molecule,
    warnings: [],
    message: "Cleared all atoms and bonds",
  };
}

// ─── Helpers ────────────────────────────────────────────────

function calculateFreeAtomPosition(mol: Molecule): Point2D {
  if (mol.atoms.length === 0) {
    return { x: 0, y: 0 };
  }

  // Place new atom offset from the center of existing atoms
  let cx = 0, cy = 0;
  for (const a of mol.atoms) {
    cx += a.position2d?.x ?? 0;
    cy += a.position2d?.y ?? 0;
  }
  cx /= mol.atoms.length;
  cy /= mol.atoms.length;

  return { x: cx + 2.0, y: cy };
}

function calculateBondedAtomPosition(mol: Molecule, targetAtomId: string): Point2D {
  const target = getAtomById(mol, targetAtomId);
  if (!target || !target.position2d) {
    return { x: 1.5, y: 0 };
  }

  const neighbors = getNeighbors(mol, targetAtomId);
  const bondLength = 1.5;

  if (neighbors.length === 0) {
    // First bond: extend to the right
    return {
      x: target.position2d.x + bondLength,
      y: target.position2d.y,
    };
  }

  // Calculate average neighbor direction and go opposite
  let avgDx = 0, avgDy = 0;
  let count = 0;
  for (const n of neighbors) {
    if (n.position2d) {
      avgDx += n.position2d.x - target.position2d.x;
      avgDy += n.position2d.y - target.position2d.y;
      count++;
    }
  }

  if (count > 0) {
    avgDx /= count;
    avgDy /= count;

    // Rotate ~120 degrees from average neighbor direction
    const angle = Math.atan2(avgDy, avgDx) + (2 * Math.PI) / 3;
    return {
      x: target.position2d.x + bondLength * Math.cos(angle),
      y: target.position2d.y + bondLength * Math.sin(angle),
    };
  }

  return {
    x: target.position2d.x + bondLength,
    y: target.position2d.y,
  };
}

function bondOrderLabel(order: BondOrder): string {
  switch (order) {
    case 1: return "single";
    case 1.5: return "aromatic";
    case 2: return "double";
    case 3: return "triple";
    default: return String(order);
  }
}

function scorePlausibility(
  mol: Molecule,
  targetAtom: Atom,
  newElement: string,
  bondOrder: BondOrder
): number {
  let score = 0.5;

  // Prefer standard valence patterns
  const elem = getElement(targetAtom.element);
  if (elem) {
    const bondSum = getBondOrderSum(mol, targetAtom.id);
    if (elem.defaultValences.includes(bondSum + bondOrder)) {
      score += 0.2;
    }
  }

  // Prefer C-C, C-N, C-O patterns in organic chemistry
  const commonPairs = new Set(["C-C", "C-N", "C-O", "C-S", "C-F", "C-Cl", "C-Br", "N-H", "O-H"]);
  const pair1 = `${targetAtom.element}-${newElement}`;
  const pair2 = `${newElement}-${targetAtom.element}`;
  if (commonPairs.has(pair1) || commonPairs.has(pair2)) {
    score += 0.15;
  }

  // Penalize creating radicals
  if (mol.metadata.warnings.some((w) => w.type === "radical")) {
    score -= 0.2;
  }

  return Math.max(0, Math.min(1, score));
}
