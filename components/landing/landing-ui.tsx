"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LandingContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
      {children}
    </p>
  );
}

export function BrowserFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`browser-frame overflow-hidden ${className}`}>
      <div className="browser-frame-bar flex items-center gap-2 px-4 py-3">
        <span className="browser-dot bg-[#ff5f57]" />
        <span className="browser-dot bg-[#febc2e]" />
        <span className="browser-dot bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[0.68rem] text-[var(--muted)]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
