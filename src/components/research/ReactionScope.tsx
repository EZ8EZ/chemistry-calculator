"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  REACTIONS,
  getPublicationById,
  getPublicationUrl,
  type Reaction,
} from "@/lib/research/data";
import { MoleculeRenderer } from "./MoleculeRenderer";

const REACTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  cyclopropanation: { label: "Cyclopropanation", color: "#D97706" },
  aziridination: { label: "Aziridination", color: "#059669" },
  "c-h-amination": { label: "C\u2013H Amination", color: "#DC2626" },
  "c-h-alkylation": { label: "C\u2013H Alkylation", color: "#EA580C" },
  olefination: { label: "Olefination", color: "#65A30D" },
};

function ReactionCard({ reaction }: { reaction: Reaction }) {
  const [showDetail, setShowDetail] = useState(false);
  const typeInfo = REACTION_TYPE_LABELS[reaction.type];
  const papers = reaction.publicationIds.map(getPublicationById).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{reaction.name}</h3>
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest mt-1 px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: typeInfo.color + "12", color: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
        </div>
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          {showDetail ? "Hide detail" : "View detail"}
        </button>
      </div>

      {/* Reaction scheme with structure drawings */}
      <div className="px-6 py-8 flex items-center justify-center gap-4 flex-wrap lg:flex-nowrap">
        {/* Substrate */}
        <div className="text-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Substrate</div>
          <MoleculeRenderer smiles={reaction.substrate.smiles} width={140} height={100} className="rounded-lg border border-gray-100" />
          <div className="text-xs font-semibold text-gray-700 mt-2">{reaction.substrate.name}</div>
        </div>

        <span className="text-gray-300 text-2xl font-light">+</span>

        {/* Reagent */}
        <div className="text-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reagent</div>
          <MoleculeRenderer smiles={reaction.reagent.smiles} width={140} height={100} className="rounded-lg border border-gray-100" />
          <div className="text-xs font-semibold text-gray-700 mt-2">{reaction.reagent.name}</div>
        </div>

        {/* Arrow + catalyst */}
        <div className="flex flex-col items-center px-4">
          <svg width="100" height="32" viewBox="0 0 100 32" className="text-gray-400">
            <line x1="0" y1="16" x2="82" y2="16" stroke="currentColor" strokeWidth="2.5" />
            <polygon points="82,10 100,16 82,22" fill="currentColor" />
          </svg>
          <div className="text-[11px] font-semibold text-gray-600 mt-1">{reaction.catalyst.name}</div>
          <div className="text-[10px] text-gray-400">{reaction.conditions}</div>
        </div>

        {/* Product */}
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: typeInfo.color }}>Product</div>
          <div className="rounded-lg border-2 overflow-hidden" style={{ borderColor: typeInfo.color + "30" }}>
            <MoleculeRenderer smiles={reaction.product.smiles} width={140} height={100} />
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-2">{reaction.product.name}</div>
        </div>
      </div>

      {/* Detail panel */}
      {showDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-5 border-t border-gray-100 bg-gray-50 space-y-4"
        >
          <p className="text-sm text-gray-600 leading-relaxed">{reaction.summary}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Key Intermediate:</span>
            <span className="font-mono text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
              {reaction.intermediate}
            </span>
          </div>

          {papers.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publications</span>
              {papers.map((p) => p && (
                <a
                  key={p.id}
                  href={getPublicationUrl(p.doi)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {p.authors.split(";")[0]}; et al. <span className="italic">{p.journal}</span> {p.year}.
                  {p.landmark && <span className="ml-1 text-amber-500">&#9733;</span>}
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
  const filtered = filter ? REACTIONS.filter((r) => r.type === filter) : REACTIONS;

  return (
    <section id="reactions" className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Reaction Scope</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Key Transformations</h2>
          <p className="text-gray-500 max-w-2xl text-base">
            Each reaction proceeds through a distinct radical intermediate.
            Structures are drawn for substrate, reagent, and product.
          </p>
        </motion.div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === null ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
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
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === key ? "text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
                }`}
                style={filter === key ? { backgroundColor: info.color } : undefined}
              >
                {info.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="space-y-8">
          {filtered.map((rxn) => <ReactionCard key={rxn.id} reaction={rxn} />)}
        </div>
      </div>
    </section>
  );
}
