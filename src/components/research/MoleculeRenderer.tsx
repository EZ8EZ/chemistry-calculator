"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Renders a 2D structure drawing from SMILES using SmilesDrawer.
 * Uses the SmiDrawer convenience class which handles parsing + SVG output.
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
        // @ts-ignore – smiles-drawer doesn't ship types
        const mod = await import("smiles-drawer");
        // The module default export or the module itself exposes SmiDrawer
        const SmiDrawerClass = mod.SmiDrawer || mod.default?.SmiDrawer;
        const SvgDrawerClass = mod.SvgDrawer || mod.default?.SvgDrawer;
        const ParserClass = mod.Parser || mod.default?.Parser;
        const parseFn = mod.parse || mod.default?.parse;

        // Strategy 1: Use SmiDrawer (highest-level API) to draw into an SVG element
        if (SmiDrawerClass) {
          const drawer = new SmiDrawerClass({
            width,
            height,
            bondThickness: 1.5,
            bondLength: 25,
            shortBondLength: 0.85,
            bondSpacing: 4.5,
            atomVisualization: "default",
            isomeric: true,
            debug: false,
            terminalCarbons: false,
            explicitHydrogens: false,
            overlapSensitivity: 0.42,
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
          });

          const svgEl = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          svgEl.setAttribute("width", String(width));
          svgEl.setAttribute("height", String(height));
          svgEl.style.display = "block";

          el.innerHTML = "";
          el.appendChild(svgEl);

          // SmiDrawer.draw(smiles, target, theme, successCb, errorCb)
          drawer.draw(
            smiles,
            svgEl,
            theme,
            () => {}, // success
            () => {
              // If SmiDrawer fails, show SMILES text
              setFailed(true);
            }
          );
          return;
        }

        // Strategy 2: Use SvgDrawer + Parser directly
        if (SvgDrawerClass && (ParserClass || parseFn)) {
          const parseTree = parseFn
            ? await new Promise<unknown>((resolve, reject) => {
                parseFn(smiles, resolve, reject);
              })
            : ParserClass.parse(smiles);

          const svgDrawer = new SvgDrawerClass({
            width,
            height,
            bondThickness: 1.5,
            bondLength: 25,
            compactDrawing: true,
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
          });

          const svgEl = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          svgEl.setAttribute("width", String(width));
          svgEl.setAttribute("height", String(height));
          svgEl.style.display = "block";

          el.innerHTML = "";
          el.appendChild(svgEl);

          svgDrawer.draw(parseTree, svgEl, theme);
          return;
        }

        // Strategy 3: Callback-based parse (original SmilesDrawer namespace)
        const parseCallback = parseFn || mod.parse;
        const DrawerClass = mod.Drawer || mod.default?.Drawer;
        if (parseCallback && (SvgDrawerClass || DrawerClass)) {
          parseCallback(
            smiles,
            (tree: unknown) => {
              const drawerClass = SvgDrawerClass || DrawerClass;
              const d = new drawerClass({ width, height, compactDrawing: true, padding: 15 });
              const svgEl = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
              );
              svgEl.setAttribute("width", String(width));
              svgEl.setAttribute("height", String(height));
              svgEl.style.display = "block";
              el.innerHTML = "";
              el.appendChild(svgEl);
              d.draw(tree, svgEl, theme);
            },
            () => {
              setFailed(true);
            }
          );
          return;
        }

        setFailed(true);
      } catch {
        setFailed(true);
      }
    };

    draw();
  }, [smiles, width, height, theme]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ width, height }}
      >
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
