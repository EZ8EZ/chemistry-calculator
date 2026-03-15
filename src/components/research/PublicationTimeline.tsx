"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PUBLICATIONS,
  THEME_LABELS,
  THEME_COLORS,
  getPublicationUrl,
  type Publication,
  type ResearchTheme,
} from "@/lib/research/data";

function TimelineDot({ pub, isActive, onClick }: { pub: Publication; isActive: boolean; onClick: () => void }) {
  const mainTheme = pub.themes[0];
  const color = THEME_COLORS[mainTheme] ?? "#6366F1";

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center"
      title={pub.title}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 transition-all ${
          isActive ? "scale-125" : "group-hover:scale-110"
        } ${pub.landmark ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
        style={{
          backgroundColor: isActive ? color : "transparent",
          borderColor: color,
          ...(pub.landmark ? { ringColor: color } : {}),
        }}
      />
    </button>
  );
}

function PubCard({ pub }: { pub: Publication }) {
  const mainTheme = pub.themes[0];
  const color = THEME_COLORS[mainTheme] ?? "#6366F1";

  return (
    <motion.div
      key={pub.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 space-y-4"
    >
      {/* Year + journal */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-foreground">{pub.year}</span>
        <span className="text-sm text-muted-foreground italic">{pub.journal}</span>
        {pub.landmark && (
          <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            Landmark
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground leading-snug">
        {pub.title}
      </h3>

      {/* Authors */}
      <p className="text-xs text-muted-foreground">{pub.authors}</p>

      {/* Highlight */}
      <p className="text-sm text-muted-foreground leading-relaxed border-l-2 pl-4" style={{ borderColor: color }}>
        {pub.highlight}
      </p>

      {/* Themes */}
      <div className="flex flex-wrap gap-1.5">
        {pub.themes.map((theme) => (
          <span
            key={theme}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: THEME_COLORS[theme] + "15",
              color: THEME_COLORS[theme],
            }}
          >
            {THEME_LABELS[theme]}
          </span>
        ))}
      </div>

      {/* DOI link */}
      <a
        href={getPublicationUrl(pub.doi)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
        </svg>
        Read paper (DOI: {pub.doi})
      </a>
    </motion.div>
  );
}

export function PublicationTimeline() {
  const [selectedPub, setSelectedPub] = useState<string>(
    PUBLICATIONS.find((p) => p.landmark)?.id ?? PUBLICATIONS[0].id
  );
  const [themeFilter, setThemeFilter] = useState<ResearchTheme | null>(null);

  // Sort by year
  const sorted = [...PUBLICATIONS].sort((a, b) => a.year - b.year);
  const filtered = themeFilter
    ? sorted.filter((p) => p.themes.includes(themeFilter))
    : sorted;

  const activePub = PUBLICATIONS.find((p) => p.id === selectedPub) ?? filtered[0];

  // Unique themes present
  const allThemes = Array.from(
    new Set(PUBLICATIONS.flatMap((p) => p.themes))
  ).sort();

  return (
    <section id="publications" className="py-24 px-6 bg-card/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Publication Timeline
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Key publications tracing the development of metalloradical catalysis
            from concept to broad synthetic utility. Click any dot to explore.
          </p>
        </motion.div>

        {/* Theme filter */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          <button
            onClick={() => setThemeFilter(null)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
              themeFilter === null
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {allThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => setThemeFilter(theme)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                themeFilter === theme
                  ? "text-white"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
              style={
                themeFilter === theme
                  ? { backgroundColor: THEME_COLORS[theme] }
                  : undefined
              }
            >
              {THEME_LABELS[theme]}
            </button>
          ))}
        </div>

        {/* Timeline strip */}
        <div className="relative mb-10">
          {/* Horizontal line */}
          <div className="absolute top-2 left-0 right-0 h-px bg-border" />

          {/* Year labels + dots */}
          <div className="flex items-start justify-between overflow-x-auto pb-4 gap-3">
            {filtered.map((pub) => (
              <div key={pub.id} className="flex flex-col items-center min-w-[40px]">
                <TimelineDot
                  pub={pub}
                  isActive={pub.id === selectedPub}
                  onClick={() => setSelectedPub(pub.id)}
                />
                <span className="text-[9px] text-muted-foreground mt-2 whitespace-nowrap">
                  {pub.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected publication detail */}
        {activePub && <PubCard pub={activePub} />}

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { label: "Publications", value: PUBLICATIONS.length.toString() },
            { label: "Landmark Papers", value: PUBLICATIONS.filter((p) => p.landmark).length.toString() },
            { label: "Year Span", value: `${Math.min(...PUBLICATIONS.map((p) => p.year))}\u2013${Math.max(...PUBLICATIONS.map((p) => p.year))}` },
            { label: "Research Themes", value: allThemes.length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg border border-border bg-card/50">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
