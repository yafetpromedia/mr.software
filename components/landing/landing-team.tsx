"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { PublicTeamMember, PublicTeamSectionSettings } from "@/lib/team-types";
import { FadeIn, LandingContainer, SectionLabel } from "@/components/landing/landing-ui";

function memberMonogram(member: PublicTeamMember): string {
  if (member.monogram?.trim()) return member.monogram.trim().slice(0, 3);
  return member.name.charAt(0).toUpperCase();
}

function kindLabel(kind: PublicTeamMember["kind"]): string | null {
  if (kind === "HUMAN") return null;
  if (kind === "AI_CAPABILITY") return "AI capability";
  return "Ecosystem";
}

function TeamAvatar({ member }: { member: PublicTeamMember }) {
  const label = kindLabel(member.kind);

  if (member.avatarUrl) {
    return (
      <div className="team-avatar team-avatar--photo">
        <Image
          src={member.avatarUrl}
          alt=""
          width={72}
          height={72}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`team-avatar team-avatar--${member.kind.toLowerCase().replace("_", "-")}`}
      aria-hidden
    >
      <span>{memberMonogram(member)}</span>
      {label ? <span className="team-avatar__badge">{label}</span> : null}
    </div>
  );
}

function TeamCard({ member, index }: { member: PublicTeamMember; index: number }) {
  const reduce = useReducedMotion();
  const badge = kindLabel(member.kind);

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={`team-card team-card--${member.kind.toLowerCase().replace("_", "-")}`}
    >
      <div className="team-card__glow" aria-hidden />
      <div className="team-card__inner">
        <TeamAvatar member={member} />
        <div className="team-card__divider" aria-hidden />
        <div className="team-card__body">
          {badge ? <p className="team-card__eyebrow">{badge}</p> : null}
          <h3 className={`team-card__name ${badge ? "" : "mt-0"}`}>{member.name}</h3>
          <p className="team-card__role">{member.role}</p>
          <div className="team-card__divider team-card__divider--thin" aria-hidden />
          <p className="team-card__bio">{member.bio}</p>
        </div>
      </div>
    </motion.li>
  );
}

export function LandingTeam({
  settings,
  members,
}: {
  settings: PublicTeamSectionSettings;
  members: PublicTeamMember[];
}) {
  return (
    <section
      id="team"
      className="team-section scroll-mt-20 border-t border-[var(--border)] py-16 sm:py-24"
      aria-labelledby="team-heading"
    >
      <div className="team-section__backdrop" aria-hidden />
      <LandingContainer className="relative">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <SectionLabel>{settings.eyebrow}</SectionLabel>
          <p className="team-section__tagline mt-4">{settings.tagline}</p>
          <h2
            id="team-heading"
            className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
          >
            {settings.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {settings.intro}
          </p>
        </FadeIn>

        <ul className="team-grid mt-12 lg:mt-14">
          {members.map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} />
          ))}
        </ul>
      </LandingContainer>
    </section>
  );
}
