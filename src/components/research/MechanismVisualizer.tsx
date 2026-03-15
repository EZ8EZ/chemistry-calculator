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
  const cx = 200;
  const cy = 200;
  const r = 150;

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-[400px] mx-auto">
      {/* Central label */}
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-muted-foreground text-[11px]">
        Catalytic
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="fill-foreground text-[13px] font-semibold">
        Cycle
      </text>

      {/* Connecting arrows */}
      {cycle.steps.map((_, i) => {
        const angle1 = (i / n) * 2 * Math.PI - Math.PI / 2;
        const angle2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * 0.75 * Math.cos(angle1);
        const y1 = cy + r * 0.75 * Math.sin(angle1);
        const x2 = cx + r * 0.75 * Math.cos(angle2);
        const y2 = cy + r * 0.75 * Math.sin(angle2);
        const midX = cx + r * 0.55 * Math.cos((angle1 + angle2) / 2);
        const midY = cy + r * 0.55 * Math.sin((angle1 + angle2) / 2);
        return (
          <path
            key={`arrow-${i}`}
            d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity={0.3}
            markerEnd="url(#arrowhead)"
          />
        );
      })}

      {/* Arrowhead marker */}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        </marker>
      </defs>

      {/* Step nodes */}
      {cycle.steps.map((step, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const isActive = i === activeStep;

        return (
          <g
            key={step.id}
            onClick={() => onStepClick(i)}
            className="cursor-pointer"
          >
            {/* Node circle */}
            <circle
              cx={x}
              cy={y}
              r={isActive ? 32 : 26}
              fill={isActive ? "hsl(var(--primary))" : "hsl(var(--card))"}
              stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={isActive ? 2 : 1.5}
              className="transition-all duration-300"
            />
            {/* Step number */}
            <text
              x={x}
              y={y - 4}
              textAnchor="middle"
              className={`text-[10px] ${isActive ? "fill-primary-foreground" : "fill-muted-foreground"}`}
            >
              Step {i + 1}
            </text>
            {/* Step label */}
            <text
              x={x}
              y={y + 8}
              textAnchor="middle"
              className={`text-[8px] font-medium ${isActive ? "fill-primary-foreground" : "fill-foreground"}`}
            >
              {step.label.length > 14 ? step.label.slice(0, 12) + "\u2026" : step.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StepDetail({ step, stepIndex }: { step: CycleStep; stepIndex: number }) {
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-baseline gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {stepIndex + 1}
        </span>
        <h4 className="text-lg font-semibold text-foreground">{step.label}</h4>
      </div>

      {/* Species */}
      <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border font-mono text-sm text-foreground">
        {step.species}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>

      {/* Electron configuration */}
      {step.electronConfig && (
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">
            {step.electronConfig}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function MechanismVisualizer() {
  const [activeCycleId, setActiveCycleId] = useState(CATALYTIC_CYCLES[0].id);
  const [activeStep, setActiveStep] = useState(0);

  const cycle = CATALYTIC_CYCLES.find((c) => c.id === activeCycleId)!;

  const handleCycleChange = (id: string) => {
    setActiveCycleId(id);
    setActiveStep(0);
  };

  const relatedPubs = cycle.publicationIds
    .map(getPublicationById)
    .filter(Boolean);

  return (
    <section id="mechanism" className="py-24 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Catalytic Mechanisms
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Interactive catalytic cycles showing the stepwise radical mechanism
            at the heart of metalloradical catalysis. Click each step for detail.
          </p>
        </motion.div>

        {/* Cycle selector */}
        <div className="flex gap-3 mb-10">
          {CATALYTIC_CYCLES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCycleChange(c.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeCycleId === c.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Main content: cycle wheel + detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Cycle wheel */}
          <div>
            <CycleWheel
              cycle={cycle}
              activeStep={activeStep}
              onStepClick={setActiveStep}
            />
            <p className="text-center text-xs text-muted-foreground mt-4 italic">
              {cycle.description}
            </p>
          </div>

          {/* Step detail + papers */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <StepDetail
                key={cycle.steps[activeStep].id}
                step={cycle.steps[activeStep]}
                stepIndex={activeStep}
              />
            </AnimatePresence>

            {/* Step navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveStep((s) => (s > 0 ? s - 1 : cycle.steps.length - 1))}
                className="px-3 py-1.5 rounded border border-border text-sm hover:bg-accent"
              >
                &larr; Previous
              </button>
              <button
                onClick={() => setActiveStep((s) => (s < cycle.steps.length - 1 ? s + 1 : 0))}
                className="px-3 py-1.5 rounded border border-border text-sm hover:bg-accent"
              >
                Next &rarr;
              </button>
            </div>

            {/* Related publications */}
            {relatedPubs.length > 0 && (
              <div className="border-t border-border pt-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Key Publications for This Mechanism
                </h4>
                <div className="space-y-2">
                  {relatedPubs.map((p) => p && (
                    <a
                      key={p.id}
                      href={getPublicationUrl(p.doi)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
                    >
                      <div className="text-xs font-medium text-foreground leading-snug">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {p.authors} &mdash; <span className="italic">{p.journal}</span> {p.year}
                        {p.landmark && <span className="ml-1 text-amber-400">&#9733; Landmark</span>}
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
