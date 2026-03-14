"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useValenceStore } from "@/lib/ui/store";
import { Molecule, RenderStyle } from "@/lib/chem/types";
import { generateMolFile, getImplicitHydrogens, getAtomById } from "@/lib/chem/graph";
import { ELEMENTS } from "@/lib/chem/elements";
import { cn } from "@/components/ui/button";

interface MoleculeViewer3DProps {
  className?: string;
}

export function MoleculeViewer3D({ className }: MoleculeViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const {
    molecule,
    renderStyle,
    selectedAtomId,
    hoveredAtomId,
    darkMode,
    showAtomLabels,
    activeTool,
    selectedElement,
    selectedBondOrder,
    addAtomToMolecule,
    selectAtom,
    removeAtomFromMolecule,
    cycleBondOrder,
    hoverAtom,
  } = useValenceStore();

  // Initialize 3Dmol viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const init = async () => {
      try {
        const $3Dmol = await import("3dmol");
        if (!containerRef.current) return;

        // Clear any existing viewer
        containerRef.current.innerHTML = "";

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: darkMode ? "0x0f1118" : "0xfafafa",
          antialias: true,
          cartoonQuality: 10,
        });

        viewerRef.current = viewer;
        viewer.setClickable({}, true, () => {});
        viewer.render();
      } catch {
        console.warn("3Dmol.js not available, using 2D fallback");
      }
    };

    init();
  }, [darkMode]);

  // Update molecule display
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.removeAllModels();
    viewer.removeAllLabels();

    if (molecule.atoms.length === 0) {
      viewer.render();
      return;
    }

    // Generate MOL data and load it
    const molData = generateMolFile(molecule);
    try {
      viewer.addModel(molData, "mol");

      // Apply render style
      applyRenderStyle(viewer, renderStyle, molecule);

      // Add labels if enabled
      if (showAtomLabels) {
        molecule.atoms.forEach((atom, i) => {
          const pos = atom.position3d ?? atom.position2d;
          if (pos) {
            viewer.addLabel(atom.element, {
              position: { x: pos.x, y: pos.y, z: (atom.position3d?.z ?? 0) },
              fontSize: 11,
              fontColor: darkMode ? "white" : "black",
              backgroundColor: "transparent",
              showBackground: false,
            });
          }
        });
      }

      viewer.zoomTo();
      viewer.render();
    } catch (e) {
      console.warn("Error rendering molecule:", e);
    }
  }, [molecule, renderStyle, showAtomLabels, darkMode]);

  // Handle click on viewer (for adding atoms, etc.)
  const handleViewerClick = useCallback(
    (e: React.MouseEvent) => {
      if (molecule.atoms.length === 0 && activeTool === "add-atom") {
        // Add first atom to empty canvas
        addAtomToMolecule(selectedElement, null, selectedBondOrder);
        return;
      }
    },
    [activeTool, selectedElement, selectedBondOrder, molecule.atoms.length, addAtomToMolecule]
  );

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {/* 3D Viewer */}
      <div
        ref={containerRef}
        className="mol-viewer-container w-full h-full min-h-[400px]"
        onClick={handleViewerClick}
        style={{ cursor: activeTool === "add-atom" ? "crosshair" : "grab" }}
      />

      {/* Empty State */}
      {molecule.atoms.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 animate-fade-in">
            <div className="text-4xl opacity-20">⬡</div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Click to add your first atom
              </p>
              <p className="text-xs text-muted-foreground/60">
                or use the element palette on the left
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Render style selector */}
      <div className="absolute bottom-3 left-3 flex gap-1">
        <StyleButton style="ball-and-stick" label="B&S" />
        <StyleButton style="stick" label="Stick" />
        <StyleButton style="space-filling" label="CPK" />
        <StyleButton style="wireframe" label="Wire" />
      </div>

      {/* Camera controls */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button
          className="h-7 w-7 rounded bg-background/80 backdrop-blur border border-border text-xs hover:bg-accent flex items-center justify-center"
          onClick={() => {
            viewerRef.current?.zoomTo();
            viewerRef.current?.render();
          }}
          title="Reset camera"
        >
          ⟳
        </button>
      </div>
    </div>
  );
}

function StyleButton({ style, label }: { style: RenderStyle; label: string }) {
  const { renderStyle, setRenderStyle } = useValenceStore();

  return (
    <button
      className={cn(
        "h-6 px-2 rounded text-[10px] transition-all",
        renderStyle === style
          ? "bg-primary text-primary-foreground"
          : "bg-background/80 backdrop-blur border border-border hover:bg-accent text-muted-foreground"
      )}
      onClick={() => setRenderStyle(style)}
    >
      {label}
    </button>
  );
}

function applyRenderStyle(viewer: any, style: RenderStyle, molecule: Molecule) {
  switch (style) {
    case "ball-and-stick":
      viewer.setStyle({}, {
        stick: { radius: 0.12, colorscheme: "Jmol" },
        sphere: { scale: 0.25, colorscheme: "Jmol" },
      });
      break;
    case "stick":
      viewer.setStyle({}, {
        stick: { radius: 0.15, colorscheme: "Jmol" },
      });
      break;
    case "space-filling":
      viewer.setStyle({}, {
        sphere: { colorscheme: "Jmol" },
      });
      break;
    case "wireframe":
      viewer.setStyle({}, {
        line: { colorscheme: "Jmol" },
      });
      break;
  }
}
