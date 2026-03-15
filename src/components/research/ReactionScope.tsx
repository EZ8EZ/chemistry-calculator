"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  REACTIONS,
  getPublicationById,
  getPublicationUrl,
  type Reaction,
} from "@/lib/research/data";
import { MoleculeRenderer } from "./MoleculeRenderer";

const REACTION_TYPES: Record<string, { label: string; color: string; icon: string; description: string }> = {
  cyclopropanation: {
    label: "Cyclopropanation",
    color: "#D97706",
    icon: "\u25B3",
    description: "Formation of three-membered carbocyclic rings via radical [2+1] cycloaddition",
  },
  aziridination: {
    label: "Aziridination",
    color: "#059669",
    icon: "\u25B3",
    description: "Formation of three-membered nitrogen heterocycles via nitrene radical [2+1] cycloaddition",
  },
  "c-h-amination": {
    label: "C\u2013H Amination",
    color: "#DC2626",
    icon: "\u2192",
    description: "Direct C\u2013N bond formation from unactivated C\u2013H bonds via H-atom abstraction / radical rebound",
  },
  "c-h-alkylation": {
    label: "C\u2013H Alkylation",
    color: "#EA580C",
    icon: "\u2192",
    description: "Direct C\u2013C bond formation at C\u2013H sites via radical carbene addition",
  },
  olefination: {
    label: "Olefination",
    color: "#65A30D",
    icon: "=",
    description: "Selective alkene formation from carbonyls via divergent radical carbene pathway",
  },
};

function StructurePanel({
  label,
  name,
  smiles,
  color,
  highlighted = false,
}: {
  label: string;
  name: string;
  smiles: string;
  color?: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
        style={{ color: color || "#9CA3AF" }}
      >
        {label}
      </div>
      <div
        className={`rounded-xl overflow-hidden bg-white ${
          highlighted
            ? "border-2 shadow-md"
            : "border border-gray-200"
        }`}
        style={highlighted ? { borderColor: (color || "#6B7280") + "50", boxShadow: `0 4px 20px ${(color || "#6B7280")}15` } : undefined}
      >
        <MoleculeRenderer smiles={smiles} width={200} height={160} />
      </div>
      <div className="text-xs font-bold text-gray-800 mt-2.5 text-center max-w-[200px]">
        {name}
      </div>
      <div className="font-mono text-[9px] text-gray-400 mt-0.5 max-w-[200px] truncate text-center">
        {smiles}
      </div>
    </div>
  );
}

