"use client";

import React from "react";
import { motion } from "framer-motion";

const CONCEPTS = [
  {
    label: "d\u2077 Co(II)",
    sub: "15e\u207B metalloradical",
    color: "#2563EB",
    href: "#molecules",
    detail: "Stable open-shell d\u2077 cobalt(II) porphyrins serve as persistent 15-electron radicals",
  },
  {
    label: "Carbene Radicals",
    sub: "Co(III)-\u00B7CR\u2082",
    color: "#7C3AED",
    href: "#mechanism",
    detail: "\u03B1-Metalloalkyl radicals from diazo compound activation",
  },
  {
    label: "Nitrene Radicals",
    sub: "Co(III)-\u00B7NR",
    color: "#DB2777",
    href: "#mechanism",
    detail: "\u03B1-Metalloaminyl radicals from organic azide activation",
  },
  {
    label: "No Oxidant",
    sub: "N\u2082 only byproduct",
    color: "#059669",
    href: "#reactions",
    detail: "Clean radical catalysis \u2014 N\u2082 extrusion is the sole byproduct",
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <svg viewBox="0 0 800 800" className="w-full h-full opacity-[0.03]" fill="none">
          <g transform="translate(400,400)" stroke="#2563EB" strokeWidth="1.5">
            {[0, 90, 180, 270].map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                <path d="M 80,-30 L 120,-20 L 140,10 L 120,40 L 80,30" />
                <line x1="80" y1="30" x2="30" y2="80" />
              </g>
            ))}
            <circle r="50" strokeDasharray="8 4" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Lab identifier */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            X. Peter Zhang Research Group &mdash; Boston College
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 text-gray-900">
            Metalloradical
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              Catalysis
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed">
            A one-electron catalytic paradigm using open-shell Co(II) and Fe(III) porphyrins
            as stable metalloradicals for stereoselective carbene and nitrene transfer reactions.
          </p>

          {/* Clickable concept cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
            {CONCEPTS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="group rounded-xl border-2 bg-white px-4 py-5 text-left transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                style={{ borderColor: item.color + "30" }}
                title={item.detail}
              >
                <div className="text-sm font-bold mb-1" style={{ color: item.color }}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 mb-2">{item.sub}</div>
                <div className="text-[10px] text-gray-400 leading-snug hidden md:block">
                  {item.detail}
                </div>
                <div
                  className="mt-2 text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: item.color }}
                >
                  Explore &rarr;
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center text-gray-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
