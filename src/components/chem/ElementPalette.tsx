"use client";

import React, { useState } from "react";
import { useValenceStore } from "@/lib/ui/store";
import { PALETTE_ELEMENTS, ELEMENTS, EXTENDED_ELEMENTS } from "@/lib/chem/elements";
import { BondOrder } from "@/lib/chem/types";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/components/ui/button";

export function ElementPalette() {
  const {
    selectedElement,
    setSelectedElement,
    activeTool,
    setActiveTool,
    selectedBondOrder,
    setSelectedBondOrder,
    userMode,
  } = useValenceStore();

  const [showExtended, setShowExtended] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExtended = searchTerm
    ? EXTENDED_ELEMENTS.filter(
        (s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ELEMENTS[s]?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : EXTENDED_ELEMENTS;

  return (
    <div className="flex flex-col gap-4">
      {/* Tool Selection */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Tools
        </h3>
        <div className="grid grid-cols-3 gap-1">
          <ToolButton
            label="Select"
            icon="↖"
            active={activeTool === "select"}
            onClick={() => setActiveTool("select")}
            shortcut="V"
          />
          <ToolButton
            label="Add"
            icon="+"
            active={activeTool === "add-atom"}
            onClick={() => setActiveTool("add-atom")}
            shortcut="A"
          />
          <ToolButton
            label="Bond"
            icon="—"
            active={activeTool === "add-bond"}
            onClick={() => setActiveTool("add-bond")}
            shortcut="B"
          />
          <ToolButton
            label="Remove"
            icon="×"
            active={activeTool === "remove"}
            onClick={() => setActiveTool("remove")}
            shortcut="X"
          />
          <ToolButton
            label="Charge"
            icon="±"
            active={activeTool === "charge"}
            onClick={() => setActiveTool("charge")}
            shortcut="Q"
          />
          <ToolButton
            label="Ring"
            icon="○"
            active={activeTool === "ring"}
            onClick={() => setActiveTool("ring")}
            shortcut="R"
          />
        </div>
      </div>

      {/* Element Palette */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Elements
        </h3>
        <div className="grid grid-cols-5 gap-1">
          {PALETTE_ELEMENTS.map((symbol) => (
            <ElementButton
              key={symbol}
              symbol={symbol}
              active={selectedElement === symbol}
              onClick={() => {
                setSelectedElement(symbol);
                if (activeTool !== "add-atom") setActiveTool("add-atom");
              }}
            />
          ))}
        </div>
        <button
          className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          onClick={() => setShowExtended(!showExtended)}
        >
          {showExtended ? "Hide extended" : "More elements..."}
        </button>
        {showExtended && (
          <div className="mt-1 space-y-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search elements..."
              className="w-full px-2 py-1 text-xs rounded border border-input bg-background"
            />
            <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
              {filteredExtended.slice(0, 30).map((symbol) => (
                <ElementButton
                  key={symbol}
                  symbol={symbol}
                  active={selectedElement === symbol}
                  onClick={() => {
                    setSelectedElement(symbol);
                    if (activeTool !== "add-atom") setActiveTool("add-atom");
                  }}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bond Order */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Bond Order
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {([1, 2, 3] as BondOrder[]).map((order) => (
            <button
              key={order}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md border transition-all",
                selectedBondOrder === order
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setSelectedBondOrder(order)}
            >
              {order === 1 ? "Single" : order === 2 ? "Double" : "Triple"}
            </button>
          ))}
        </div>
      </div>

      {/* Expert Controls */}
      {userMode === "expert" && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Expert
          </h3>
          <div className="grid grid-cols-2 gap-1">
            <ToolButton
              label="Stereo"
              icon="⟲"
              active={activeTool === "stereo"}
              onClick={() => setActiveTool("stereo")}
              shortcut="S"
            />
            <ToolButton
              label="H"
              icon="H"
              active={false}
              onClick={() => {
                // Toggle H display handled elsewhere
              }}
              shortcut="H"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ElementButton({
  symbol,
  active,
  onClick,
  compact = false,
}: {
  symbol: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const elem = ELEMENTS[symbol];
  if (!elem) return null;

  return (
    <Tooltip
      content={`${elem.name} (${elem.atomicNumber})`}
      side="right"
    >
      <button
        className={cn(
          "element-btn",
          active && "active",
          compact && "py-1 px-1"
        )}
        style={{
          borderLeftColor: active ? elem.color : undefined,
          borderLeftWidth: active ? 2 : undefined,
        }}
        onClick={onClick}
      >
        <span className="font-semibold" style={{ color: elem.color }}>
          {symbol}
        </span>
        {!compact && (
          <span className="text-[9px] text-muted-foreground leading-none">
            {elem.atomicNumber}
          </span>
        )}
      </button>
    </Tooltip>
  );
}

function ToolButton({
  label,
  icon,
  active,
  onClick,
  shortcut,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <Tooltip content={`${label}${shortcut ? ` (${shortcut})` : ""}`} side="right">
      <button
        className={cn(
          "flex flex-col items-center justify-center rounded-md border px-2 py-1.5 text-xs transition-all",
          active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border hover:border-primary/50 hover:bg-accent"
        )}
        onClick={onClick}
      >
        <span className="text-base leading-none">{icon}</span>
        <span className="text-[9px] mt-0.5">{label}</span>
      </button>
    </Tooltip>
  );
}
