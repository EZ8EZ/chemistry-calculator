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

// Slightly darker colors for light theme legibility
const LIGHT_THEME_COLORS: Record<ResearchTheme, string> = {
  "metalloradical-catalysis": "#2563EB",
  "carbene-transfer": "#7C3AED",
  "nitrene-transfer": "#DB2777",
  "cyclopropanation": "#D97706",
  "aziridination": "#059669",
  "c-h-amination": "#DC2626",
  "c-h-alkylation": "#EA580C",
  "porphyrin-design": "#0891B2",
  "mechanism": "#4F46E5",
  "olefination": "#65A30D",
  "iron-catalysis": "#C026D3",
};

function PubCard({ pub }: { pub: Publication }) {
  const color = LIGHT_THEME_COLORS[pub.themes[0]] ?? "#4F46E5";

  return (
    <motion.div
      key={pub.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-8 space-y-5 shadow-sm"
    >
      {/* Year + journal */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-3xl font-extrabold text-gray-900">{pub.year}</span>
        <span className="text-sm text-gray-400 italic">{pub.journal}</span>
        {pub.landmark && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
            Landmark
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 leading-snug">{pub.title}</h3>
      <p className="text-xs text-gray-500">{pub.authors}</p>

      <p className="text-sm text-gray-600 leading-relaxed border-l-[3px] pl-4" style={{ borderColor: color }}>
        {pub.highlight}
      </p>

      {/* Theme tags */}
      <div className="flex flex-wrap gap-1.5">
        {pub.themes.map((theme) => {
          const c = LIGHT_THEME_COLORS[theme] ?? "#4F46E5";
          return (
            <span
              key={theme}
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: c + "10", color: c, border: `1px solid ${c}25` }}
            >
              {THEME_LABELS[theme]}
            </span>
          );
        })}
      </div>

      <a
        href={getPublicationUrl(pub.doi)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
        </svg>
        Read paper &mdash; DOI: {pub.doi}
      </a>
    </motion.div>
  );
}

export function PublicationTimeline() {
  const [selectedPub, setSelectedPub] = useState<string>(
    PUBLICATIONS.find((p) => p.landmark)?.id ?? PUBLICATIONS[0].id
  );
  const [themeFilter, setThemeFilter] = useState<ResearchTheme | null>(null);

  const sorted = [...PUBLICATIONS].sort((a, b) => a.year - b.year);
  const filtered = themeFilter ? sorted.filter((p) => p.themes.includes(themeFilter)) : sorted;
  const activePub = PUBLICATIONS.find((p) => p.id === selectedPub) ?? filtered[0];

  const allThemes = Array.from(new Set(PUBLICATIONS.flatMap((p) => p.themes))).sort();

  return (
    <section id="publications" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Research Output</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Publication Timeline</h2>
          <p className="text-gray-500 max-w-2xl text-base">
            Key publications tracing the development of metalloradical catalysis.
            Click any point on the timeline to explore.
          </p>
        </motion.div>

        {/* Theme filter */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          <button
            onClick={() => setThemeFilter(null)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
              themeFilter === null ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            All
          </button>
          {allThemes.map((theme) => {
            const c = LIGHT_THEME_COLORS[theme] ?? "#4F46E5";
            return (
              <button
                key={theme}
                onClick={() => setThemeFilter(theme)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  themeFilter === theme ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
                }`}
                style={themeFilter === theme ? { backgroundColor: c } : undefined}
              >
                {THEME_LABELS[theme]}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative mb-10 py-2">
          <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-gray-200 rounded-full" />
          <div className="flex items-start justify-between overflow-x-auto pb-6 gap-2">
            {filtered.map((pub) => {
              const c = LIGHT_THEME_COLORS[pub.themes[0]] ?? "#4F46E5";
              const isActive = pub.id === selectedPub;
              return (
                <button
                  key={pub.id}
                  onClick={() => setSelectedPub(pub.id)}
                  className="flex flex-col items-center min-w-[44px] group"
                  title={pub.title}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-[2.5px] transition-all ${
                      isActive ? "scale-150 shadow-md" : "group-hover:scale-125"
                    } ${pub.landmark ? "ring-2 ring-offset-2" : ""}`}
                    style={{
                      backgroundColor: isActive ? c : "white",
                      borderColor: c,
                      ...(pub.landmark ? { ringColor: c + "40" } : {}),
                    }}
                  />
                  <span className={`text-[9px] mt-3 whitespace-nowrap transition-colors ${
                    isActive ? "text-gray-900 font-bold" : "text-gray-400"
                  }`}>
                    {pub.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activePub && <PubCard pub={activePub} />}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { label: "Selected Publications", value: PUBLICATIONS.length.toString() },
            { label: "Landmark Papers", value: PUBLICATIONS.filter((p) => p.landmark).length.toString() },
            { label: "Year Span", value: `${Math.min(...PUBLICATIONS.map((p) => p.year))}\u2013${Math.max(...PUBLICATIONS.map((p) => p.year))}` },
            { label: "Research Themes", value: allThemes.length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-5 rounded-xl border border-gray-100 bg-gray-50/80">
              <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
