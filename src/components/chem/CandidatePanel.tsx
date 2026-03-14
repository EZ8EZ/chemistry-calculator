"use client";

import React from "react";
import { useValenceStore } from "@/lib/ui/store";
import { MoleculeViewer2D } from "./MoleculeViewer2D";
import { Badge } from "@/components/ui/badge";
import { Button, cn } from "@/components/ui/button";

export function CandidatePanel() {
  const { candidates, showCandidatePanel, ambiguity, selectCandidate } =
    useValenceStore();

  if (!showCandidatePanel || candidates.length <= 1) return null;

  return (
    <div className="animate-panel-slide">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="purple">{candidates.length} candidates</Badge>
          <span className="text-xs text-muted-foreground">
            Multiple valid structures detected
          </span>
        </div>
      </div>

      {ambiguity?.reason && (
        <p className="text-xs text-muted-foreground mb-3 bg-purple-500/5 rounded px-3 py-2 border border-purple-500/10">
          {ambiguity.reason}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {candidates.map((candidate, i) => (
          <button
            key={candidate.id}
            className={cn(
              "relative rounded-lg border p-2 transition-all text-left",
              ambiguity?.selectedCandidateId === candidate.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
            onClick={() => selectCandidate(candidate.id)}
          >
            {/* Rank badge */}
            <div className="absolute top-1 right-1">
              <span className="text-[10px] text-muted-foreground font-mono">
                #{i + 1}
              </span>
            </div>

            {/* Mini 2D preview */}
            <div className="h-16 mb-1">
              <MoleculeViewer2D
                molecule={candidate.molecule}
                interactive={false}
                compact
              />
            </div>

            {/* Label */}
            <p className="text-[11px] font-medium truncate">
              {candidate.label}
            </p>

            {/* Differences */}
            <div className="flex flex-wrap gap-0.5 mt-1">
              {candidate.differences.map((diff, j) => (
                <span
                  key={j}
                  className="text-[9px] text-muted-foreground bg-muted rounded px-1"
                >
                  {diff.type}
                </span>
              ))}
            </div>

            {/* Plausibility score */}
            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full"
                style={{ width: `${candidate.plausibilityScore * 100}%` }}
              />
            </div>

            {/* SMILES */}
            <p className="text-[8px] font-mono text-muted-foreground mt-1 truncate">
              {candidate.smiles}
            </p>

            {/* Selected indicator */}
            {ambiguity?.selectedCandidateId === candidate.id && (
              <Badge variant="success" className="absolute bottom-1 right-1 text-[8px] px-1 py-0">
                Active
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
