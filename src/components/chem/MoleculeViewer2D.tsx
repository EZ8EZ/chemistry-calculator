"use client";

import React, { useMemo, useCallback } from "react";
import { useValenceStore } from "@/lib/ui/store";
import { Molecule, Atom, Bond } from "@/lib/chem/types";
import { getImplicitHydrogens, getBondsForAtom, getAtomById } from "@/lib/chem/graph";
import { ELEMENTS } from "@/lib/chem/elements";
import { cn } from "@/components/ui/button";

interface MoleculeViewer2DProps {
  className?: string;
  interactive?: boolean;
  molecule?: Molecule;
  compact?: boolean;
}

const BOND_LENGTH = 50;
const ATOM_RADIUS = 16;
const PADDING = 40;

export function MoleculeViewer2D({
  className,
  interactive = true,
  molecule: externalMol,
  compact = false,
}: MoleculeViewer2DProps) {
  const store = useValenceStore();
  const mol = externalMol ?? store.molecule;
  const {
    selectedAtomId,
    hoveredAtomId,
    selectedBondId,
    hoveredBondId,
    activeTool,
    selectedElement,
    selectedBondOrder,
    darkMode,
  } = store;

  // Calculate viewport bounds
  const bounds = useMemo(() => {
    if (mol.atoms.length === 0) return { minX: 0, minY: 0, maxX: 200, maxY: 200, width: 200, height: 200 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const atom of mol.atoms) {
      const x = (atom.position2d?.x ?? 0) * BOND_LENGTH;
      const y = (atom.position2d?.y ?? 0) * BOND_LENGTH;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    const width = Math.max(maxX - minX + PADDING * 2, 100);
    const height = Math.max(maxY - minY + PADDING * 2, 100);

    return { minX: minX - PADDING, minY: minY - PADDING, maxX, maxY, width, height };
  }, [mol.atoms]);

  const handleAtomClick = useCallback(
    (atomId: string) => {
      if (!interactive) return;

      switch (activeTool) {
        case "select":
          store.selectAtom(atomId);
          break;
        case "add-atom":
          store.addAtomToMolecule(selectedElement, atomId, selectedBondOrder);
          break;
        case "remove":
          store.removeAtomFromMolecule(atomId);
          break;
        case "charge": {
          const atom = getAtomById(mol, atomId);
          if (atom) {
            const newCharge = atom.formalCharge >= 2 ? -2 : atom.formalCharge + 1;
            store.setAtomCharge(atomId, newCharge);
          }
          break;
        }
      }
    },
    [interactive, activeTool, selectedElement, selectedBondOrder, mol, store]
  );

  const handleBondClick = useCallback(
    (bondId: string) => {
      if (!interactive) return;

      switch (activeTool) {
        case "select":
          store.selectBond(bondId);
          break;
        case "remove":
          store.removeBondFromMolecule(bondId);
          break;
        default:
          store.cycleBondOrder(bondId);
          break;
      }
    },
    [interactive, activeTool, store]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactive) return;
      if (activeTool !== "add-atom") return;
      if (mol.atoms.length > 0) return;

      // Add first atom
      store.addAtomToMolecule(selectedElement, null, selectedBondOrder);
    },
    [interactive, activeTool, mol.atoms.length, selectedElement, selectedBondOrder, store]
  );

  const svgSize = compact ? 120 : undefined;

  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
      onClick={handleCanvasClick}
      style={{
        cursor: interactive && activeTool === "add-atom" ? "crosshair" : "default",
        minHeight: compact ? 80 : 200,
        maxHeight: compact ? 120 : undefined,
      }}
      width={svgSize}
      height={svgSize}
    >
      {/* Bonds */}
      {mol.bonds.map((bond) => (
        <BondElement
          key={bond.id}
          bond={bond}
          mol={mol}
          selected={selectedBondId === bond.id}
          hovered={hoveredBondId === bond.id}
          onClick={() => handleBondClick(bond.id)}
          onHover={(h) => interactive && store.hoverBond(h ? bond.id : null)}
          compact={compact}
        />
      ))}

      {/* Atoms */}
      {mol.atoms.map((atom) => (
        <AtomElement
          key={atom.id}
          atom={atom}
          mol={mol}
          selected={selectedAtomId === atom.id}
          hovered={hoveredAtomId === atom.id}
          onClick={() => handleAtomClick(atom.id)}
          onHover={(h) => interactive && store.hoverAtom(h ? atom.id : null)}
          compact={compact}
        />
      ))}
    </svg>
  );
}