function ReactionArrowGraphic({
  catalystName,
  conditions,
  color,
}: {
  catalystName: string;
  conditions: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-2 min-w-[120px]">
      {/* Catalyst label above arrow */}
      <div
        className="text-[11px] font-bold px-3 py-1.5 rounded-lg mb-2 text-center whitespace-nowrap"
        style={{ backgroundColor: color + "10", color }}
      >
        {catalystName}
      </div>

      {/* Arrow */}
      <svg width="120" height="28" viewBox="0 0 120 28" className="my-1">
        {/* Arrow shaft with gradient */}
        <defs>
          <linearGradient id={`arrow-grad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D1D5DB" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <line x1="0" y1="14" x2="98" y2="14" stroke={`url(#arrow-grad-${color})`} strokeWidth="2.5" />
        <polygon points="96,7 116,14 96,21" fill={color} />
      </svg>

      {/* Conditions below arrow */}
      <div className="text-[10px] text-gray-400 mt-1 text-center whitespace-nowrap">
        {conditions}
      </div>
    </div>
  );
}

function MechanismFlow({
  intermediate,
  color,
}: {
  intermediate: string;
  color: string;
}) {
  // Parse multi-step intermediates (e.g. "A → B → C")
  const steps = intermediate.split("\u2192").map((s) => s.trim());

  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <svg width="20" height="16" viewBox="0 0 20 16" className="flex-shrink-0">
              <line x1="0" y1="8" x2="14" y2="8" stroke={color} strokeWidth="1.5" />
              <polygon points="13,4 20,8 13,12" fill={color} />
            </svg>
          )}
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md font-mono whitespace-nowrap"
            style={{ backgroundColor: color + "08", color, border: `1px solid ${color}20` }}
          >
            {step}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function ReactionCard({ reaction }: { reaction: Reaction }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = REACTION_TYPES[reaction.type];
  const papers = reaction.publicationIds.map(getPublicationById).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-xl"
    >
      {/* Header */}
      <div
        className="px-8 py-5 flex items-start justify-between gap-4"
        style={{ borderBottom: `3px solid ${typeInfo.color}15` }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: typeInfo.color }}
            >
              {typeInfo.icon}
            </span>
            <h3 className="text-xl font-extrabold text-gray-900">{reaction.name}</h3>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full"
              style={{ backgroundColor: typeInfo.color + "10", color: typeInfo.color }}
            >
              {typeInfo.label}
            </span>
            <span className="text-xs text-gray-400">{typeInfo.description}</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-sm"
          style={{
            backgroundColor: expanded ? typeInfo.color : typeInfo.color + "08",
            color: expanded ? "white" : typeInfo.color,
            border: `1px solid ${typeInfo.color}30`,
          }}
        >
          {expanded ? "Collapse" : "Explore mechanism"}
        </button>
      </div>

      {/* Reaction scheme */}
      <div className="px-8 py-10 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="flex items-center justify-center gap-6 flex-wrap xl:flex-nowrap">
          <StructurePanel
            label="Substrate"
            name={reaction.substrate.name}
            smiles={reaction.substrate.smiles}
          />

          <div className="text-gray-300 text-3xl font-extralight select-none">+</div>

          <StructurePanel
            label="Reagent"
            name={reaction.reagent.name}
            smiles={reaction.reagent.smiles}
          />

          <ReactionArrowGraphic
            catalystName={reaction.catalyst.name}
            conditions={reaction.conditions}
            color={typeInfo.color}
          />

          <StructurePanel
            label="Product"
            name={reaction.product.name}
            smiles={reaction.product.smiles}
            color={typeInfo.color}
            highlighted
          />
        </div>
      </div>

      {/* Mechanism flow — always visible */}
      <div className="px-8 py-4 bg-gray-50/80 border-t border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] flex-shrink-0">
            Key Intermediate:
          </span>
          <MechanismFlow intermediate={reaction.intermediate} color={typeInfo.color} />
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-8 py-6 border-t border-gray-100 space-y-5">
              {/* Mechanistic summary */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                  Mechanistic Summary
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
                  {reaction.summary}
                </p>
              </div>

              {/* Selectivity note */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Catalyst System
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{reaction.catalyst.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    d\u2077 metalloradical &middot; 15e\u207B open-shell complex
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Reaction Conditions
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{reaction.conditions}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    No external oxidant &middot; N\u2082 only byproduct
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] p-4 rounded-xl border border-gray-100" style={{ backgroundColor: typeInfo.color + "04" }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: typeInfo.color }}>
                    Selectivity
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {reaction.type === "cyclopropanation" || reaction.type === "aziridination"
                      ? "High enantioselectivity with chiral porphyrin"
                      : reaction.type === "olefination"
                      ? "E-selective with PPh\u2083 additive"
                      : "Site-selective for weak C\u2013H bonds"
                    }
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Controlled by chiral porphyrin ligand environment
                  </div>
                </div>
              </div>

              {/* Publications */}
              {papers.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">
                    Key Publications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {papers.map((p) => p && (
                      <a
                        key={p.id}
                        href={getPublicationUrl(p.doi)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-white group"
                      >
                        <div className="text-xs font-semibold text-gray-800 leading-snug group-hover:text-blue-700 transition-colors">
                          {p.title}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-gray-400">
                            {p.authors.split(";")[0]}; et al.
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500 italic">
                            {p.journal}
                          </span>
                          <span className="text-[10px] font-bold text-gray-600">{p.year}</span>
                          {p.landmark && (
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                              Landmark
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                          </svg>
                          Read paper
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ReactionScope() {
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? REACTIONS.filter((r) => r.type === filter) : REACTIONS;

  return (
    <section id="reactions" className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-2">
            Reaction Scope
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Key Transformations
          </h2>
          <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">
            Five classes of radical transformations enabled by metalloradical catalysis.
            Each proceeds through a distinct radical intermediate with full stereochemical control.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setFilter(null)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filter === null
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:shadow-sm"
            }`}
          >
            All reactions ({REACTIONS.length})
          </button>
          {Object.entries(REACTION_TYPES).map(([key, info]) => {
            const count = REACTIONS.filter((r) => r.type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filter === key
                    ? "text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:shadow-sm"
                }`}
                style={filter === key ? { backgroundColor: info.color, boxShadow: `0 4px 14px ${info.color}30` } : undefined}
              >
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Reaction cards */}
        <div className="space-y-10">
          {filtered.map((rxn) => (
            <ReactionCard key={rxn.id} reaction={rxn} />
          ))}
        </div>
      </div>
    </section>
  );
}
