"use client";

import React from "react";
import { useValenceStore } from "@/lib/ui/store";
import { getBeginnerTemplates, TEMPLATE_COLLECTIONS } from "@/lib/chem/templates";
import { cn } from "@/components/ui/button";

/**
 * Smart suggestions for beginners.
 * Shows contextual guidance based on the current state:
 * - Empty canvas: suggest starting templates
 * - After adding atoms: suggest common next steps
 * - After errors: suggest fixes
 */
export function SmartSuggestions() {
  const {
    molecule,
    lastMessage,
    lastWarnings,
    userMode,
    loadFromSMILES,
    toggleLibrary,
    selectedAtomId,
    activeTool,
  } = useValenceStore();

  // Only show in beginner mode
  if (userMode === "expert") return null;

  // Empty canvas — show getting started
  if (molecule.atoms.length === 0) {
    return <EmptyCanvasGuide onLoad={loadFromSMILES} onLibrary={toggleLibrary} />;
  }

  // Show contextual tips based on state
  const hasWarnings = lastWarnings.some((w) => w.severity === "error");

  if (hasWarnings) {
    return (
      <div className="px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg mx-2 mb-2">
        <p className="text-xs text-red-400 font-medium mb-1">Chemistry issue detected</p>
        <p className="text-[11px] text-muted-foreground">{lastMessage}</p>
        <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
          Tip: Use undo (Ctrl+Z) to go back, or try a different bond order or element.
        </p>
      </div>
    );
  }

  // Small molecule tips
  if (molecule.atoms.length <= 3 && molecule.atoms.length > 0) {
    return (
      <div className="px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg mx-2 mb-2">
        <p className="text-[11px] text-muted-foreground">
          {activeTool === "add-atom" ? (
            <>Click an existing atom to bond a new <strong>{useValenceStore.getState().selectedElement}</strong> to it, or click empty space to add a free atom.</>
          ) : activeTool === "select" ? (
            <>Click an atom or bond to inspect and modify its properties.</>
          ) : activeTool === "remove" ? (
            <>Click an atom or bond to remove it.</>
          ) : (
            <>Use the tools on the left to build your molecule.</>
          )}
        </p>
      </div>
    );
  }

  return null;
}

function EmptyCanvasGuide({
  onLoad,
  onLibrary,
}: {
  onLoad: (smiles: string, name: string) => void;
  onLibrary: () => void;
}) {
  const quickMolecules = [
    { name: "Methane", smiles: "C", desc: "Simplest molecule" },
    { name: "Ethanol", smiles: "CCO", desc: "Common alcohol" },
    { name: "Benzene", smiles: "c1ccccc1", desc: "Aromatic ring" },
    { name: "Acetic Acid", smiles: "CC(=O)O", desc: "Vinegar" },
    { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O", desc: "Pain reliever" },
    { name: "Caffeine", smiles: "Cn1c(=O)c2c(ncn2C)n(C)c1=O", desc: "Stimulant" },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-5 max-w-md pointer-events-auto">
        <div>
          <div className="text-3xl opacity-20 mb-2">⬡</div>
          <h2 className="text-base font-semibold text-foreground/80">
            Start building a molecule
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pick a molecule below, browse the library, or click an element on the left to start from scratch.
          </p>
        </div>

        {/* Quick picks */}
        <div className="grid grid-cols-3 gap-2">
          {quickMolecules.map((m) => (
            <button
              key={m.smiles}
              className="text-left p-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/50 transition-all group"
              onClick={() => onLoad(m.smiles, m.name)}
            >
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                {m.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {m.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Open library */}
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/30 transition-all text-sm"
          onClick={onLibrary}
        >
          <span>Browse full library</span>
          <span className="text-muted-foreground">→</span>
        </button>

        <p className="text-[10px] text-muted-foreground/50">
          Or press C, N, O, F, P to select an element and click the canvas
        </p>
      </div>
    </div>
  );
}
