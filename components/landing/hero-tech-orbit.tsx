import type { CSSProperties, ReactNode } from "react";
import { TechBrandLogo } from "@/components/landing/tech-brand-logo";

/**
 * Decorative hero — full-stack ecosystem showcase (motion via CSS).
 */

type TechChip = {
  label: string;
  short: string;
  /** Shorter text on orbit badges when space is tight */
  orbit?: string;
  chipClass: string;
};

export const HERO_TECH_STACK: readonly TechChip[] = [
  {
    label: "JavaScript",
    short: "JS",
    chipClass:
      "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent text-amber-800 dark:text-amber-300",
  },
  {
    label: "TypeScript",
    short: "TS",
    chipClass:
      "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent text-blue-800 dark:text-sky-300 font-mono",
  },
  {
    label: "PHP",
    short: "PHP",
    chipClass:
      "border-indigo-500/35 bg-gradient-to-br from-indigo-500/15 to-transparent text-indigo-900 dark:text-indigo-300",
  },
  {
    label: "SQL",
    short: "SQL",
    chipClass:
      "border-orange-500/35 bg-gradient-to-br from-orange-500/10 to-transparent text-orange-950 dark:text-orange-300 font-mono",
  },
  {
    label: "Spring Boot",
    short: "Spring",
    orbit: "Spring Boot",
    chipClass:
      "border-green-600/35 bg-gradient-to-br from-green-500/15 to-transparent text-green-900 dark:text-green-400",
  },
  {
    label: "React",
    short: "React",
    chipClass:
      "border-cyan-500/35 bg-gradient-to-br from-cyan-500/10 to-transparent text-cyan-900 dark:text-cyan-300",
  },
  {
    label: "Next.js",
    short: "Next",
    chipClass:
      "border-[var(--border)] bg-gradient-to-br from-[var(--foreground)]/8 to-transparent text-[var(--foreground)]",
  },
  {
    label: "Node.js",
    short: "Node",
    chipClass:
      "border-emerald-500/35 bg-gradient-to-br from-emerald-500/12 to-transparent text-emerald-900 dark:text-emerald-300",
  },
  {
    label: "Express",
    short: "Express",
    chipClass:
      "border-zinc-400/35 bg-gradient-to-br from-zinc-500/10 to-transparent text-zinc-800 dark:text-zinc-300",
  },
  {
    label: "MongoDB",
    short: "Mongo",
    chipClass:
      "border-green-600/35 bg-gradient-to-br from-green-600/12 to-transparent text-green-900 dark:text-green-400",
  },
  {
    label: "PostgreSQL",
    short: "Postgres",
    chipClass:
      "border-sky-600/35 bg-gradient-to-br from-sky-600/12 to-transparent text-sky-900 dark:text-sky-300",
  },
  {
    label: "Prisma",
    short: "Prisma",
    chipClass:
      "border-[var(--accent)]/40 bg-gradient-to-br from-[var(--accent-muted)] to-transparent text-[var(--accent)]",
  },
  {
    label: "Postman",
    short: "Postman",
    chipClass:
      "border-orange-500/40 bg-gradient-to-br from-orange-500/12 to-transparent text-orange-700 dark:text-orange-400",
  },
  {
    label: "Supabase",
    short: "Supabase",
    chipClass:
      "border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-transparent text-emerald-900 dark:text-emerald-300",
  },
  {
    label: "Docker",
    short: "Docker",
    chipClass:
      "border-sky-500/40 bg-gradient-to-br from-sky-500/12 to-transparent text-sky-800 dark:text-sky-300",
  },
  {
    label: "Redis",
    short: "Redis",
    chipClass:
      "border-red-500/35 bg-gradient-to-br from-red-500/10 to-transparent text-red-800 dark:text-red-400",
  },
] as const;

const TECH_BY_LABEL = new Map(HERO_TECH_STACK.map((t) => [t.label, t]));

/** Outer ring — languages, frameworks, API & container tooling */
const OUTER_RING = [
  "JavaScript",
  "TypeScript",
  "PHP",
  "SQL",
  "Spring Boot",
  "Next.js",
  "Postman",
  "Docker",
] as const;

/** Inner ring — runtime, data, BaaS & cache */
const INNER_RING = [
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "Prisma",
  "Supabase",
  "Redis",
] as const;

const FLOAT_CLASSES = [
  "hero-tech-float-t1",
  "hero-tech-float-t2",
  "hero-tech-float-t3",
  "hero-tech-float-t4",
  "hero-tech-float-t5",
  "hero-tech-float-t6",
  "hero-tech-float-t7",
  "hero-tech-float-t8",
  "hero-tech-float-t9",
  "hero-tech-float-t10",
  "hero-tech-float-t11",
] as const;

