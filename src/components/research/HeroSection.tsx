"use client";

import React from "react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background porphyrin ring pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg viewBox="0 0 800 800" className="w-full h-full" fill="none">
          {/* Stylized porphyrin macrocycle */}
          <g transform="translate(400,400)" stroke="currentColor" strokeWidth="1.5" className="text-primary">
            {[0, 90, 180, 270].map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                {/* Pyrrole ring */}
                <path d="M 80,-30 L 120,-20 L 140,10 L 120,40 L 80,30" />
                {/* Methine bridge */}
                <line x1="80" y1="30" x2="30" y2="80" />
              </g>
            ))}
            {/* Central N4 coordination */}
            <circle r="50" strokeDasharray="8 4" />
            <circle r="25" strokeDasharray="4 4" opacity="0.5" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Lab badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            X. Peter Zhang Research Group &mdash; Boston College
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-foreground">Metalloradical</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Catalysis
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            A one-electron catalytic paradigm using open-shell Co(II) and Fe(III) porphyrins
            as stable metalloradicals for stereoselective carbene and nitrene transfer reactions.
          </p>

          {/* Key concepts row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {[
              { label: "d\u2077 Co(II)", sub: "15e\u207B metalloradical", color: "text-blue-400" },
              { label: "Carbene Radicals", sub: "Co(III)-\u00B7CR\u2082", color: "text-purple-400" },
              { label: "Nitrene Radicals", sub: "Co(III)-\u00B7NR", color: "text-pink-400" },
              { label: "No Oxidant", sub: "N\u2082 only byproduct", color: "text-emerald-400" },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="rounded-lg border border-border bg-card/50 backdrop-blur px-3 py-4"
              >
                <div className={`text-sm font-semibold ${item.color}`}>{item.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground/40"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
