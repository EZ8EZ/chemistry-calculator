/**
 * Zustand store for Valence Studio.
 * Manages molecule state, UI state, undo/redo, and interaction mode.
 */

import { create } from "zustand";
import {
  Molecule, Atom, Bond, BondOrder, EditAction, EditActionType,
  UserMode, InteractionTool, RenderStyle, ColorScheme,
  AmbiguityInfo, MoleculeIdentity, CandidateStructure, ChemWarning,
} from "../chem/types";
import {
  createEmptyMolecule, computeMetadata, cloneMolecule,
} from "../chem/graph";
import {
  addAtom, removeAtom, addBond, removeBond, changeBondOrder,
  setFormalCharge, setIsotope, setRadical, setChirality,
  setBondStereo, toggleExplicitHydrogens, closeRing, clearMolecule,
  OperationResult,
} from "../chem/operations";
import {
  analyzeAmbiguity, buildIdentity, detectAttachmentAmbiguity,
} from "../../lib/candidates/ambiguity";

// ─── Store Types ────────────────────────────────────────────

interface ValenceState {
  // Molecule state
  molecule: Molecule;
  identity: MoleculeIdentity | null;
  ambiguity: AmbiguityInfo | null;

  // History
  undoStack: Molecule[];
  redoStack: Molecule[];
  actionLog: EditAction[];

  // UI state
  userMode: UserMode;
  activeTool: InteractionTool;
  selectedElement: string;
  selectedBondOrder: BondOrder;
  selectedAtomId: string | null;
  selectedBondId: string | null;
  hoveredAtomId: string | null;
  hoveredBondId: string | null;

  // Candidate state
  candidates: CandidateStructure[];
  showCandidatePanel: boolean;

  // Rendering
  renderStyle: RenderStyle;
  colorScheme: ColorScheme;
  showImplicitHydrogens: boolean;
  showAtomLabels: boolean;
  showBondOrders: boolean;
  darkMode: boolean;

  // Panels
  showRightPanel: boolean;
  showBottomDrawer: boolean;
  showExpertDiagnostics: boolean;

  // Messages
  lastMessage: string;
  lastWarnings: ChemWarning[];

  // Actions
  addAtomToMolecule: (element: string, targetAtomId: string | null, bondOrder?: BondOrder) => void;
  removeAtomFromMolecule: (atomId: string) => void;
  addBondToMolecule: (atomId1: string, atomId2: string, order?: BondOrder) => void;
  removeBondFromMolecule: (bondId: string) => void;
  changeBondOrderInMolecule: (bondId: string, newOrder: BondOrder) => void;
  cycleBondOrder: (bondId: string) => void;
  setAtomCharge: (atomId: string, charge: number) => void;
  setAtomIsotope: (atomId: string, isotope: number) => void;
  setAtomRadical: (atomId: string, electrons: number) => void;
  setAtomChirality: (atomId: string, tag: "none" | "R" | "S" | "unspecified") => void;
  setBondStereoInMolecule: (bondId: string, stereo: "none" | "E" | "Z" | "up" | "down") => void;
  toggleHydrogens: (atomId: string) => void;
  closeRingInMolecule: (atomId1: string, atomId2: string, order?: BondOrder) => void;
  clearAll: () => void;
  selectCandidate: (candidateId: string) => void;

  // History actions
  undo: () => void;
  redo: () => void;

  // UI actions
  setUserMode: (mode: UserMode) => void;
  setActiveTool: (tool: InteractionTool) => void;
  setSelectedElement: (element: string) => void;
  setSelectedBondOrder: (order: BondOrder) => void;
  selectAtom: (atomId: string | null) => void;
  selectBond: (bondId: string | null) => void;
  hoverAtom: (atomId: string | null) => void;
  hoverBond: (bondId: string | null) => void;
  setRenderStyle: (style: RenderStyle) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleImplicitHydrogens: () => void;
  toggleAtomLabels: () => void;
  toggleDarkMode: () => void;
  toggleRightPanel: () => void;
  toggleBottomDrawer: () => void;
  toggleExpertDiagnostics: () => void;
}

// ─── Store Implementation ───────────────────────────────────

