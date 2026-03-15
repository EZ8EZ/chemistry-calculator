"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MOLECULE_CATEGORIES,
  getPublicationsForMolecule,
  getPublicationUrl,
  type Publication,
} from "@/lib/research/data";
import { ZHANG_LAB_TEMPLATES } from "@/lib/chem/templates";
import type { MoleculeTemplate } from "@/lib/chem/templates";
import { MoleculeRenderer } from "./MoleculeRenderer";

function MoleculeCard({ template, accentColor }: { template: MoleculeTemplate; accentColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const papers = getPublicationsForMolecule(template.id);

  return (
    <motion.div
      layout
      className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-lg cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      {/* 2D Structure Drawing */}
      <div className="border-b border-gray-100" style={{ borderBottomColor: accentColor + "25" }}>
        <MoleculeRenderer
          smiles={template.smiles}
          width={300}
          height={200}
          className="w-full"
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <h4 className="text-sm font-bold text-gray-900">{template.name}</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{template.description}</p>

        {/* SMILES */}
        <div className="mt-3 px-2.5 py-1.5 rounded-md bg-gray-50 font-mono text-[10px] text-gray-400 truncate border border-gray-100">
          {template.smiles}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {template.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: accentColor + "12", color: accentColor }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Expand hint */}
        <div className="mt-3 text-[10px] font-semibold text-gray-300 group-hover:text-gray-500 transition-colors uppercase tracking-wider">
          {expanded ? "Click to collapse" : "Click for details & papers"}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {template.context && (
                <p className="text-xs text-gray-600 mt-4 leading-relaxed border-t border-gray-100 pt-4">
                  {template.context}
                </p>
              )}

              {papers.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Related Publications
                  </div>
                  {papers.map((p) => (
                    <PaperLink key={p.id} paper={p} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PaperLink({ paper }: { paper: Publication }) {
  return (
    <a
      href={getPublicationUrl(paper.doi)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-start gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 hover:underline mb-2 leading-snug"
    >
      <svg className="w-3 h-3 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
      </svg>
      <span>
        {paper.authors.split(";")[0]}; et al.{" "}
        <span className="italic">{paper.journal}</span>{" "}
        <span className="font-bold">{paper.year}</span>
        {paper.volume && `, ${paper.volume}`}
        {paper.landmark && <span className="ml-1 text-amber-500">&#9733;</span>}
      </span>
    </a>
  );
}

export function MoleculeGallery() {
  const [activeCategory, setActiveCategory] = useState(MOLECULE_CATEGORIES[0].id);

  const category = MOLECULE_CATEGORIES.find((c) => c.id === activeCategory)!;
  const templates = category.templateIds
    .map((id) => ZHANG_LAB_TEMPLATES.find((t) => t.id === id))
    .filter(Boolean) as MoleculeTemplate[];

  return (
    <section id="molecules" className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">
            Molecular Library
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Reagents, Catalysts & Products
          </h2>
          <p className="text-gray-500 max-w-2xl text-base">
            2D structure drawings of key molecules in metalloradical catalysis.
            Click any molecule for context and linked publications.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MOLECULE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? "text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:shadow-sm"
              }`}
              style={
                activeCategory === cat.id
                  ? { backgroundColor: cat.color, boxShadow: `0 4px 14px ${cat.color}30` }
                  : undefined
              }
            >
              {cat.name}
              <span className="ml-1.5 text-xs opacity-60">({cat.templateIds.length})</span>
            </button>
          ))}
        </div>

        {/* Category description */}
        <p className="text-sm text-gray-400 mb-8 italic">
          {category.description}
        </p>

        {/* Molecule grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {templates.map((t) => (
              <MoleculeCard key={t.id} template={t} accentColor={category.color} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