function AtomElement({
  atom,
  mol,
  selected,
  hovered,
  onClick,
  onHover,
  compact,
}: {
  atom: Atom;
  mol: Molecule;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onHover: (h: boolean) => void;
  compact: boolean;
}) {
  const x = (atom.position2d?.x ?? 0) * BOND_LENGTH;
  const y = (atom.position2d?.y ?? 0) * BOND_LENGTH;
  const elem = ELEMENTS[atom.element];
  const color = elem?.color ?? "#888";
  const implicitH = getImplicitHydrogens(mol, atom.id);
  const r = compact ? 10 : ATOM_RADIUS;
  const fontSize = compact ? 8 : 12;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Selection/hover ring */}
      {(selected || hovered) && (
        <circle
          cx={x}
          cy={y}
          r={r + 4}
          fill="none"
          stroke={selected ? "hsl(217, 91%, 60%)" : "hsl(217, 91%, 60%)"}
          strokeWidth={selected ? 2 : 1}
          opacity={selected ? 0.8 : 0.4}
        />
      )}

      {/* Atom circle */}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={atom.element === "C" ? "transparent" : `${color}22`}
        stroke={color}
        strokeWidth={1}
        opacity={0.9}
      />

      {/* Element label */}
      <text
        x={x}
        y={y + fontSize * 0.35}
        textAnchor="middle"
        fill={color}
        fontSize={fontSize}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={600}
      >
        {atom.element}
      </text>

      {/* Implicit H label */}
      {implicitH > 0 && !compact && (
        <text
          x={x + r}
          y={y + fontSize * 0.35}
          textAnchor="start"
          fill="hsl(215, 16%, 57%)"
          fontSize={fontSize * 0.7}
          fontFamily="Inter, system-ui, sans-serif"
        >
          H{implicitH > 1 ? implicitH : ""}
        </text>
      )}

      {/* Charge label */}
      {atom.formalCharge !== 0 && (
        <text
          x={x + r * 0.7}
          y={y - r * 0.5}
          textAnchor="start"
          fill={atom.formalCharge > 0 ? "#3b82f6" : "#ef4444"}
          fontSize={compact ? 7 : 9}
          fontWeight={700}
        >
          {atom.formalCharge > 0 ? "+" : ""}
          {atom.formalCharge !== 1 && atom.formalCharge !== -1 ? atom.formalCharge : atom.formalCharge > 0 ? "" : "−"}
        </text>
      )}

      {/* Isotope label */}
      {atom.isotope > 0 && !compact && (
        <text
          x={x - r * 0.8}
          y={y - r * 0.5}
          textAnchor="end"
          fill="hsl(215, 16%, 57%)"
          fontSize={8}
        >
          {atom.isotope}
        </text>
      )}

      {/* Stereocenter indicator */}
      {atom.chiralTag !== "none" && atom.chiralTag !== "unspecified" && !compact && (
        <text
          x={x}
          y={y + r + 10}
          textAnchor="middle"
          fill="#a78bfa"
          fontSize={8}
          fontWeight={600}
        >
          ({atom.chiralTag})
        </text>
      )}

      {/* Radical dot */}
      {atom.radicalElectrons > 0 && (
        <>
          <circle cx={x} cy={y - r - 4} r={2} fill={color} />
          {atom.radicalElectrons === 2 && (
            <circle cx={x + 6} cy={y - r - 4} r={2} fill={color} />
          )}
        </>
      )}

      {/* Atom index (expert mode) */}
      {!compact && (
        <text
          x={x}
          y={y + r + (atom.chiralTag !== "none" ? 20 : 10)}
          textAnchor="middle"
          fill="hsl(215, 16%, 37%)"
          fontSize={7}
        >
          {atom.index}
        </text>
      )}
    </g>
  );
}

