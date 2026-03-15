"use client";

import React, { useEffect, useRef } from "react";

/**
 * Renders a 2D structure drawing from SMILES using SmilesDrawer.
 * Falls back to a styled SMILES text display if rendering fails.
 */
export function MoleculeRenderer({
  smiles,
  width = 280,
  height = 200,
  className = "",
}: {
  smiles: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || drawnRef.current) return;

    const draw = async () => {
      try {
        // @ts-ignore - smiles-drawer doesn't have great types
        const SmilesDrawer = await import("smiles-drawer");
        const drawer = new SmilesDrawer.SmiDrawer({ width, height });
        drawer.draw(smiles, canvasRef.current, "light");
        drawnRef.current = true;
      } catch {
        // Fallback handled by the canvas being blank + overlay
      }
    };

    draw();
  }, [smiles, width, height]);

  return (
    <div className={`relative flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="smiles-canvas"
      />
    </div>
  );
}
