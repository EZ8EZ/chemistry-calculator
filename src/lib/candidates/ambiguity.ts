/**
 * Ambiguity detection and candidate management.
 * Handles multiple valid structures, symmetry deduplication, and confidence scoring.
 */

import {
  Molecule, AmbiguityInfo, ConfidenceLevel, CandidateStructure,
  SupportLevel, MoleculeIdentity, BondOrder,
} from "../chem/types";
import {
  computeMetadata, generateSmiles, detectStereocenters,
  detectRings, perceiveAromaticity,
} from "../chem/graph";
import { findAttachmentSites } from "../chem/operations";

// ─── Ambiguity Analysis ─────────────────────────────────────

export function analyzeAmbiguity(
  mol: Molecule,
  candidates?: CandidateStructure[]
): AmbiguityInfo {
  const stereocenters = detectStereocenters(mol);
  const unresolvedStereo = mol.atoms.filter(
    (a) => stereocenters.includes(a.id) && (a.chiralTag === "none" || a.chiralTag === "unspecified")
  );

  // Determine confidence level
  let confidence: ConfidenceLevel = "uniquely-resolved";
  let reason = "Structure is uniquely determined";
  let symmetryNote: string | null = null;

  if (candidates && candidates.length > 1) {
    confidence = "multiple-valid-structures";
    reason = `${candidates.length} valid structure(s) exist for this edit`;
  } else if (unresolvedStereo.length > 0) {
    confidence = "resolved-with-assumptions";
    reason = `${unresolvedStereo.length} unresolved stereocenter(s)`;
  } else if (mol.metadata.warnings.some((w) => w.severity === "warning")) {
    confidence = "resolved-with-assumptions";
    reason = "Structure has chemistry warnings";
  }

  // Check for implicit hydrogen assumptions
  const hasImplicitHAssumptions = mol.atoms.some(
    (a) => a.explicitHCount === null && a.element !== "H"
  );
  if (hasImplicitHAssumptions && confidence === "uniquely-resolved") {
    confidence = "resolved-with-assumptions";
    reason = "Structure resolved with assumptions about implicit hydrogens";
  }

  if (mol.metadata.sanitizationStatus === "invalid") {
    confidence = "unsupported-low-confidence";
    reason = "Structure has validation errors";
  }

  return {
    confidence,
    reason,
    candidates: candidates ?? [],
    selectedCandidateId: candidates?.[0]?.id ?? null,
    symmetryNote,
  };
}

// ─── Attachment Ambiguity ───────────────────────────────────

export function detectAttachmentAmbiguity(
  mol: Molecule,
  element: string,
  bondOrder: BondOrder = 1
): AmbiguityInfo {
  if (mol.atoms.length === 0) {
    return {
      confidence: "uniquely-resolved",
      reason: "Adding first atom to empty canvas",
      candidates: [],
      selectedCandidateId: null,
      symmetryNote: null,
    };
  }

  const candidates = findAttachmentSites(mol, element, bondOrder);

  if (candidates.length === 0) {
    return {
      confidence: "unsupported-low-confidence",
      reason: "No valid attachment sites found",
      candidates: [],
      selectedCandidateId: null,
      symmetryNote: null,
    };
  }

  if (candidates.length === 1) {
    return {
      confidence: "uniquely-resolved",
      reason: "Only one valid attachment site",
      candidates,
      selectedCandidateId: candidates[0].id,
      symmetryNote: null,
    };
  }

  // Check for symmetry-equivalent sites
  const uniqueSmiles = new Set(candidates.map((c) => c.smiles));
  const symmetryNote =
    uniqueSmiles.size < candidates.length
      ? `${candidates.length - uniqueSmiles.size} symmetry-equivalent site(s) collapsed`
      : null;

  return {
    confidence: "multiple-valid-structures",
    reason: `${candidates.length} non-equivalent attachment sites found`,
    candidates,
    selectedCandidateId: candidates[0].id,
    symmetryNote,
  };
}

// ─── Bond Order Ambiguity ───────────────────────────────────

export function detectBondOrderAmbiguity(
  mol: Molecule,
  element: string,
  targetAtomId: string
): CandidateStructure[] {
  const candidates: CandidateStructure[] = [];
  const bondOrders: BondOrder[] = [1, 2, 3];

  for (const order of bondOrders) {
    const sites = findAttachmentSites(mol, element, order);
    const matching = sites.filter((s) =>
      s.description.includes(`position ${mol.atoms.find((a) => a.id === targetAtomId)?.index}`)
    );
    candidates.push(...matching);
  }

  // Deduplicate
  const seen = new Set<string>();
  return candidates.filter((c) => {
    if (seen.has(c.smiles)) return false;
    seen.add(c.smiles);
    return true;
  });
}

// ─── Identity Construction ──────────────────────────────────

export function buildIdentity(
  mol: Molecule,
  ambiguity: AmbiguityInfo
): MoleculeIdentity {
  const meta = mol.metadata;
  const stereocenters = detectStereocenters(mol);

  // Determine support level
  let supportLevel: SupportLevel = "fully-supported";

  // Check for features we don't fully support
  const hasTransitionMetals = mol.atoms.some((a) => {
    const elem = a.element;
    return ["Ti", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Pt", "Au"].includes(elem);
  });

  if (hasTransitionMetals) {
    supportLevel = "partially-supported";
  }

  if (mol.atoms.length > 100) {
    supportLevel = "not-fully-supported";
  }

  // Name matching - we're honest about not having a full database
  const commonName = lookupCommonName(meta.smiles);

  return {
    commonName: commonName?.name ?? null,
    systematicName: null, // Would need IUPAC naming algorithm
    nameConfidence: commonName?.confidence ?? "none",
    formula: meta.formula,
    exactMass: meta.exactMass,
    molecularWeight: meta.molecularWeight,
    formalCharge: meta.totalFormalCharge,
    atomCount: meta.atomCount,
    bondCount: meta.bondCount,
    ringCount: meta.ringCount,
    aromaticRingCount: meta.aromaticRingCount,
    stereocenterCount: stereocenters.length,
    ezBondCount: meta.ezBondCount,
    canonicalSmiles: meta.smiles,
    isomericSmiles: meta.isomericSmiles,
    inchi: meta.inchi,
    inchiKey: meta.inchiKey,
    ambiguity,
    supportLevel,
  };
}

// ─── Name Lookup (uses comprehensive database) ─────────────

import { lookupMoleculeName } from "../identifiers/names";

function lookupCommonName(smiles: string): { name: string; confidence: "high" | "medium" | "low" } | null {
  return lookupMoleculeName(smiles);
}

// ─── Confidence Badge ───────────────────────────────────────

export function getConfidenceBadge(confidence: ConfidenceLevel): {
  label: string;
  color: string;
  description: string;
} {
  switch (confidence) {
    case "uniquely-resolved":
      return {
        label: "Resolved",
        color: "green",
        description: "Structure is uniquely determined",
      };
    case "resolved-with-assumptions":
      return {
        label: "Assumptions",
        color: "yellow",
        description: "Structure resolved with assumptions",
      };
    case "multiple-valid-structures":
      return {
        label: "Ambiguous",
        color: "purple",
        description: "Multiple valid structures exist",
      };
    case "unsupported-low-confidence":
      return {
        label: "Low Confidence",
        color: "red",
        description: "Structure may not be fully supported",
      };
  }
}
