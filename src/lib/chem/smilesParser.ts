/**
 * Basic SMILES parser that converts SMILES strings into Molecule objects.
 * Handles: atoms, bonds (implicit single, =, #), branches, ring closures,
 * aromatic atoms, charges, isotopes, stereo (@/@@), and explicit H.
 *
 * This is a simplified parser — for full canonical handling, a backend
 * with RDKit would be used. But it covers the templates and common molecules.
 */

import { Molecule, Atom, Bond, BondOrder, BondStereo, ChiralTag, Point2D } from "./types";
import { createEmptyMolecule, createAtom, createBond, computeMetadata } from "./graph";
import { getElement } from "./elements";

interface ParseState {
  pos: number;
  atoms: Atom[];
  bonds: Bond[];
  currentAtomIdx: number;
  branchStack: number[];
  ringOpenings: Map<number, { atomIdx: number; bondOrder: BondOrder }>;
  pendingBondOrder: BondOrder;
  pendingBondStereo: BondStereo;
  atomIndex: number;
}

const ORGANIC_SUBSET = new Set(["B", "C", "N", "O", "P", "S", "F", "Cl", "Br", "I"]);
const AROMATIC_ATOMS = new Set(["b", "c", "n", "o", "p", "s"]);

export function parseSMILES(smiles: string): Molecule | null {
  if (!smiles || smiles.trim() === "") return createEmptyMolecule();

  try {
    const mol = createEmptyMolecule();

    // Handle dot-separated fragments
    const fragments = splitFragments(smiles);
    let globalAtomOffset = 0;

    for (const fragment of fragments) {
      const state: ParseState = {
        pos: 0,
        atoms: [],
        bonds: [],
        currentAtomIdx: -1,
        branchStack: [],
        ringOpenings: new Map(),
        pendingBondOrder: 1,
        pendingBondStereo: "none",
        atomIndex: globalAtomOffset,
      };

      parseFragment(fragment, state);

      // Assign 2D coordinates
      layoutFragment(state.atoms, state.bonds, globalAtomOffset);

      mol.atoms.push(...state.atoms);
      mol.bonds.push(...state.bonds);
      globalAtomOffset += state.atoms.length;
    }

    mol.metadata = computeMetadata(mol);
    return mol;
  } catch (e) {
    console.warn("SMILES parse error:", e);
    return null;
  }
}

