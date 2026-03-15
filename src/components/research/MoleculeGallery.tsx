"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MOLECULE_CATEGORIES,
  getPublicationsForMolecule,
  getPublicationUrl,
  type Publication,
} from "@/lib/research/data";
import { ZHANG_LAB_TEMPLATES } from "@/lib/chem/templates";
import type { MoleculeTemplate } from "@/lib/chem/templates";

function Molecule3DViewer({ smiles, name }: { smiles: string; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const init = async () => {
      try {
        const $3Dmol = await import("3dmol");
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "0x0a0a12",
          antialias: true,
        });

        // Use SDF/SMILES approach
        try {
          viewer.addModel(smiles, "smi");
          viewer.setStyle({}, {
            stick: { radius: 0.12, colorscheme: "Jmol" },
            sphere: { scale: 0.25, colorscheme: "Jmol" },
          });
          viewer.zoomTo();
          viewer.render();
          viewer.spin("y", 0.5);
        } catch {
          // Fallback: just show name
        }

        viewerRef.current = viewer;
      } catch {
        // 3Dmol not available
      }
    };

    init();

    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.clear(); } catch {}
      }
    };
  }, [smiles]);

  return (
    <div
      ref={containerRef}
      className="w-full h-48 rounded-md bg-[#0a0a12] relative"
      title={name}
    />
  );
}

function MoleculeCard({ template }: { template: MoleculeTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const papers = getPublicationsForMolecule(template.id);

  return (
    <motion.div
      layout
      className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* 3D Viewer */}
      <Molecule3DViewer smiles={template.smiles} name={template.name} />

      {/* Info */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-foreground truncate">{template.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>

        {/* SMILES */}
        <div className="mt-2 px-2 py-1 rounded bg-muted/50 font-mono text-[10px] text-muted-foreground truncate">
          {template.smiles}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>

        {/* Expanded: context + papers */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {template.context && (
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed border-t border-border pt-3">
                  {template.context}
                </p>
              )}

              {papers.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
      className="block text-xs text-primary/80 hover:text-primary hover:underline mb-1.5 leading-snug"
    >
      {paper.authors.split(";")[0]}; et al.{" "}
      <span className="italic">{paper.journal}</span> {paper.year}.
      {paper.landmark && <span className="ml-1 text-amber-400">&#9733;</span>}
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
    <section id="molecules" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Molecular Library
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Interactive 3D structures of catalysts, reagents, and products central to
            metalloradical catalysis. Click any molecule for context and linked publications.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {MOLECULE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "text-white shadow-lg"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
              style={
                activeCategory === cat.id
                  ? { backgroundColor: cat.color }
                  : undefined
              }
            >
              {cat.name}
              <span className="ml-1.5 text-xs opacity-60">({cat.templateIds.length})</span>
            </button>
          ))}
        </div>

        {/* Category description */}
        <p className="text-sm text-muted-foreground mb-6 italic">
          {category.description}
        </p>

        {/* Molecule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((t) => (
            <MoleculeCard key={t.id} template={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
