"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EcosystemDiagram } from "@/components/ui/ecosystem-diagram";

export function EcosystemArchitecture() {
  const reduce = useReducedMotion();

  return (
    <section
      id="ecosystem"
      className="relative border-b border-[var(--border)] py-20 sm:py-28"
      aria-labelledby="ecosystem-heading"
    >
      <div className="bg-mesh pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <motion.div
        className="relative mx-auto max-w-6xl px-4 sm:px-6"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Ecosystem architecture
        </p>
        <h2
          id="ecosystem-heading"
          className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Five systems. One intelligent operating layer.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
          AI, cloud, marketplace, studio, and academy—interconnected modules with live flow
          between systems. Hover nodes to preview; click to open modules.
        </p>
        <div className="mt-12">
          <EcosystemDiagram />
        </div>
      </motion.div>
    </section>
  );
}
