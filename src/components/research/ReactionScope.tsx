"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  REACTIONS,
  getPublicationById,
  getPublicationUrl,
  type Reaction,
} from "@/lib/research/data";

const REACTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  cyclopropanation: { label: "Cyclopropanation", color: "#F59E0B" },
  aziridination: { label: "Aziridination", color: "#10B981" },
  "c-h-amination": { label: "C\u2013H Amination", color: "#EF4444" },
  "c-h-alkylation": { label: "C\u2013H Alkylation", color: "#F97316" },
  olefination: { label: "Olefination", color: "#84CC16" },
};

function ReactionArrow() {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-4 md:px-4">
      <svg width="80" height="40" viewBox="0 0 80 40" className="text-muted-foreground">
        <line x1="0" y1="20" x2="65" y2="20" stroke="currentColor" strokeWidth="2" />
        <polygon points="65,14 80,20 65,26" fill="currentColor" />
      </svg>
    </div>
  );
}

function MoleculeBox({
  label,
  name,
  smiles,
  color,
}: {
  label: string;
  name: string;
  smiles: string;
  color?: string;
}) {
  return (
    <div className="text-center space-y-1.5 min-w-[100px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className="px-3 py-2.5 rounded-lg border border-border bg-card"
        style={color ? { borderColor: color + "40" } : undefined}
      >
        <div className="text-sm font-medium text-foreground">{name}</div>
        {smiles && (
          <div className="font-mono text-[9px] text-muted-foreground mt-1 truncate max-w-[140px]">
            {smiles}
          </div>
        )}
      </div>
    </div>
  );
}

function ReactionCard({ reaction }: { reaction: Reaction }) {
  const [showDetail, setShowDetail] = useState(false);
  const typeInfo = REACTION_TYPE_LABELS[reaction.type];
  const papers = reaction.publicationIds.map(getPublicationById).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-border bg-card/80 backdrop-blur overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{reaction.name}</h3>
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: typeInfo.color + "20", color: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
        </div>
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showDetail ? "Hide detail" : "Show detail"}
        </button>
      </div>

      {/* Reaction scheme */}
      <div className="px-6 py-6 flex items-center justify-center gap-2 flex-wrap md:flex-nowrap overflow-x-auto">
        <MoleculeBox label="Substrate" name={reaction.substrate.name} smiles={reaction.substrate.smiles} />
        <span className="text-muted-foreground text-lg">+</span>
        <MoleculeBox label="Reagent" name={reaction.reagent.name} smiles={reaction.reagent.smiles} />

        <div className="flex flex-col items-center">
          <ReactionArrow />
          <div className="text-[10px] text-muted-foreground -mt-1">
            {reaction.catalyst.name}
          </div>
          <div className="text-[9px] text-muted-foreground/60">
            {reaction.conditions}
          </div>
        </div>

        <MoleculeBox
          label="Product"
          name={reaction.product.name}
          smiles={reaction.product.smiles}
          color={typeInfo.color}
        />
      </div>

      {/* Detail panel */}
      {showDetail && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-6 py-4 border-t border-border bg-muted/20 space-y-4"
        >
          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {reaction.summary}
          </p>

          {/* Key intermediate */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Key Intermediate:
            </span>
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
              {reaction.intermediate}
            </span>
          </div>

          {/* Papers */}
          {papers.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Publications
              </span>
              {papers.map((p) => p && (
                <a
                  key={p.id}
                  href={getPublicationUrl(p.doi)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-primary/80 hover:text-primary hover:underline"
                >
                  {p.authors.split(";")[0]}; et al.{" "}
                  <span className="italic">{p.journal}</span> {p.year}.
                  {p.landmark && <span className="ml-1 text-amber-400">&#9733;</span>}
                </a>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export function ReactionScope() {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? REACTIONS.filter((r) => r.type === filter)
    : REACTIONS;

  return (
    <section id="reactions" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Reaction Scope
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Key transformations enabled by metalloradical catalysis.
            Each reaction proceeds through a distinct radical intermediate.
          </p>
        </motion.div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === null
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({REACTIONS.length})
          </button>
          {Object.entries(REACTION_TYPE_LABELS).map(([key, info]) => {
            const count = REACTIONS.filter((r) => r.type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === key
                    ? "text-white shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
                style={filter === key ? { backgroundColor: info.color } : undefined}
              >
                {info.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Reaction cards */}
        <div className="space-y-6">
          {filtered.map((rxn) => (
            <ReactionCard key={rxn.id} reaction={rxn} />
          ))}
        </div>
      </div>
    </section>
  );
}
