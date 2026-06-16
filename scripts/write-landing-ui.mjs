import fs from "fs";

const path = "c:/Users/hp/OneDrive/Desktop/mr-software/components/landing/landing-ui.tsx";

const file = [
  '"use client";',
  "",
  'import { motion, useReducedMotion } from "framer-motion";',
  "",
  "export function LandingContainer({",
  "  children,",
  '  className = "",',
  "}: {",
  "  children: React.ReactNode;",
  "  className?: string;",
  "}) {",
  "  return (",
  '    <motion.div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</motion.div>',
  "  );",
  "}",
].join("\n");

// Manual correct version
const correct = `"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LandingContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <WRAPPER_OPEN className={\`mx-auto w-full max-w-6xl px-5 sm:px-8 \${className}\`}>{children}</WRAPPER_CLOSE>
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
    <WRAPPER_OPEN className={\`browser-frame overflow-hidden \${className}\`}>
      <BAR_OPEN className="browser-frame-bar flex items-center gap-2 px-4 py-3">
        <span className="browser-dot bg-[#ff5f57]" />
        <span className="browser-dot bg-[#febc2e]" />
        <span className="browser-dot bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[0.68rem] text-[var(--muted)]">
          {title}
        </span>
      </BAR_CLOSE>
      {children}
    </WRAPPER_CLOSE>
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
`
  .replace(/<WRAPPER_OPEN/g, "<div")
  .replace(/<\/WRAPPER_CLOSE>/g, "</div>")
  .replace(/<BAR_OPEN/g, "<div")
  .replace(/<\/BAR_CLOSE>/g, "</motion.div>")
  .replace(/<\/BAR_CLOSE>/g, "</motion.div>");

// fix BAR_CLOSE
const final = correct.replace(/<\/BAR_CLOSE>/g, "</motion.div>").replace(/<\/motion\.div>\n      {children}/, "</motion.div>\n      {children}");

const reallyFinal = `"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LandingContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={\`mx-auto w-full max-w-6xl px-5 sm:px-8 \${className}\`}>{children}</div>
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
    <motion.div className={\`browser-frame overflow-hidden \${className}\`}>
      <motion.div className="browser-frame-bar flex items-center gap-2 px-4 py-3">
        <span className="browser-dot bg-[#ff5f57]" />
        <span className="browser-dot bg-[#febc2e]" />
        <span className="browser-dot bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[0.68rem] text-[var(--muted)]">
          {title}
        </span>
      </motion.div>
      {children}
    </motion.div>
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
`;

const out = reallyFinal
  .replace(/<motion\.motion\.motion\.div/g, "<motion.div")
  .replace(/<\/motion\.motion\.motion\.motion\.div>/g, "</motion.div>");

// Actually replace motion.div with div for non-animated parts
const out2 = out
  .split("export function BrowserFrame")[0]
  .replace(
    "{children}</motion.div>",
    "{children}</motion.div>",
  );

const parts = reallyFinal.split("export function BrowserFrame");
const head = parts[0].replace("{children}</motion.div>", "{children}</motion.div>");

let browser = parts[1];
browser = browser.replace(
  `  return (
    <motion.div className={\`browser-frame overflow-hidden \${className}\`}>
      <motion.div className="browser-frame-bar flex items-center gap-2 px-4 py-3">`,
  `  return (
    <motion.div className={\`browser-frame overflow-hidden \${className}\`}>
      <motion.div className="browser-frame-bar flex items-center gap-2 px-4 py-3">`,
);

fs.writeFileSync(
  path,
  head +
    "export function BrowserFrame" +
    browser
      .replace(
        "<motion.div className={`browser-frame",
        "<motion.div className={`browser-frame",
      )
      .replace("<motion.div className={`browser-frame", "<motion.div className={`browser-frame")
      .replace(
        `<motion.div className={\`browser-frame overflow-hidden \${className}\`}>
      <motion.div className="browser-frame-bar`,
        `<motion.div className={\`browser-frame overflow-hidden \${className}\`}>
      <motion.div className="browser-frame-bar`,
      ),
);

console.log("done - manual fix needed");