export const useValenceStore = create<ValenceState>((set, get) => {
  // Helper: apply operation and update state
  function applyOperation(
    result: OperationResult,
    actionType: EditActionType
  ) {
    if (!result.success) {
      set({
        lastMessage: result.message,
        lastWarnings: result.warnings,
      });
      return;
    }

    const state = get();
    const before = cloneMolecule(state.molecule);
    const newMol = result.molecule;
    const ambiguity = analyzeAmbiguity(newMol, result.candidates);
    const identity = buildIdentity(newMol, ambiguity);

    const action: EditAction = {
      id: `action_${Date.now()}`,
      type: actionType,
      description: result.message,
      timestamp: Date.now(),
      moleculeBefore: before,
      moleculeAfter: cloneMolecule(newMol),
    };

    set({
      molecule: newMol,
      identity,
      ambiguity,
      undoStack: [...state.undoStack, before],
      redoStack: [],
      actionLog: [...state.actionLog, action],
      lastMessage: result.message,
      lastWarnings: result.warnings,
      candidates: result.candidates ?? [],
      showCandidatePanel: (result.candidates?.length ?? 0) > 1,
    });
  }

  return {
    // Initial state
    molecule: createEmptyMolecule(),
    identity: null,
    ambiguity: null,
    undoStack: [],
    redoStack: [],
    actionLog: [],
    userMode: "beginner",
    activeTool: "add-atom",
    selectedElement: "C",
    selectedBondOrder: 1,
    selectedAtomId: null,
    selectedBondId: null,
    hoveredAtomId: null,
    hoveredBondId: null,
    candidates: [],
    showCandidatePanel: false,
    renderStyle: "ball-and-stick",
    colorScheme: "element",
    showImplicitHydrogens: true,
    showAtomLabels: true,
    showBondOrders: true,
    darkMode: true,
    showRightPanel: true,
    showBottomDrawer: false,
    showExpertDiagnostics: false,
    lastMessage: "Ready. Add an element to begin.",
    lastWarnings: [],

    // ─── Molecule Operations ──────────────────────────────

    addAtomToMolecule: (element, targetAtomId, bondOrder = 1) => {
      const state = get();
      const result = addAtom(state.molecule, element, targetAtomId, bondOrder);
      applyOperation(result, "add-atom");
    },

    removeAtomFromMolecule: (atomId) => {
      const state = get();
      const result = removeAtom(state.molecule, atomId);
      applyOperation(result, "remove-atom");
      if (result.success) {
        set({ selectedAtomId: null });
      }
    },

    addBondToMolecule: (atomId1, atomId2, order = 1) => {
      const state = get();
      const result = addBond(state.molecule, atomId1, atomId2, order);
      applyOperation(result, "add-bond");
    },

    removeBondFromMolecule: (bondId) => {
      const state = get();
      const result = removeBond(state.molecule, bondId);
      applyOperation(result, "remove-bond");
      if (result.success) {
        set({ selectedBondId: null });
      }
    },

    changeBondOrderInMolecule: (bondId, newOrder) => {
      const state = get();
      const result = changeBondOrder(state.molecule, bondId, newOrder);
      applyOperation(result, "change-bond-order");
    },

    cycleBondOrder: (bondId) => {
      const state = get();
      const bond = state.molecule.bonds.find((b) => b.id === bondId);
      if (!bond) return;

      const orders: BondOrder[] = [1, 2, 3];
      const currentIdx = orders.indexOf(bond.order as BondOrder);
      const nextOrder = orders[(currentIdx + 1) % orders.length];
      const result = changeBondOrder(state.molecule, bondId, nextOrder);
      applyOperation(result, "change-bond-order");
    },

    setAtomCharge: (atomId, charge) => {
      const state = get();
      const result = setFormalCharge(state.molecule, atomId, charge);
      applyOperation(result, "set-charge");
    },

    setAtomIsotope: (atomId, isotope) => {
      const state = get();
      const result = setIsotope(state.molecule, atomId, isotope);
      applyOperation(result, "set-isotope");
    },

    setAtomRadical: (atomId, electrons) => {
      const state = get();
      const result = setRadical(state.molecule, atomId, electrons);
      applyOperation(result, "set-radical");
    },

    setAtomChirality: (atomId, tag) => {
      const state = get();
      const result = setChirality(state.molecule, atomId, tag);
      applyOperation(result, "set-stereo");
    },

    setBondStereoInMolecule: (bondId, stereo) => {
      const state = get();
      const result = setBondStereo(state.molecule, bondId, stereo);
      applyOperation(result, "set-stereo");
    },

    toggleHydrogens: (atomId) => {
      const state = get();
      const result = toggleExplicitHydrogens(state.molecule, atomId);
      applyOperation(result, "toggle-hydrogens");
    },

    closeRingInMolecule: (atomId1, atomId2, order = 1) => {
      const state = get();
      const result = closeRing(state.molecule, atomId1, atomId2, order);
      applyOperation(result, "ring-closure");
    },

    clearAll: () => {
      const state = get();
      const before = cloneMolecule(state.molecule);
      const result = clearMolecule();

      set({
        molecule: result.molecule,
        identity: null,
        ambiguity: null,
        undoStack: [...state.undoStack, before],
        redoStack: [],
        actionLog: [...state.actionLog, {
          id: `action_${Date.now()}`,
          type: "clear-all" as EditActionType,
          description: "Cleared all",
          timestamp: Date.now(),
          moleculeBefore: before,
          moleculeAfter: cloneMolecule(result.molecule),
        }],
        selectedAtomId: null,
        selectedBondId: null,
        candidates: [],
        showCandidatePanel: false,
        lastMessage: "Canvas cleared",
        lastWarnings: [],
      });
    },

    selectCandidate: (candidateId) => {
      const state = get();
      const candidate = state.candidates.find((c) => c.id === candidateId);
      if (!candidate) return;

      const before = cloneMolecule(state.molecule);
      const newMol = cloneMolecule(candidate.molecule);
      const ambiguity = analyzeAmbiguity(newMol);
      const identity = buildIdentity(newMol, ambiguity);

      set({
        molecule: newMol,
        identity,
        ambiguity: { ...state.ambiguity!, selectedCandidateId: candidateId },
        undoStack: [...state.undoStack, before],
        redoStack: [],
        lastMessage: `Selected: ${candidate.label}`,
        showCandidatePanel: false,
      });
    },

    // ─── History ──────────────────────────────────────────

    undo: () => {
      const state = get();
      if (state.undoStack.length === 0) return;

      const previous = state.undoStack[state.undoStack.length - 1];
      const newUndo = state.undoStack.slice(0, -1);
      const ambiguity = analyzeAmbiguity(previous);
      const identity = buildIdentity(previous, ambiguity);

      set({
        molecule: previous,
        identity,
        ambiguity,
        undoStack: newUndo,
        redoStack: [...state.redoStack, cloneMolecule(state.molecule)],
        lastMessage: "Undone",
        selectedAtomId: null,
        selectedBondId: null,
      });
    },

    redo: () => {
      const state = get();
      if (state.redoStack.length === 0) return;

      const next = state.redoStack[state.redoStack.length - 1];
      const newRedo = state.redoStack.slice(0, -1);
      const ambiguity = analyzeAmbiguity(next);
      const identity = buildIdentity(next, ambiguity);

      set({
        molecule: next,
        identity,
        ambiguity,
        undoStack: [...state.undoStack, cloneMolecule(state.molecule)],
        redoStack: newRedo,
        lastMessage: "Redone",
      });
    },

    // ─── UI Actions ───────────────────────────────────────

    setUserMode: (mode) => set({ userMode: mode }),
    setActiveTool: (tool) => set({ activeTool: tool, selectedAtomId: null, selectedBondId: null }),
    setSelectedElement: (element) => set({ selectedElement: element }),
    setSelectedBondOrder: (order) => set({ selectedBondOrder: order }),
    selectAtom: (atomId) => set({ selectedAtomId: atomId, selectedBondId: null }),
    selectBond: (bondId) => set({ selectedBondId: bondId, selectedAtomId: null }),
    hoverAtom: (atomId) => set({ hoveredAtomId: atomId }),
    hoverBond: (bondId) => set({ hoveredBondId: bondId }),
    setRenderStyle: (style) => set({ renderStyle: style }),
    setColorScheme: (scheme) => set({ colorScheme: scheme }),
    toggleImplicitHydrogens: () => set((s) => ({ showImplicitHydrogens: !s.showImplicitHydrogens })),
    toggleAtomLabels: () => set((s) => ({ showAtomLabels: !s.showAtomLabels })),
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    toggleRightPanel: () => set((s) => ({ showRightPanel: !s.showRightPanel })),
    toggleBottomDrawer: () => set((s) => ({ showBottomDrawer: !s.showBottomDrawer })),
    toggleExpertDiagnostics: () => set((s) => ({ showExpertDiagnostics: !s.showExpertDiagnostics })),
  };
});