function OrbitBadge({
  children,
  style,
  delayClass,
}: {
  children: ReactNode;
  style: CSSProperties;
  delayClass: string;
}) {
  return (
    <div className="pointer-events-none absolute z-10" style={style}>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 shadow-lg shadow-black/5 ring-1 ring-[var(--foreground)]/[0.04] backdrop-blur-md dark:bg-[var(--surface-elevated)]/92 dark:shadow-black/40 dark:ring-white/[0.06] sm:h-12 sm:w-12 sm:rounded-2xl ${delayClass}`}
      >
        {children}
      </div>
    </div>
  );
}

function polarPosition(
  index: number,
  total: number,
  radiusPct: number,
  phaseOffsetDeg: number,
) {
  const angleDeg = -90 + (360 / total) * index + phaseOffsetDeg;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + radiusPct * Math.cos(rad)}%`,
    top: `${50 + radiusPct * Math.sin(rad)}%`,
    transform: "translate(-50%, -50%)",
  } as CSSProperties;
}

export function HeroTechOrbit() {
  let floatIndex = 0;

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[min(100%,min(460px,92vw))] xl:max-w-[480px]"
      aria-hidden
    >
      <div className="hero-orbit-glow pointer-events-none absolute inset-[4%] rounded-full bg-[var(--accent-muted)] opacity-50 blur-3xl dark:opacity-35" />
      <div className="hero-orbit-dashed pointer-events-none absolute inset-[7%] rounded-full border border-dashed border-[var(--border)] opacity-55" />
      <div className="hero-orbit-dashed hero-orbit-mid pointer-events-none absolute inset-[18%] rounded-full border border-dashed border-[var(--border)] opacity-40" />
      <div className="hero-orbit-dashed hero-orbit-inner pointer-events-none absolute inset-[30%] rounded-full border border-[var(--border)] opacity-30" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="hero-tech-float-delayed relative flex h-[min(9.5rem,36vw)] w-[min(9.5rem,36vw)] items-center justify-center rounded-[1.75rem] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--accent-muted)]/40 shadow-2xl shadow-[var(--accent)]/10 ring-1 ring-[var(--accent)]/20 backdrop-blur-md dark:from-[var(--surface-elevated)] dark:via-[var(--surface-elevated)] dark:to-[var(--accent-muted)]/25 dark:shadow-black/50 sm:h-[9.25rem] sm:w-[9.25rem] sm:rounded-3xl">
          <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--accent-muted),transparent_65%)] opacity-70 dark:opacity-50" />
          <TechBrandLogo
            label="React"
            className="relative z-[1] h-[56%] w-[56%] sm:h-[58%] sm:w-[58%]"
          />
          <span className="absolute bottom-2.5 left-1/2 z-[1] -translate-x-1/2 whitespace-nowrap text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[var(--muted)] sm:bottom-3">
            Your stack
          </span>
        </div>
      </div>

      {OUTER_RING.map((label, i) => {
        const tech = TECH_BY_LABEL.get(label);
        if (!tech) return null;
        const style = polarPosition(i, OUTER_RING.length, 49, 0);
        const delayClass =
          FLOAT_CLASSES[floatIndex++ % FLOAT_CLASSES.length] ?? "hero-tech-float-t1";
        return (
          <OrbitBadge key={label} delayClass={delayClass} style={style}>
            <TechBrandLogo
              label={tech.label}
              className="h-6 w-6 sm:h-7 sm:w-7"
            />
          </OrbitBadge>
        );
      })}

      {INNER_RING.map((label, i) => {
        const tech = TECH_BY_LABEL.get(label);
        if (!tech) return null;
        const phase = 360 / OUTER_RING.length / 2;
        const style = polarPosition(i, INNER_RING.length, 31, phase);
        const delayClass =
          FLOAT_CLASSES[floatIndex++ % FLOAT_CLASSES.length] ?? "hero-tech-float-t1";
        return (
          <OrbitBadge key={label} delayClass={delayClass} style={style}>
            <TechBrandLogo
              label={tech.label}
              className="h-6 w-6 sm:h-7 sm:w-7"
            />
          </OrbitBadge>
        );
      })}
    </div>
  );
}

export function HeroTechStrip() {
  return (
    <div className="mt-8 md:hidden" aria-hidden>
      <p className="mb-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Stack-ready
      </p>
      <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-1 pb-3 pt-1 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-1">
        {HERO_TECH_STACK.map((tech, i) => (
          <div
            key={tech.label}
            className={`snap-center shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-md ring-1 ring-[var(--foreground)]/[0.03] dark:bg-[var(--surface-elevated)] dark:ring-white/[0.05] ${FLOAT_CLASSES[i % FLOAT_CLASSES.length] ?? "hero-tech-float-t1"}`}
          >
            <TechBrandLogo label={tech.label} className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
