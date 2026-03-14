/**
 * Core chemistry types for Valence Studio.
 * The molecular graph is the source of truth.
 */

// ─── Element Data ───────────────────────────────────────────

export interface ElementData {
  symbol: string;
  name: string;
  atomicNumber: number;
  mass: number;
  exactMass: number;
  defaultValences: number[];
  maxValence: number;
  electronegativity: number | null;
  color: string;
  category: ElementCategory;
}

export type ElementCategory =
  | "nonmetal"
  | "noble-gas"
  | "alkali-metal"
  | "alkaline-earth"
  | "metalloid"
  | "halogen"
  | "transition-metal"
  | "post-transition-metal"
  | "lanthanide"
  | "actinide";

// ─── Atom ───────────────────────────────────────────────────

export interface Atom {
  id: string;
  element: string;
  atomicNumber: number;
  /** 0 means natural abundance / not specified */
  isotope: number;
  formalCharge: number;
  /** Number of radical electrons (0, 1, or 2) */
  radicalElectrons: number;
  /** Explicit hydrogen count, null = use implicit */
  explicitHCount: number | null;
  /** Aromatic perception flag */
  aromatic: boolean;
  /** R/S or null for non-stereocenters */
  chiralTag: ChiralTag;
  /** 2D coordinates for depiction */
  position2d: Point2D | null;
  /** 3D coordinates for 3D view */
  position3d: Point3D | null;
  /** Index in the atom list (stable within a session) */
  index: number;
}

export type ChiralTag = "none" | "R" | "S" | "unspecified";

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// ─── Bond ───────────────────────────────────────────────────

export interface Bond {
  id: string;
  source: string; // atom id
  target: string; // atom id
  order: BondOrder;
  aromatic: boolean;
  stereo: BondStereo;
}

export type BondOrder = 1 | 1.5 | 2 | 3;

export type BondStereo = "none" | "up" | "down" | "either" | "E" | "Z" | "unspecified";

// ─── Molecule ───────────────────────────────────────────────

export interface Molecule {
  atoms: Atom[];
  bonds: Bond[];
  metadata: MoleculeMetadata;
}

export interface MoleculeMetadata {
  formula: string;
  exactMass: number;
  molecularWeight: number;
  totalFormalCharge: number;
  atomCount: number;
  heavyAtomCount: number;
  bondCount: number;
  ringCount: number;
  aromaticRingCount: number;
  stereocenterCount: number;
  ezBondCount: number;
  fragmentCount: number;
  smiles: string;
  isomericSmiles: string;
  inchi: string;
  inchiKey: string;
  sanitizationStatus: SanitizationStatus;
  warnings: ChemWarning[];
}

export type SanitizationStatus = "valid" | "warnings" | "invalid" | "unchecked";

export interface ChemWarning {
  type: WarningType;
  message: string;
  atomIds?: string[];
  bondIds?: string[];
  severity: "info" | "warning" | "error";
}

export type WarningType =
  | "valence-exceeded"
  | "unusual-valence"
  | "hypervalent"
  | "strained-geometry"
  | "unresolved-stereocenter"
  | "radical"
  | "charged-species"
  | "disconnected-fragments"
  | "unsupported-feature"
  | "aromaticity-issue"
  | "implicit-hydrogen-assumption";

// ─── Candidates & Ambiguity ─────────────────────────────────

export interface CandidateStructure {
  id: string;
  molecule: Molecule;
  label: string;
  description: string;
  plausibilityScore: number; // 0-1
  differences: CandidateDifference[];
  smiles: string;
}

export interface CandidateDifference {
  type: "attachment-site" | "bond-order" | "charge" | "stereochemistry" | "tautomer" | "aromatic";
  description: string;
}

export type ConfidenceLevel =
  | "uniquely-resolved"
  | "resolved-with-assumptions"
  | "multiple-valid-structures"
  | "unsupported-low-confidence";

export interface AmbiguityInfo {
  confidence: ConfidenceLevel;
  reason: string;
  candidates: CandidateStructure[];
  selectedCandidateId: string | null;
  symmetryNote: string | null;
}

// ─── Identity ───────────────────────────────────────────────

export interface MoleculeIdentity {
  commonName: string | null;
  systematicName: string | null;
  nameConfidence: "high" | "medium" | "low" | "none";
  formula: string;
  exactMass: number;
  molecularWeight: number;
  formalCharge: number;
  atomCount: number;
  bondCount: number;
  ringCount: number;
  aromaticRingCount: number;
  stereocenterCount: number;
  ezBondCount: number;
  canonicalSmiles: string;
  isomericSmiles: string;
  inchi: string;
  inchiKey: string;
  ambiguity: AmbiguityInfo;
  supportLevel: SupportLevel;
}

export type SupportLevel = "fully-supported" | "partially-supported" | "not-fully-supported";

// ─── Actions ────────────────────────────────────────────────

export interface EditAction {
  id: string;
  type: EditActionType;
  description: string;
  timestamp: number;
  moleculeBefore: Molecule;
  moleculeAfter: Molecule;
}

export type EditActionType =
  | "add-atom"
  | "remove-atom"
  | "add-bond"
  | "remove-bond"
  | "change-bond-order"
  | "set-charge"
  | "set-isotope"
  | "set-radical"
  | "set-stereo"
  | "toggle-hydrogens"
  | "ring-closure"
  | "clear-all"
  | "select-candidate"
  | "batch-edit";

// ─── Rendering ──────────────────────────────────────────────

export type RenderStyle = "ball-and-stick" | "stick" | "space-filling" | "wireframe";

export type ColorScheme = "element" | "charge" | "aromatic";

// ─── UI Mode ────────────────────────────────────────────────

export type UserMode = "beginner" | "expert";

export type InteractionTool =
  | "select"
  | "add-atom"
  | "add-bond"
  | "remove"
  | "charge"
  | "stereo"
  | "ring";
