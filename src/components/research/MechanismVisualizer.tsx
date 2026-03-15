"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CATALYTIC_CYCLES,
  getPublicationById,
  getPublicationUrl,
  type CatalyticCycle,
  type CycleStep,
} from "@/lib/research/data";

const STEP_COLORS = ["#2563EB", "#7C3AED", "#DB2777", "#D97706", "#059669"];

function CycleWheel({
  cycle,
  activeStep,
  onStepClick,
}: {
  cycle: CatalyticCycle;
  activeStep: number;
  onStepClick: (i: number) => void;
}) {
  const n = cycle.steps.length;
  const cx = 220;
  const cy = 220;
  const r = 170;

  return (
    <svg viewBox="0 0 440 440" className="w-full max-w-[440px] mx-auto">
      {/* Center */}
      <circle cx={cx} cy={cy} r={45} fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
      <text x={cx} y={cy - 6} textAnchor="middle" className="text-[11px] fill-gray-400">
        Catalytic
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="text-[13px] fill-gray-700 font-bold">
        Cycle
      </text>

      {/* Arrow paths */}
      <defs>
        <marker id="arrowhead-light" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <path d="M0,0 L10,3.5 L0,7" fill="#CBD5E1" />
        </marker>
      </defs>
      {cycle.steps.map((_, i) => {
        const a1 = (i / n) * 2 * Math.PI - Math.PI / 2;
        const a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * 0.72 * Math.cos(a1);
        const y1 = cy + r * 0.72 * Math.sin(a1);
        const x2 = cx + r * 0.72 * Math.cos(a2);
        const y2 = cy + r * 0.72 * Math.sin(a2);
        const mx = cx + r * 0.5 * Math.cos((a1 + a2) / 2);
        const my = cy + r * 0.5 * Math.sin((a1 + a2) / 2);
        return (
          <path
            key={`a-${i}`}
            d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 4"
            markerEnd="url(#arrowhead-light)"
          />
        );
      })}

      {/* Step nodes */}
      {cycle.steps.map((step, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const isActive = i === activeStep;
        const color = STEP_COLORS[i % STEP_COLORS.length];

        return (
          <g key={step.id} onClick={() => onStepClick(i)} className="cursor-pointer">
            {/* Glow for active */}
            {isActive && (
              <circle cx={x} cy={y} r={40} fill={color + "10"} className="animate-pulse" />
            )}
            {/* Node */}
            <circle
              cx={x} cy={y}
              r={isActive ? 34 : 28}
              fill={isActive ? color : "white"}
              stroke={isActive ? color : "#E2E8F0"}
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-all duration-300"
            />
            {/* Step number */}
            <text
              x={x} y={y - 4} textAnchor="middle"
              className={`text-[10px] font-medium ${isActive ? "fill-white" : "fill-gray-400"}`}
            >
              Step {i + 1}
            </text>
            {/* Label */}
            <text
              x={x} y={y + 9} textAnchor="middle"
              className={`text-[8px] font-bold ${isActive ? "fill-white" : "fill-gray-600"}`}
            >
              {step.label.length > 16 ? step.label.slice(0, 14) + "\u2026" : step.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StepDetail({ step, stepIndex }: { step: CycleStep; stepIndex: number }) {
  const color = STEP_COLORS[stepIndex % STEP_COLORS.length];

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {stepIndex + 1}
        </span>
        <h4 className="text-xl font-bold text-gray-900">{step.label}</h4>
      </div>

      {/* Species */}
      <div className="px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 font-mono text-sm text-gray-800">
        {step.species}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {step.description}
      </p>

      {/* Info badges */}
      <div className="flex flex-wrap gap-2">
        {step.electronConfig && (
          <div
            className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: color + "10", color }}
          >
            {step.electronConfig}
          </div>
        )}
        {step.bondEvent && (
          <div className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            {step.bondEvent}
          </div>
        )}
      </div>

      {/* Evidence & Significance */}
      {(step.evidence || step.significance) && (
        <div className="grid grid-cols-1 gap-3 mt-1">
          {step.evidence && (
            <div className="px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Evidence</div>
              <p className="text-xs text-blue-800 leading-relaxed">{step.evidence}</p>
            </div>
          )}
          {step.significance && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Significance</div>
              <p className="text-xs text-emerald-800 leading-relaxed">{step.significance}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function MechanismVisualizer() {
  const [activeCycleId, setActiveCycleId] = useState(CATALYTIC_CYCLES[0].id);
  const [activeStep, setActiveStep] = useState(0);

  const cycle = CATALYTIC_CYCLES.find((c) => c.id === activeCycleId)!;
  const relatedPubs = cycle.publicationIds.map(getPublicationById).filter(Boolean);

  const handleCycleChange = (id: string) => { setActiveCycleId(id); setActiveStep(0); };

  return (
    <section id="mechanism" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">
            Mechanistic Detail
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Catalytic Cycles
          </h2>
          <p className="text-gray-500 max-w-2xl text-base">
            Interactive catalytic cycles showing the stepwise radical mechanism.
            Click each step for electron configuration details and mechanistic description.
          </p>
        </motion.div>

        {/* Cycle selector */}
        <div className="flex gap-3 mb-10">
          {CATALYTIC_CYCLES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCycleChange(c.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeCycleId === c.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Cycle wheel + detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <CycleWheel cycle={cycle} activeStep={activeStep} onStepClick={setActiveStep} />
            <p className="text-center text-xs text-gray-400 mt-4 italic max-w-sm mx-auto">
              {cycle.description}
            </p>
          </div>

          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <StepDetail key={cycle.steps[activeStep].id} step={cycle.steps[activeStep]} stepIndex={activeStep} />
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveStep((s) => (s > 0 ? s - 1 : cycle.steps.length - 1))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                &larr; Previous
              </button>
              <button
                onClick={() => setActiveStep((s) => (s < cycle.steps.length - 1 ? s + 1 : 0))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Next &rarr;
              </button>
            </div>

            {/* Papers */}
            {relatedPubs.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Key Publications
                </h4>
                <div className="space-y-2.5">
                  {relatedPubs.map((p) => p && (
                    <a
                      key={p.id}
                      href={getPublicationUrl(p.doi)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-gray-50/50"
                    >
                      <div className="text-xs font-semibold text-gray-800 leading-snug">{p.title}</div>
                      <div className="text-[10px] text-gray-400 mt-1.5">
                        {p.authors} &mdash; <span className="italic">{p.journal}</span> {p.year}
                        {p.landmark && <span className="ml-1 text-amber-500 font-bold">&#9733; Landmark</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