function splitFragments(smiles: string): string[] {
  // Split on dots that are not inside brackets
  const fragments: string[] = [];
  let current = "";
  let bracketDepth = 0;

  for (const ch of smiles) {
    if (ch === "[") bracketDepth++;
    else if (ch === "]") bracketDepth--;
    else if (ch === "." && bracketDepth === 0) {
      if (current) fragments.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) fragments.push(current);
  return fragments;
}

function parseFragment(smiles: string, state: ParseState): void {
  while (state.pos < smiles.length) {
    const ch = smiles[state.pos];

    if (ch === "(") {
      // Branch open
      state.branchStack.push(state.currentAtomIdx);
      state.pos++;
    } else if (ch === ")") {
      // Branch close
      state.currentAtomIdx = state.branchStack.pop() ?? -1;
      state.pos++;
      state.pendingBondOrder = 1;
      state.pendingBondStereo = "none";
    } else if (ch === "=") {
      state.pendingBondOrder = 2;
      state.pos++;
    } else if (ch === "#") {
      state.pendingBondOrder = 3;
      state.pos++;
    } else if (ch === ":") {
      state.pendingBondOrder = 1.5 as BondOrder;
      state.pos++;
    } else if (ch === "/" || ch === "\\") {
      // Geometric stereo indicator
      state.pendingBondStereo = ch === "/" ? "up" : "down";
      state.pos++;
    } else if (ch === "[") {
      // Bracket atom
      const atom = parseBracketAtom(smiles, state);
      if (atom) addAtomToState(state, atom);
    } else if (AROMATIC_ATOMS.has(ch)) {
      // Aromatic atom
      const element = ch.toUpperCase();
      const atom = createAtom(element, state.atomIndex++);
      atom.aromatic = true;
      addAtomToState(state, atom);
      state.pos++;
    } else if (ch >= "A" && ch <= "Z") {
      // Organic subset atom
      let symbol = ch;
      state.pos++;
      // Check for two-letter elements (Cl, Br)
      if (state.pos < smiles.length) {
        const next = smiles[state.pos];
        if (next >= "a" && next <= "z") {
          const twoLetter = symbol + next;
          if (ORGANIC_SUBSET.has(twoLetter)) {
            symbol = twoLetter;
            state.pos++;
          }
        }
      }

      if (getElement(symbol)) {
        const atom = createAtom(symbol, state.atomIndex++);
        addAtomToState(state, atom);
      } else {
        state.pos++;
      }
    } else if (ch >= "0" && ch <= "9") {
      // Ring closure
      const ringNum = parseInt(ch);
      handleRingClosure(state, ringNum);
      state.pos++;
    } else if (ch === "%") {
      // Two-digit ring number
      state.pos++;
      if (state.pos + 1 < smiles.length) {
        const ringNum = parseInt(smiles.substring(state.pos, state.pos + 2));
        handleRingClosure(state, ringNum);
        state.pos += 2;
      }
    } else {
      state.pos++;
    }
  }
}

function parseBracketAtom(smiles: string, state: ParseState): Atom | null {
  state.pos++; // skip [
  let isotope = 0;
  let element = "";
  let chiralTag: ChiralTag = "none";
  let hCount: number | null = null;
  let charge = 0;
  let aromatic = false;

  // Isotope
  while (state.pos < smiles.length && smiles[state.pos] >= "0" && smiles[state.pos] <= "9") {
    isotope = isotope * 10 + parseInt(smiles[state.pos]);
    state.pos++;
  }

  // Element
  if (state.pos < smiles.length) {
    if (AROMATIC_ATOMS.has(smiles[state.pos])) {
      element = smiles[state.pos].toUpperCase();
      aromatic = true;
      state.pos++;
    } else if (smiles[state.pos] >= "A" && smiles[state.pos] <= "Z") {
      element = smiles[state.pos];
      state.pos++;
      if (state.pos < smiles.length && smiles[state.pos] >= "a" && smiles[state.pos] <= "z") {
        element += smiles[state.pos];
        state.pos++;
      }
    }
  }

  // Chirality
  if (state.pos < smiles.length && smiles[state.pos] === "@") {
    state.pos++;
    if (state.pos < smiles.length && smiles[state.pos] === "@") {
      chiralTag = "R";
      state.pos++;
    } else {
      chiralTag = "S";
    }
  }

  // Hydrogen count
  if (state.pos < smiles.length && smiles[state.pos] === "H") {
    state.pos++;
    hCount = 1;
    if (state.pos < smiles.length && smiles[state.pos] >= "0" && smiles[state.pos] <= "9") {
      hCount = parseInt(smiles[state.pos]);
      state.pos++;
    }
  }

  // Charge
  if (state.pos < smiles.length && (smiles[state.pos] === "+" || smiles[state.pos] === "-")) {
    const sign = smiles[state.pos] === "+" ? 1 : -1;
    state.pos++;
    let mag = 1;
    if (state.pos < smiles.length && smiles[state.pos] >= "0" && smiles[state.pos] <= "9") {
      mag = parseInt(smiles[state.pos]);
      state.pos++;
    } else {
      // Count repeated + or -
      while (state.pos < smiles.length && smiles[state.pos] === (sign > 0 ? "+" : "-")) {
        mag++;
        state.pos++;
      }
    }
    charge = sign * mag;
  }

  // Skip to closing bracket
  while (state.pos < smiles.length && smiles[state.pos] !== "]") {
    state.pos++;
  }
  state.pos++; // skip ]

  if (!element) return null;

  const atom = createAtom(element, state.atomIndex++);
  atom.isotope = isotope;
  atom.chiralTag = chiralTag;
  atom.explicitHCount = hCount;
  atom.formalCharge = charge;
  atom.aromatic = aromatic;

  return atom;
}

function addAtomToState(state: ParseState, atom: Atom): void {
  const atomIdx = state.atoms.length;
  state.atoms.push(atom);

  // Bond to previous atom
  if (state.currentAtomIdx >= 0) {
    const prevAtom = state.atoms[state.currentAtomIdx];
    let order = state.pendingBondOrder;

    // Aromatic bond handling
    if (prevAtom.aromatic && atom.aromatic && order === 1) {
      order = 1.5 as BondOrder;
    }

    const bond = createBond(prevAtom.id, atom.id, order);
    bond.stereo = state.pendingBondStereo;
    state.bonds.push(bond);
  }

  state.currentAtomIdx = atomIdx;
  state.pendingBondOrder = 1;
  state.pendingBondStereo = "none";
}

function handleRingClosure(state: ParseState, ringNum: number): void {
  if (state.ringOpenings.has(ringNum)) {
    // Close ring
    const opening = state.ringOpenings.get(ringNum)!;
    const openAtom = state.atoms[opening.atomIdx];
    const closeAtom = state.atoms[state.currentAtomIdx];

    let order = state.pendingBondOrder !== 1 ? state.pendingBondOrder : opening.bondOrder;

    // Aromatic ring closure
    if (openAtom.aromatic && closeAtom.aromatic && order === 1) {
      order = 1.5 as BondOrder;
    }

    const bond = createBond(openAtom.id, closeAtom.id, order);
    state.bonds.push(bond);
    state.ringOpenings.delete(ringNum);
  } else {
    // Open ring
    state.ringOpenings.set(ringNum, {
      atomIdx: state.currentAtomIdx,
      bondOrder: state.pendingBondOrder,
    });
  }
  state.pendingBondOrder = 1;
}

// ─── 2D Layout ──────────────────────────────────────────────

function layoutFragment(atoms: Atom[], bonds: Bond[], offset: number): void {
  if (atoms.length === 0) return;

  const bondLength = 1.5;
  const placed = new Set<string>();
  const adjacency = new Map<string, { neighborId: string; bond: Bond }[]>();

  // Build adjacency
  for (const atom of atoms) {
    adjacency.set(atom.id, []);
  }
  for (const bond of bonds) {
    adjacency.get(bond.source)?.push({ neighborId: bond.target, bond });
    adjacency.get(bond.target)?.push({ neighborId: bond.source, bond });
  }

  // Place first atom at origin (with fragment offset)
  atoms[0].position2d = { x: offset * 3, y: 0 };
  placed.add(atoms[0].id);

  // BFS to place remaining atoms
  const queue: string[] = [atoms[0].id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const current = atoms.find((a) => a.id === currentId)!;
    const neighbors = adjacency.get(currentId) ?? [];

    let unplacedCount = 0;
    const totalUnplaced = neighbors.filter(
      (n) => !placed.has(n.neighborId)
    ).length;

    for (const { neighborId } of neighbors) {
      if (placed.has(neighborId)) continue;

      const neighbor = atoms.find((a) => a.id === neighborId)!;
      const placedNeighbors = neighbors.filter((n) => placed.has(n.neighborId));

      let angle: number;
      if (placedNeighbors.length === 0) {
        angle = 0;
      } else if (placedNeighbors.length === 1) {
        const pn = atoms.find((a) => a.id === placedNeighbors[0].neighborId)!;
        const dx = current.position2d!.x - pn.position2d!.x;
        const dy = current.position2d!.y - pn.position2d!.y;
        const incomingAngle = Math.atan2(dy, dx);
        const spread = (2 * Math.PI) / 3;
        angle = incomingAngle + spread * (unplacedCount === 0 ? 0 : (unplacedCount % 2 === 0 ? 1 : -1) * Math.ceil(unplacedCount / 2) * spread / totalUnplaced);
      } else {
        // Multiple placed neighbors — fill gaps
        angle = Math.PI * (0.5 + unplacedCount);
      }

      neighbor.position2d = {
        x: current.position2d!.x + bondLength * Math.cos(angle),
        y: current.position2d!.y + bondLength * Math.sin(angle),
      };

      placed.add(neighborId);
      queue.push(neighborId);
      unplacedCount++;
    }
  }

  // Handle any unplaced atoms (disconnected within fragment shouldn't happen, but safety)
  for (const atom of atoms) {
    if (!atom.position2d) {
      atom.position2d = { x: offset * 3 + Math.random() * 2, y: Math.random() * 2 };
    }
  }
}
