"use client";

import React, { useState } from "react";
import { useValenceStore } from "@/lib/ui/store";
import { generateMolFile, generateXYZFile, generateSmiles } from "@/lib/chem/graph";
import { Button, cn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ExportFormat = "smiles" | "isomeric-smiles" | "mol" | "xyz" | "inchi" | "inchikey";

export function ExportPanel() {
  const { molecule, identity } = useValenceStore();
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  if (molecule.atoms.length === 0) {
    return (
      <div className="p-3 text-center text-xs text-muted-foreground">
        No molecule to export
      </div>
    );
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setLastCopied(label);
      setTimeout(() => setLastCopied(null), 2000);
    } catch {
      // Fallback
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exports: { label: string; format: string; action: () => void }[] = [
    {
      label: "SMILES",
      format: identity?.canonicalSmiles ?? "",
      action: () => copyToClipboard(identity?.canonicalSmiles ?? "", "SMILES"),
    },
    {
      label: "Isomeric SMILES",
      format: identity?.isomericSmiles ?? "",
      action: () => copyToClipboard(identity?.isomericSmiles ?? "", "Isomeric SMILES"),
    },
    {
      label: "MOL (V2000)",
      format: "Download",
      action: () => {
        const mol = generateMolFile(molecule);
        downloadFile(mol, "molecule.mol", "chemical/x-mdl-molfile");
      },
    },
    {
      label: "SDF",
      format: "Download",
      action: () => {
        const mol = generateMolFile(molecule);
        downloadFile(mol + "\n$$$$\n", "molecule.sdf", "chemical/x-mdl-sdfile");
      },
    },
    {
      label: "XYZ",
      format: "Download",
      action: () => {
        const xyz = generateXYZFile(molecule);
        downloadFile(xyz, "molecule.xyz", "chemical/x-xyz");
      },
    },
  ];

  if (identity?.inchi) {
    exports.push({
      label: "InChI",
      format: identity.inchi,
      action: () => copyToClipboard(identity.inchi, "InChI"),
    });
  }

  if (identity?.inchiKey) {
    exports.push({
      label: "InChIKey",
      format: identity.inchiKey,
      action: () => copyToClipboard(identity.inchiKey, "InChIKey"),
    });
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Export
      </h3>
      <div className="space-y-1">
        {exports.map((exp) => (
          <button
            key={exp.label}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-accent transition-colors group"
            onClick={exp.action}
          >
            <span className="font-medium">{exp.label}</span>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              {lastCopied === exp.label ? (
                <Badge variant="success" className="text-[9px]">Copied</Badge>
              ) : exp.format === "Download" ? (
                "↓"
              ) : (
                "Copy"
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Screenshot */}
      <button
        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-accent transition-colors border border-dashed border-border mt-2"
        onClick={() => {
          // Screenshot the 3D viewer canvas
          const canvas = document.querySelector(".mol-viewer-container canvas") as HTMLCanvasElement;
          if (canvas) {
            const link = document.createElement("a");
            link.download = "molecule.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
          }
        }}
      >
        <span className="font-medium">Screenshot (PNG)</span>
        <span className="text-muted-foreground">↓</span>
      </button>
    </div>
  );
}
