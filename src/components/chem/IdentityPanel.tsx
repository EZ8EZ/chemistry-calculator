"use client";

import React from "react";
import { useValenceStore } from "@/lib/ui/store";
import { Badge } from "@/components/ui/badge";
import { Button, cn } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { getConfidenceBadge } from "@/lib/candidates/ambiguity";

export function IdentityPanel() {
  const { molecule, identity, ambiguity, userMode } = useValenceStore();

  if (molecule.atoms.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>No molecule</p>
        <p className="text-xs mt-1 opacity-60">Add atoms to see identity</p>
      </div>
    );
  }

  if (!identity) return null;

  const badge = ambiguity ? getConfidenceBadge(ambiguity.confidence) : null;
  const badgeVariant = badge?.color === "green" ? "success" as const
    : badge?.color === "yellow" ? "warning" as const
    : badge?.color === "purple" ? "purple" as const
    : badge?.color === "red" ? "destructive" as const
    : "secondary" as const;

  return (
    <div className="space-y-4">
      {/* Confidence Badge */}
      {badge && (
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant}>
            {badge.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{badge.description}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <Label>Name</Label>
        {identity.commonName ? (
          <div>
            <p className="text-sm font-medium">{identity.commonName}</p>
            <p className="text-xs text-muted-foreground">
              Confidence: {identity.nameConfidence}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No confident common-name match
          </p>
        )}
      </div>

      {/* Formula */}
      <div>
        <Label>Molecular Formula</Label>
        <p className="text-sm font-mono chem-formula">
          {formatFormula(identity.formula)}
        </p>
      </div>

      {/* Mass */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Exact Mass</Label>
          <p className="text-sm font-mono">{identity.exactMass.toFixed(5)}</p>
        </div>
        <div>
          <Label>Mol. Weight</Label>
          <p className="text-sm font-mono">{identity.molecularWeight.toFixed(3)}</p>
        </div>
      </div>

      {/* Charge */}
      {identity.formalCharge !== 0 && (
        <div>
          <Label>Formal Charge</Label>
          <p className="text-sm font-mono">
            {identity.formalCharge > 0 ? "+" : ""}{identity.formalCharge}
          </p>
        </div>
      )}

      {/* Counts */}
      <div>
        <Label>Structure</Label>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <CountRow label="Atoms" value={identity.atomCount} />
          <CountRow label="Bonds" value={identity.bondCount} />
          <CountRow label="Rings" value={identity.ringCount} />
          <CountRow label="Aromatic" value={identity.aromaticRingCount} />
          <CountRow label="Stereocenters" value={identity.stereocenterCount} />
          {identity.ezBondCount > 0 && (
            <CountRow label="E/Z bonds" value={identity.ezBondCount} />
          )}
        </div>
      </div>

      {/* Identifiers */}
      <div>
        <Label>Identifiers</Label>
        <div className="space-y-2">
          <IdentifierRow
            label="SMILES"
            value={identity.canonicalSmiles}
          />
          {identity.isomericSmiles !== identity.canonicalSmiles && (
            <IdentifierRow
              label="Isomeric SMILES"
              value={identity.isomericSmiles}
            />
          )}
          {identity.inchi && (
            <IdentifierRow label="InChI" value={identity.inchi} />
          )}
          {identity.inchiKey && (
            <IdentifierRow label="InChIKey" value={identity.inchiKey} />
          )}
        </div>
      </div>

      {/* Support Level */}
      <div>
        <Label>Support Level</Label>
        <Badge
          variant={
            identity.supportLevel === "fully-supported" ? "success"
            : identity.supportLevel === "partially-supported" ? "warning"
            : "destructive"
          }
        >
          {identity.supportLevel.replace(/-/g, " ")}
        </Badge>
      </div>

      {/* Ambiguity Info */}
      {ambiguity && ambiguity.confidence !== "uniquely-resolved" && (
        <div>
          <Label>Ambiguity</Label>
          <p className="text-xs text-muted-foreground">{ambiguity.reason}</p>
          {ambiguity.symmetryNote && (
            <p className="text-xs text-muted-foreground mt-1">
              {ambiguity.symmetryNote}
            </p>
          )}
        </div>
      )}

      {/* Warnings */}
      {molecule.metadata.warnings.length > 0 && userMode === "expert" && (
        <div>
          <Label>Warnings</Label>
          <div className="space-y-1">
            {molecule.metadata.warnings.map((w, i) => (
              <div
                key={i}
                className={cn(
                  "text-xs px-2 py-1 rounded",
                  w.severity === "error" && "bg-red-500/10 text-red-400",
                  w.severity === "warning" && "bg-yellow-500/10 text-yellow-400",
                  w.severity === "info" && "bg-blue-500/10 text-blue-400"
                )}
              >
                {w.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
      {children}
    </p>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function IdentifierRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available
    }
  };

  if (!value) return null;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-xs font-mono break-all bg-muted/50 rounded px-2 py-1 select-all">
        {value}
      </p>
    </div>
  );
}

function formatFormula(formula: string): React.ReactNode {
  // Convert C2H6O to C₂H₆O with subscripts
  const parts: React.ReactNode[] = [];
  let i = 0;

  while (i < formula.length) {
    // Element symbol (uppercase optionally followed by lowercase)
    if (formula[i] >= "A" && formula[i] <= "Z") {
      let sym = formula[i];
      i++;
      while (i < formula.length && formula[i] >= "a" && formula[i] <= "z") {
        sym += formula[i];
        i++;
      }
      parts.push(<span key={`el-${i}`}>{sym}</span>);
    }
    // Number (subscript)
    else if (formula[i] >= "0" && formula[i] <= "9") {
      let num = "";
      while (i < formula.length && formula[i] >= "0" && formula[i] <= "9") {
        num += formula[i];
        i++;
      }
      parts.push(<sub key={`sub-${i}`}>{num}</sub>);
    } else {
      parts.push(<span key={`other-${i}`}>{formula[i]}</span>);
      i++;
    }
  }

  return <>{parts}</>;
}
