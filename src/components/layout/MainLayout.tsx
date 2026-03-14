"use client";

import React, { useEffect, useCallback } from "react";
import { useValenceStore } from "@/lib/ui/store";
import { Header } from "./Header";
import { ElementPalette } from "@/components/chem/ElementPalette";
import { MoleculeViewer3D } from "@/components/chem/MoleculeViewer3D";
import { MoleculeViewer2D } from "@/components/chem/MoleculeViewer2D";
import { IdentityPanel } from "@/components/chem/IdentityPanel";
import { AtomInspector } from "@/components/chem/AtomInspector";
import { CandidatePanel } from "@/components/chem/CandidatePanel";
import { ExportPanel } from "@/components/chem/ExportPanel";
import { ActionHistory } from "@/components/chem/ActionHistory";
import { MoleculeLibrary } from "@/components/chem/MoleculeLibrary";
import { SmartSuggestions } from "@/components/chem/SmartSuggestions";
import { cn } from "@/components/ui/button";

export function MainLayout() {
  const {
    darkMode,
    showRightPanel,
    showBottomDrawer,
    toggleBottomDrawer,
    undo,
    redo,
    setActiveTool,
    setSelectedElement,
    clearAll,
    molecule,
    userMode,
    toggleLibrary,
    showLibrary,
  } = useValenceStore();

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl/Cmd shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
        }
        return;
      }

      // Tool shortcuts (no modifier)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select");
          break;
        case "a":
          setActiveTool("add-atom");
          break;
        case "b":
          setActiveTool("add-bond");
          break;
        case "x":
          setActiveTool("remove");
          break;
        case "q":
          setActiveTool("charge");
          break;
        case "r":
          setActiveTool("ring");
          break;
        case "s":
          setActiveTool("stereo");
          break;
        case "delete":
        case "backspace":
          // Delete selected atom/bond
          break;
        // Element shortcuts
        case "c":
          setSelectedElement("C");
          setActiveTool("add-atom");
          break;
        case "n":
          setSelectedElement("N");
          setActiveTool("add-atom");
          break;
        case "o":
          setSelectedElement("O");
          setActiveTool("add-atom");
          break;
        case "f":
          setSelectedElement("F");
          setActiveTool("add-atom");
          break;
        case "p":
          setSelectedElement("P");
          setActiveTool("add-atom");
          break;
        case "l":
          toggleLibrary();
          break;
        case "escape":
          if (showLibrary) toggleLibrary();
          break;
      }
    },
    [undo, redo, setActiveTool, setSelectedElement, toggleLibrary, showLibrary]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={cn("h-screen flex flex-col", darkMode && "dark")}>
      <Header />
      <MoleculeLibrary />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail */}
        <aside className="w-56 border-r border-border bg-card/50 overflow-y-auto p-3 shrink-0">
          <ElementPalette />
        </aside>

        {/* Center Stage */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 3D/2D Viewer */}
          <div className="flex-1 relative flex">
            {/* 2D View (primary interactive surface) */}
            <div className="flex-1 bg-background p-2 flex flex-col">
              {/* Smart suggestions for beginners */}
              <SmartSuggestions />
              <div className="flex-1 rounded-lg border border-border bg-card relative overflow-hidden">
                <MoleculeViewer2D className="w-full h-full" />
                {/* View mode label */}
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] text-muted-foreground bg-background/80 backdrop-blur px-1.5 py-0.5 rounded">
                    2D Editor
                  </span>
                </div>
              </div>
            </div>

            {/* 3D View (side panel) */}
            <div className="w-80 border-l border-border bg-background p-2 hidden lg:block">
              <div className="w-full h-full rounded-lg border border-border overflow-hidden relative">
                <MoleculeViewer3D className="w-full h-full" />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] text-muted-foreground bg-background/80 backdrop-blur px-1.5 py-0.5 rounded">
                    3D View
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Drawer */}
          <div className="border-t border-border bg-card/50">
            <button
              className="w-full h-7 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              onClick={toggleBottomDrawer}
            >
              {showBottomDrawer ? "▾ Hide details" : "▴ Show details"}
            </button>
            {showBottomDrawer && (
              <div className="p-3 max-h-64 overflow-y-auto animate-panel-slide border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <CandidatePanel />
                  </div>
                  <div>
                    <ExportPanel />
                  </div>
                  <div>
                    <ActionHistory />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Panel */}
        {showRightPanel && (
          <aside className="w-72 border-l border-border bg-card/50 overflow-y-auto shrink-0 animate-panel-slide">
            <div className="p-3 space-y-4">
              {/* Inspector */}
              <Section title="Inspector">
                <AtomInspector />
              </Section>

              {/* Identity */}
              <Section title="Identity">
                <IdentityPanel />
              </Section>

              {/* Export (compact in right panel) */}
              {userMode === "expert" && (
                <Section title="Export">
                  <ExportPanel />
                </Section>
              )}

              {/* History */}
              <Section title="History">
                <ActionHistory />
              </Section>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="border-b border-border pb-3 last:border-0">
      <button
        className="w-full flex items-center justify-between py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        {title}
        <span className="text-[10px]">{collapsed ? "▸" : "▾"}</span>
      </button>
      {!collapsed && <div className="mt-2">{children}</div>}
    </div>
  );
}
