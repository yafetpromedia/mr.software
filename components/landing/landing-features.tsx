"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn, LandingContainer, SectionLabel } from "@/components/landing/landing-ui";

const FEATURES = [
  {
    href: "/app/ai/blueprint",
    title: "SaaS Blueprint",
    desc: "Draft startups with AI — review every output before you ship.",
    cta: "Open builder",
  },
  {
    href: "/marketplace",
    title: "Marketplace",
    desc: "Discover templates, SaaS kits, and tools from other builders.",
    cta: "Explore marketplace",
    highlight: true,
  },
  {
    href: "/deploy",
    title: "Deploy",
    desc: "Ship to Mr.Software Cloud or your own VPS and infrastructure.",
    cta: "Deploy project",
  },
  {
    href: "/listings",
    title: "Listings",
    desc: "Publish and monetize your software in the open ecosystem.",
    cta: "Manage listings",
  },
  {
    href: "/projects",
    title: "Projects",
    desc: "Track deployments, versions, and workspace activity.",
    cta: "View projects",
  },
  {
    href: "/app",
    title: "Workspace",
    desc: "Your home for builder tools, billing, and account settings.",
    cta: "Go to workspace",
  },
] as const;

export function LandingFeatures() {
  const reduce = useReducedMotion();

  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-[var(--border)] py-16 sm:py-24"
      aria-labelledby="features-heading"
    >
      <LandingContainer>
        <FadeIn className="mx-auto max-w-2xl text-center sm:text-left">
          <SectionLabel>Explore the platform</SectionLabel>
          <h2
            id="features-heading"
            className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
          >
            Everything builders need in one place
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Build with AI, ship on web and app stores, and grow your listings — without
            leaving the ecosystem.
          </p>
        </FadeIn>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.href}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={f.href}
                className={`feature-card group flex h-full flex-col rounded-xl border p-5 transition sm:p-6 ${
                  "highlight" in f && f.highlight
                    ? "border-[var(--accent)]/40 bg-[var(--accent-muted)] shadow-[var(--shadow-card)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/30"
                }`}
              >
                <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                  {f.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                  {f.cta}
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </LandingContainer>
    </section>
  );
}
