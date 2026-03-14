"use client";

import React from "react";
import { useValenceStore } from "@/lib/ui/store";
import { Button, cn } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function Header() {
  const {
    userMode,
    setUserMode,
    darkMode,
    toggleDarkMode,
    undo,
    redo,
    undoStack,
    redoStack,
    clearAll,
    lastMessage,
    molecule,
    toggleRightPanel,
    showRightPanel,
    toggleLibrary,
  } = useValenceStore();

  return (
    <header className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">V</span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight">
            Valence Studio
          </h1>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          v0.1
        </span>
        <Tooltip content="Molecule Library (L)">
          <button
            className="h-8 px-2.5 rounded-md text-[11px] font-medium hover:bg-accent border border-border transition-all flex items-center gap-1.5"
            onClick={toggleLibrary}
          >
            <span>◇</span>
            <span>Library</span>
          </button>
        </Tooltip>
      </div>

      {/* Center: Status message */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted-foreground max-w-md truncate">
          {lastMessage}
        </p>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <Tooltip content="Undo (Ctrl+Z)">
          <button
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors",
              undoStack.length > 0
                ? "hover:bg-accent"
                : "opacity-30 cursor-not-allowed"
            )}
            onClick={undo}
            disabled={undoStack.length === 0}
          >
            ↩
          </button>
        </Tooltip>
        <Tooltip content="Redo (Ctrl+Shift+Z)">
          <button
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors",
              redoStack.length > 0
                ? "hover:bg-accent"
                : "opacity-30 cursor-not-allowed"
            )}
            onClick={redo}
            disabled={redoStack.length === 0}
          >
            ↪
          </button>
        </Tooltip>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Clear */}
        <Tooltip content="Clear canvas">
          <button
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors",
              molecule.atoms.length > 0
                ? "hover:bg-accent"
                : "opacity-30 cursor-not-allowed"
            )}
            onClick={clearAll}
            disabled={molecule.atoms.length === 0}
          >
            ⌫
          </button>
        </Tooltip>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Mode toggle */}
        <Tooltip content={`Switch to ${userMode === "beginner" ? "expert" : "beginner"} mode`}>
          <button
            className={cn(
              "h-8 px-2.5 rounded-md text-[11px] font-medium transition-all",
              userMode === "expert"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                : "hover:bg-accent border border-transparent"
            )}
            onClick={() =>
              setUserMode(userMode === "beginner" ? "expert" : "beginner")
            }
          >
            {userMode === "expert" ? "Expert" : "Beginner"}
          </button>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip content="Toggle theme">
          <button
            className="h-8 w-8 rounded-md flex items-center justify-center text-sm hover:bg-accent transition-colors"
            onClick={toggleDarkMode}
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </Tooltip>

        {/* Right panel toggle */}
        <Tooltip content="Toggle info panel">
          <button
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors",
              showRightPanel ? "bg-accent" : "hover:bg-accent"
            )}
            onClick={toggleRightPanel}
          >
            ⊞
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
