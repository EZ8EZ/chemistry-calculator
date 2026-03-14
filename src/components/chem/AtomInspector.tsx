"use client";

import React from "react";
import { useValenceStore } from "@/lib/ui/store";
import { getAtomById, getBondsForAtom, getBondOrderSum, getImplicitHydrogens, getNeighbors, detectStereocenters } from "@/lib/chem/graph";
import { ELEMENTS } from "@/lib/chem/elements";
import { Button, cn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

export function AtomInspector() {
  const {
    molecule,
    selectedAtomId,
    selectedBondId,
    userMode,
    setAtomCharge,
    setAtomIsotope,
    setAtomRadical,
    setAtomChirality,
    toggleHydrogens,
    removeAtomFromMolecule,
    removeBondFromMolecule,
    changeBondOrderInMolecule,
    setBondStereoInMolecule,
  } = useValenceStore();

  // Atom inspector
  if (selectedAtomId) {
    const atom = getAtomById(molecule, selectedAtomId);
    if (!atom) return null;

    const elem = ELEMENTS[atom.element];
    const bonds = getBondsForAtom(molecule, selectedAtomId);
    const bondSum = getBondOrderSum(molecule, selectedAtomId);
    const implicitH = getImplicitHydrogens(molecule, selectedAtomId);
    const neighbors = getNeighbors(molecule, selectedAtomId);
    const stereocenters = detectStereocenters(molecule);
    const isStereo = stereocenters.includes(selectedAtomId);

    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2"
            style={{ borderColor: elem?.color, color: elem?.color }}
          >
            {atom.element}
          </div>
          <div>
            <p className="text-sm font-medium">
              {elem?.name ?? atom.element}
              <span className="text-muted-foreground ml-1">#{atom.index}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Z={atom.atomicNumber} | Bonds: {bonds.length} | Bond order sum: {bondSum}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-muted/50 px-2 py-1">
            <span className="text-muted-foreground">Implicit H: </span>
            <span className="font-mono">{implicitH}</span>
          </div>
          <div className="rounded bg-muted/50 px-2 py-1">
            <span className="text-muted-foreground">Charge: </span>
            <span className="font-mono">
              {atom.formalCharge > 0 ? "+" : ""}{atom.formalCharge}
            </span>
          </div>
          {atom.isotope > 0 && (
            <div className="rounded bg-muted/50 px-2 py-1">
              <span className="text-muted-foreground">Isotope: </span>
              <span className="font-mono">{atom.isotope}</span>
            </div>
          )}
          {isStereo && (
            <div className="rounded bg-purple-500/10 px-2 py-1">
              <span className="text-purple-400">Stereocenter </span>
              <span className="font-mono text-purple-400">
                {atom.chiralTag !== "none" ? atom.chiralTag : "?"}
              </span>
            </div>
          )}
        </div>

        {/* Charge controls */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Formal Charge
          </p>
          <div className="flex gap-1">
            {[-2, -1, 0, 1, 2].map((charge) => (
              <button
                key={charge}
                className={cn(
                  "h-7 w-7 rounded text-xs flex items-center justify-center transition-all",
                  atom.formalCharge === charge
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-accent"
                )}
                onClick={() => setAtomCharge(selectedAtomId, charge)}
              >
                {charge > 0 ? `+${charge}` : charge}
              </button>
            ))}
          </div>
        </div>

        {/* Stereochemistry (if stereocenter) */}
        {isStereo && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Chirality
            </p>
            <div className="flex gap-1">
              {(["none", "R", "S", "unspecified"] as const).map((tag) => (
                <button
                  key={tag}
                  className={cn(
                    "h-7 px-2 rounded text-xs transition-all",
                    atom.chiralTag === tag
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "border border-border hover:bg-accent"
                  )}
                  onClick={() => setAtomChirality(selectedAtomId, tag)}
                >
                  {tag === "none" ? "None" : tag === "unspecified" ? "?" : tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expert controls */}
        {userMode === "expert" && (
          <>
            {/* Isotope */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Isotope
              </p>
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  value={atom.isotope || ""}
                  placeholder="Natural"
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setAtomIsotope(selectedAtomId, val);
                  }}
                  className="w-20 h-7 px-2 text-xs rounded border border-input bg-background"
                />
                {atom.isotope > 0 && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setAtomIsotope(selectedAtomId, 0)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Radical */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Radical
              </p>
              <div className="flex gap-1">
                {[0, 1, 2].map((r) => (
                  <button
                    key={r}
                    className={cn(
                      "h-7 px-2 rounded text-xs transition-all",
                      atom.radicalElectrons === r
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-accent"
                    )}
                    onClick={() => setAtomRadical(selectedAtomId, r)}
                  >
                    {r === 0 ? "None" : `${r}e⁻`}
                  </button>
                ))}
              </div>
            </div>

            {/* Explicit H toggle */}
            <button
              className="w-full h-8 rounded text-xs border border-border hover:bg-accent transition-colors"
              onClick={() => toggleHydrogens(selectedAtomId)}
            >
              {atom.explicitHCount !== null
                ? `Explicit H: ${atom.explicitHCount} (click to use implicit)`
                : `Implicit H: ${implicitH} (click to make explicit)`}
            </button>
          </>
        )}

        {/* Neighbors */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Neighbors
          </p>
          <div className="flex flex-wrap gap-1">
            {neighbors.map((n) => (
              <span
                key={n.id}
                className="text-xs px-1.5 py-0.5 rounded bg-muted"
                style={{ color: ELEMENTS[n.element]?.color }}
              >
                {n.element}{n.index}
              </span>
            ))}
            {neighbors.length === 0 && (
              <span className="text-xs text-muted-foreground">No neighbors</span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => removeAtomFromMolecule(selectedAtomId)}
        >
          Remove {atom.element}{atom.index}
        </Button>
      </div>
    );
  }

  // Bond inspector
  if (selectedBondId) {
    const bond = molecule.bonds.find((b) => b.id === selectedBondId);
    if (!bond) return null;

    const source = getAtomById(molecule, bond.source);
    const target = getAtomById(molecule, bond.target);
    if (!source || !target) return null;

    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {source.element}{source.index}
            <span className="text-muted-foreground mx-1">—</span>
            {target.element}{target.index}
          </span>
          <Badge variant="secondary">
            {bond.order === 1 ? "Single" : bond.order === 2 ? "Double" : bond.order === 3 ? "Triple" : "Aromatic"}
          </Badge>
        </div>

        {/* Bond order controls */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Bond Order
          </p>
          <div className="flex gap-1">
            {([1, 2, 3] as const).map((order) => (
              <button
                key={order}
                className={cn(
                  "h-8 flex-1 rounded text-xs transition-all",
                  bond.order === order
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-accent"
                )}
                onClick={() => changeBondOrderInMolecule(selectedBondId, order)}
              >
                {order === 1 ? "Single" : order === 2 ? "Double" : "Triple"}
              </button>
            ))}
          </div>
        </div>

        {/* Stereo for double bonds */}
        {bond.order === 2 && userMode === "expert" && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Stereochemistry
            </p>
            <div className="flex gap-1">
              {(["none", "E", "Z"] as const).map((stereo) => (
                <button
                  key={stereo}
                  className={cn(
                    "h-7 px-3 rounded text-xs transition-all",
                    bond.stereo === stereo
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "border border-border hover:bg-accent"
                  )}
                  onClick={() => setBondStereoInMolecule(selectedBondId, stereo)}
                >
                  {stereo === "none" ? "None" : stereo}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wedge/dash for single bonds */}
        {bond.order === 1 && userMode === "expert" && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Stereo Display
            </p>
            <div className="flex gap-1">
              {(["none", "up", "down"] as const).map((stereo) => (
                <button
                  key={stereo}
                  className={cn(
                    "h-7 px-2 rounded text-xs transition-all",
                    bond.stereo === stereo
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "border border-border hover:bg-accent"
                  )}
                  onClick={() => setBondStereoInMolecule(selectedBondId, stereo)}
                >
                  {stereo === "none" ? "Plain" : stereo === "up" ? "Wedge" : "Dash"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Delete button */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => removeBondFromMolecule(selectedBondId)}
        >
          Remove Bond
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-4 text-xs text-muted-foreground">
      <p>Click an atom or bond to inspect</p>
    </div>
  );
}
