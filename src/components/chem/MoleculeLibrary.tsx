"use client";

import React, { useState, useMemo } from "react";
import { useValenceStore } from "@/lib/ui/store";
import {
  TEMPLATE_COLLECTIONS,
  searchTemplates,
  MoleculeTemplate,
  TemplateCollection,
} from "@/lib/chem/templates";
import { searchMoleculesByName } from "@/lib/identifiers/names";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/button";

export function MoleculeLibrary() {
  const { showLibrary, toggleLibrary, loadFromSMILES } = useValenceStore();
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (search.length < 2) return null;
    const templates = searchTemplates(search);
    const names = searchMoleculesByName(search);
    return { templates, names };
  }, [search]);

  const activeCollection = selectedCollection
    ? TEMPLATE_COLLECTIONS.find((c) => c.id === selectedCollection)
    : null;

  if (!showLibrary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-[900px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Molecule Library</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse pre-built molecules or search by name
            </p>
          </div>
          <button
            className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={toggleLibrary}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.length >= 2) setSelectedCollection(null);
            }}
            placeholder="Search molecules by name, structure, or tag..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Search results */}
          {searchResults ? (
            <div className="flex-1 overflow-y-auto p-4">
              <SearchResults
                results={searchResults}
                onSelect={(smiles, name) => loadFromSMILES(smiles, name)}
                expandedTemplate={expandedTemplate}
                setExpandedTemplate={setExpandedTemplate}
              />
            </div>
          ) : (
            <>
              {/* Collection sidebar */}
              <div className="w-56 border-r border-border overflow-y-auto shrink-0 p-3 space-y-1">
                {TEMPLATE_COLLECTIONS.map((collection) => (
                  <button
                    key={collection.id}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all",
                      selectedCollection === collection.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-accent border border-transparent"
                    )}
                    onClick={() => setSelectedCollection(collection.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{collection.icon}</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-xs">
                          {collection.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {collection.templates.length} molecules
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Collection content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeCollection ? (
                  <CollectionView
                    collection={activeCollection}
                    onSelect={(smiles, name) => loadFromSMILES(smiles, name)}
                    expandedTemplate={expandedTemplate}
                    setExpandedTemplate={setExpandedTemplate}
                  />
                ) : (
                  <WelcomeView
                    onSelect={(smiles, name) => loadFromSMILES(smiles, name)}
                    onSelectCollection={setSelectedCollection}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeView({
  onSelect,
  onSelectCollection,
}: {
  onSelect: (smiles: string, name: string) => void;
  onSelectCollection: (id: string) => void;
}) {
  const quickStarts: MoleculeTemplate[] = [
    { id: "qs-benzene", name: "Benzene", smiles: "c1ccccc1", description: "Aromatic ring", category: "basic-organic", tags: [], difficulty: "beginner" },
    { id: "qs-ethanol", name: "Ethanol", smiles: "CCO", description: "Simple alcohol", category: "functional-groups", tags: [], difficulty: "beginner" },
    { id: "qs-aspirin", name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O", description: "Anti-inflammatory drug", category: "pharmaceuticals", tags: [], difficulty: "intermediate" },
    { id: "qs-caffeine", name: "Caffeine", smiles: "Cn1c(=O)c2c(ncn2C)n(C)c1=O", description: "Purine stimulant", category: "pharmaceuticals", tags: [], difficulty: "advanced" },
    { id: "qs-adenine", name: "Adenine", smiles: "Nc1ncnc2[nH]cnc12", description: "DNA nucleobase", category: "nucleobases", tags: [], difficulty: "intermediate" },
    { id: "qs-glycine", name: "Glycine", smiles: "NCC(=O)O", description: "Simplest amino acid", category: "amino-acids", tags: [], difficulty: "beginner" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick start */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Quick Start</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Click any molecule to load it instantly. You can then modify it freely.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {quickStarts.map((t) => (
            <button
              key={t.id}
              className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group"
              onClick={() => onSelect(t.smiles, t.name)}
            >
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {t.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t.description}
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/60 mt-1 truncate">
                {t.smiles}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Collection previews */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Collections</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_COLLECTIONS.map((c) => (
            <button
              key={c.id}
              className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-all"
              onClick={() => onSelectCollection(c.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{c.icon}</span>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">
                {c.description}
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-1">
                {c.templates.length} molecules
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollectionView({
  collection,
  onSelect,
  expandedTemplate,
  setExpandedTemplate,
}: {
  collection: TemplateCollection;
  onSelect: (smiles: string, name: string) => void;
  expandedTemplate: string | null;
  setExpandedTemplate: (id: string | null) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{collection.icon}</span>
          <h3 className="text-sm font-semibold">{collection.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{collection.description}</p>
      </div>

      <div className="space-y-2">
        {collection.templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            expanded={expandedTemplate === template.id}
            onToggle={() =>
              setExpandedTemplate(
                expandedTemplate === template.id ? null : template.id
              )
            }
            onLoad={() => onSelect(template.smiles, template.name)}
          />
        ))}
      </div>
    </div>
  );
}

function SearchResults({
  results,
  onSelect,
  expandedTemplate,
  setExpandedTemplate,
}: {
  results: {
    templates: MoleculeTemplate[];
    names: { smiles: string; name: string; category: string }[];
  };
  onSelect: (smiles: string, name: string) => void;
  expandedTemplate: string | null;
  setExpandedTemplate: (id: string | null) => void;
}) {
  const total = results.templates.length + results.names.length;

  if (total === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No molecules found. Try a different search term.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {total} result{total !== 1 ? "s" : ""}
      </p>

      {/* Template results */}
      {results.templates.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            From Library
          </h4>
          <div className="space-y-2">
            {results.templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                expanded={expandedTemplate === t.id}
                onToggle={() =>
                  setExpandedTemplate(expandedTemplate === t.id ? null : t.id)
                }
                onLoad={() => onSelect(t.smiles, t.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Name database results */}
      {results.names.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Name Matches
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {results.names
              .filter(
                (n) =>
                  !results.templates.some(
                    (t) => t.name.toLowerCase() === n.name.toLowerCase()
                  )
              )
              .map((entry) => (
                <button
                  key={entry.smiles}
                  className="text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-xs"
                  onClick={() => onSelect(entry.smiles, entry.name)}
                >
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-muted-foreground ml-2 font-mono text-[10px]">
                    {entry.smiles.length > 30
                      ? entry.smiles.slice(0, 30) + "..."
                      : entry.smiles}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  expanded,
  onToggle,
  onLoad,
}: {
  template: MoleculeTemplate;
  expanded: boolean;
  onToggle: () => void;
  onLoad: () => void;
}) {
  const difficultyColors = {
    beginner: "success" as const,
    intermediate: "warning" as const,
    advanced: "purple" as const,
  };

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        expanded
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-primary/20"
      )}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{template.name}</p>
              <Badge variant={difficultyColors[template.difficulty]} className="text-[8px] px-1 py-0">
                {template.difficulty}
              </Badge>
              {template.collection === "zhang-lab" && (
                <Badge variant="purple" className="text-[8px] px-1 py-0">
                  Zhang Lab
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
              {template.description}
            </p>
          </div>
        </div>
        <button
          className="shrink-0 ml-2 h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onLoad();
          }}
        >
          Load
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 animate-fade-in border-t border-border/50 pt-2">
          {template.context && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {template.context}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">SMILES:</span>
            <code className="text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded break-all select-all">
              {template.smiles}
            </code>
          </div>
          {template.source && (
            <p className="text-[10px] text-muted-foreground italic">
              Source: {template.source}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] text-muted-foreground bg-muted rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
