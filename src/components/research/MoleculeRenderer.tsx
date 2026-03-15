"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Renders a 2D structure drawing from SMILES using SmilesDrawer.
 * Uses SVG output for crisp rendering at any size.
 */
export function MoleculeRenderer({
  smiles,
  width = 280,
  height = 200,
  className = "",
  theme = "light",
}: {
  smiles: string;
  width?: number;
  height?: number;
  className?: string;
  theme?: "light" | "dark";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setFailed(false);

    const el = containerRef.current;

    const draw = async () => {
      try {
        // @ts-ignore
        const SmilesDrawer = await import("smiles-drawer");

        // Use SvgDrawer for crisp vector output
        const options = {
          width,
          height,
          bondThickness: 1.5,
          bondLength: 25,
          shortBondLength: 0.85,
          bondSpacing: 4.5,
          atomVisualization: "default" as const,
          isomeric: true,
          debug: false,
          terminalCarbons: false,
          explicitHydrogens: false,
          overlapSensitivity: 0.42,
          overlapResolutionIterations: 1,
          compactDrawing: true,
          fontSizeLarge: 11,
          fontSizeSmall: 5,
          padding: 15,
          themes: {
            light: {
              C: "#333333",
              O: "#e74c3c",
              N: "#3498db",
              F: "#27ae60",
              Cl: "#27ae60",
              Br: "#e67e22",
              I: "#8e44ad",
              P: "#d35400",
              S: "#f39c12",
              B: "#e91e63",
              Si: "#9b59b6",
              H: "#666666",
              BACKGROUND: "#f9fafb",
            },
          },
        };

        // Parse and draw
        const parsed = SmilesDrawer.parse(smiles);
        const svgDrawer = new SmilesDrawer.SvgDrawer(options);

        // Create SVG element
        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEl.setAttribute("width", String(width));
        svgEl.setAttribute("height", String(height));
        svgEl.style.display = "block";

        el.innerHTML = "";
        el.appendChild(svgEl);

        svgDrawer.draw(parsed, svgEl, theme, false);
      } catch {
        // Fallback: try canvas-based SmiDrawer
        try {
          // @ts-ignore
          const SmilesDrawer = await import("smiles-drawer");
          const canvas = document.createElement("canvas");
          canvas.width = width * 2; // Higher res
          canvas.height = height * 2;
          canvas.style.width = width + "px";
          canvas.style.height = height + "px";

          el.innerHTML = "";
          el.appendChild(canvas);

          const drawer = new SmilesDrawer.SmiDrawer({ width: width * 2, height: height * 2 });
          drawer.draw(smiles, canvas, theme);
        } catch {
          setFailed(true);
        }
      }
    };

    draw();
  }, [smiles, width, height, theme]);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-center px-4">
          <div className="font-mono text-[11px] text-gray-400 break-all leading-relaxed">
            {smiles}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden ${className}`}
      style={{ minWidth: width, minHeight: height }}
    />
  );
}
