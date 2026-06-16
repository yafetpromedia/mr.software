"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn, LandingContainer, SectionLabel } from "@/components/landing/landing-ui";

const BENTO = [
  {
    id: "flow",
    span: "lg:col-span-2 lg:row-span-2",
    title: "Idea → Build → Deploy",
    desc: "Describe your product. AI suggests structure and UI drafts. You choose beginner guidance or full developer control before anything ships.",
    steps: ["Idea", "Draft", "Review", "Deploy"],
    featured: true,
  },
  {
    id: "control",
    span: "",
    title: "Developer control",
    desc: "Export code, push to GitHub, host on VPS or Mr.Software Cloud — your stack, your rules.",
    icon: "code",
  },
  {
    id: "ecosystem",
    span: "",
    title: "Open ecosystem",
    desc: "Sell templates in the marketplace or self-host. Built for builders, not captive users.",
    icon: "globe",
  },
  {
    id: "assist",
    span: "lg:col-span-2",
    title: "AI assists — you decide",
    desc: "Every suggestion is a draft. Review branding, landing pages, and dashboard sketches before production.",
    icon: "spark",
  },
] as const;

function BentoIcon({ type }: { type: string }) {
  const cls = "h-5 w-5 text-[var(--accent)]";
  if (type === "code")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 6l-2 12" />
      </svg>
    );
  if (type === "globe")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
    );
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    </svg>
  );
}

export function LandingBento() {
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-[var(--border)] bg-[var(--surface-elevated)] py-20 sm:py-24">
      <LandingContainer>
        <FadeIn className="max-w-2xl">
          <SectionLabel>Platform</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            Built for real builders
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            AI assistance without the hype — full ownership of code, hosting, and monetization.
          </p>
        </FadeIn>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
          {BENTO.map((item, i) => (
            <motion.li
              key={item.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className={`bento-cell group ${item.span} ${"featured" in item && item.featured ? "bento-cell-featured" : ""}`}
            >
              {"icon" in item && item.icon ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                  <BentoIcon type={item.icon} />
                </span>
              ) : null}

              <h3 className="mt-4 font-semibold tracking-tight text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.desc}</p>

              {"steps" in item && item.steps ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.steps.map((s, j) => (
                    <span
                      key={s}
                      className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[0.65rem] font-bold text-white">
                        {j + 1}
                      </span>
                      {s}
                      {j < item.steps!.length - 1 ? (
                        <span className="hidden text-[var(--border)] sm:inline">→</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.li>
          ))}
        </ul>

        <FadeIn className="mt-12 flex justify-center" delay={0.15}>
          <Link
            href="/app/builder"
            className="btn-brand btn-brand-shine inline-flex h-11 items-center rounded-lg px-7 text-sm font-semibold"
          >
            Start building →
          </Link>
        </FadeIn>
      </LandingContainer>
    </section>
  );
}