function BondElement({
  bond,
  mol,
  selected,
  hovered,
  onClick,
  onHover,
  compact,
}: {
  bond: Bond;
  mol: Molecule;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onHover: (h: boolean) => void;
  compact: boolean;
}) {
  const source = getAtomById(mol, bond.source);
  const target = getAtomById(mol, bond.target);
  if (!source || !target) return null;

  const x1 = (source.position2d?.x ?? 0) * BOND_LENGTH;
  const y1 = (source.position2d?.y ?? 0) * BOND_LENGTH;
  const x2 = (target.position2d?.x ?? 0) * BOND_LENGTH;
  const y2 = (target.position2d?.y ?? 0) * BOND_LENGTH;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  // Shorten bond to not overlap atoms
  const r = compact ? 10 : ATOM_RADIUS;
  const ratio = r / len;
  const sx = x1 + dx * ratio;
  const sy = y1 + dy * ratio;
  const ex = x2 - dx * ratio;
  const ey = y2 - dy * ratio;

  // Perpendicular offset for multiple bonds
  const px = -dy / len;
  const py = dx / len;
  const offset = compact ? 2.5 : 4;

  const strokeColor = selected
    ? "hsl(217, 91%, 60%)"
    : hovered
    ? "hsl(217, 91%, 70%)"
    : "hsl(215, 16%, 47%)";

  const strokeWidth = compact ? 1.5 : 2;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Click target (wider invisible line) */}
      <line
        x1={sx}
        y1={sy}
        x2={ex}
        y2={ey}
        stroke="transparent"
        strokeWidth={12}
      />

      {bond.order === 1 && (
        <line
          x1={sx}
          y1={sy}
          x2={ex}
          y2={ey}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}

      {bond.order === 2 && (
        <>
          <line
            x1={sx + px * offset}
            y1={sy + py * offset}
            x2={ex + px * offset}
            y2={ey + py * offset}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={sx - px * offset}
            y1={sy - py * offset}
            x2={ex - px * offset}
            y2={ey - py * offset}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}

      {bond.order === 3 && (
        <>
          <line
            x1={sx}
            y1={sy}
            x2={ex}
            y2={ey}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={sx + px * offset * 1.5}
            y1={sy + py * offset * 1.5}
            x2={ex + px * offset * 1.5}
            y2={ey + py * offset * 1.5}
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.8}
            strokeLinecap="round"
          />
          <line
            x1={sx - px * offset * 1.5}
            y1={sy - py * offset * 1.5}
            x2={ex - px * offset * 1.5}
            y2={ey - py * offset * 1.5}
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.8}
            strokeLinecap="round"
          />
        </>
      )}

      {/* Bond order indicator on hover */}
      {hovered && !compact && (
        <text
          x={(sx + ex) / 2 + px * 12}
          y={(sy + ey) / 2 + py * 12}
          textAnchor="middle"
          fill="hsl(217, 91%, 60%)"
          fontSize={9}
          fontWeight={600}
        >
          {bond.order === 1 ? "single" : bond.order === 2 ? "double" : bond.order === 3 ? "triple" : "aromatic"}
        </text>
      )}

      {/* Stereo indicator */}
      {bond.stereo !== "none" && !compact && (
        <text
          x={(sx + ex) / 2}
          y={(sy + ey) / 2 - 8}
          textAnchor="middle"
          fill="#a78bfa"
          fontSize={8}
          fontWeight={600}
        >
          {bond.stereo}
        </text>
      )}
    </g>
  );
}
