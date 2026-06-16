"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FadeIn, LandingContainer, SectionLabel } from "@/components/landing/landing-ui";

const TEAM = [
  {
    name: "Yafet",
    role: "Founder & product",
    bio: "Building Mr.Software as an open platform for AI-assisted startups and developer ownership.",
  },
  {
    name: "Platform team",
    role: "Engineering",
    bio: "Auth, deployments, marketplace, and the builder experience — shipped with care.",
  },
  {
    name: "Creator network",
    role: "Ecosystem",
    bio: "Developers publishing templates, blueprints, and tools in the marketplace.",
  },
] as const;

export function LandingTeam() {
  const reduce = useReducedMotion();

  return (
    <section
      id="team"
      className="scroll-mt-20 border-t border-[var(--border)] py-16 sm:py-24"
      aria-labelledby="team-heading"
    >
      <LandingContainer>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <SectionLabel>Team</SectionLabel>
          <h2
            id="team-heading"
            className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Built by builders, for builders
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)] sm:text-base">
            A small team focused on developer trust, open deployment, and a real product economy.
          </p>
        </FadeIn>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member, i) => (
            <motion.li
              key={member.name}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.08 }}
              className="team-card rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center sm:text-left"
            >
              <motion.div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-muted)] font-display text-lg font-bold text-[var(--accent)] sm:mx-0"
                aria-hidden
              >
                {member.name.charAt(0)}
              </motion.div>
              <h3 className="mt-4 font-semibold text-[var(--foreground)]">{member.name}</h3>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                {member.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{member.bio}</p>
            </motion.li>
          ))}
        </ul>
      </LandingContainer>
    </section>
  );
}
