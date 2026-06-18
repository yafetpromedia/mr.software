import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Layers,
  Rocket,
  Sparkles,
} from "lucide-react";

const MODULES = [
  {
    href: "/app/ai/startup-advisor",
    title: "Startup Advisor",
    description:
      "Validate ideas, define target users, pricing, and monetization with a full SaaS blueprint.",
    icon: Sparkles,
    status: "live" as const,
  },
  {
    href: "/app/ai/architect",
    title: "Software Architect",
    description:
      "Plan frontend, backend, database, modules, and API structure for your product.",
    icon: Layers,
    status: "live" as const,
  },
  {
    href: "/app/ai/blueprint",
    title: "SaaS Blueprint Generator",
    description:
      "Generate landing drafts, pricing, and dashboard previews — save directly to your workspace.",
    icon: Boxes,
    status: "live" as const,
  },
  {
    href: "/app/ai/deployment",
    title: "Deployment Advisor",
    description:
      "Get staging, production, and hosting recommendations aligned with Mr.Software deploy.",
    icon: Rocket,
    status: "live" as const,
  },
] as const;

export function MrSoftwareAiHub() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Mr.Software AI
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          AI-assisted workflows for software businesses
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Design, build, deploy, and monetize with guided AI modules. Models run behind the scenes —
          you interact with Mr.Software AI only.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-muted)]/20"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                <mod.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-400">
                {mod.status}
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold text-[var(--foreground)]">{mod.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
              {mod.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
              Open module
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
