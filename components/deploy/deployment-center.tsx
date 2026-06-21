"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  Package,
  Sparkles,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { DeployGithubPanel } from "@/components/deploy/deploy-github-panel";
import { DeployUploadForm } from "@/components/app/deploy-upload-form";
import { DeploymentCard } from "@/components/app/deployment-card";
import type { Deployment } from "@prisma/client";

export type DeploySource = "zip" | "github" | "import" | "ai";

type SoftwareOption = { id: string; name: string };

type RecentDeployment = Pick<
  Deployment,
  "id" | "name" | "status" | "url" | "createdAt" | "errorMessage"
>;

type Props = {
  freeBlocked: boolean;
  planLabel: string;
  usedSlots: number;
  maxSlots: number | null;
  recentDeployments: RecentDeployment[];
  softwareListings: SoftwareOption[];
};

const METHODS = [
  {
    id: "github" as const,
    title: "Deploy from GitHub",
    description: "Connect a repo — pick a branch — get a live URL in minutes.",
    icon: GithubIcon,
    status: "live" as const,
    audience: "Developers",
    recommended: true,
  },
  {
    id: "zip" as const,
    title: "Upload ZIP",
    description: "Drag a build folder. No GitHub required — schools, NGOs, agencies.",
    icon: CloudUpload,
    status: "live" as const,
    audience: "Everyone",
    recommended: false,
  },
  {
    id: "import" as const,
    title: "Import existing app",
    description: "Link a marketplace listing and host its static build on Mr.Software.",
    icon: Package,
    status: "live" as const,
    audience: "Sellers",
    recommended: false,
  },
  {
    id: "ai" as const,
    title: "AI generated app",
    description: "Startup Factory → generate → deploy in one flow.",
    icon: Sparkles,
    status: "live" as const,
    audience: "Founders",
    recommended: false,
  },
] as const;

const PIPELINE = [
  { label: "Build", done: true },
  { label: "Deploy", done: true },
  { label: "Sell", done: true },
  { label: "Get paid", done: true },
] as const;

function StatusBadge({ status }: { status: "live" | "soon" }) {
  if (status === "live") {
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        Live
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
      Soon
    </span>
  );
}

function WorkflowSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          {i > 0 ? <ArrowRight className="h-3 w-3 shrink-0 opacity-40" aria-hidden /> : null}
          <span className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 font-mono text-[0.65rem] text-[var(--foreground)]">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function DeploymentCenter({
  freeBlocked,
  planLabel,
  usedSlots,
  maxSlots,
  recentDeployments,
  softwareListings,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [source, setSource] = useState<DeploySource>("github");
  const [importSoftwareId, setImportSoftwareId] = useState<string>("");

  const syncSource = useCallback(() => {
    const listingId = searchParams.get("listing") ?? searchParams.get("softwareId");
    const param = searchParams.get("source");
    if (listingId) {
      setImportSoftwareId(listingId);
      setSource("import");
      return;
    }
    if (param === "github" || param === "zip" || param === "import" || param === "ai") {
      setSource(param);
      return;
    }
    setSource("github");
  }, [searchParams]);

  useEffect(() => {
    syncSource();
  }, [syncSource]);

  function selectSource(next: DeploySource) {
    setSource(next);
    const url = new URL(window.location.href);
    url.searchParams.set("source", next);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  const importName =
    softwareListings.find((s) => s.id === importSoftwareId)?.name ?? "";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--accent)]/10 blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Deployment Center
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Build, deploy, host, sell — from one dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Connect GitHub, select a repository, and get a live URL — the fastest path for
            developers. ZIP upload and Startup Factory are also available.
          </p>
          <div className="mt-3">
            <WorkflowSteps steps={["Connect GitHub", "Select repo", "Deploy", "Live URL"]} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-[var(--muted)] opacity-40" aria-hidden>
                    →
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                  {step.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                  ) : null}
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-[var(--muted)]">
              Plan: <span className="font-semibold text-[var(--foreground)]">{planLabel}</span>
            </span>
            <span className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-[var(--muted)]">
              Deployments:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {usedSlots}
                {maxSlots !== null ? ` / ${maxSlots}` : ""}
              </span>
            </span>
          </div>
        </div>
      </header>

      {freeBlocked ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium text-[var(--foreground)]">Free plan limit reached</p>
          <p className="mt-1 text-[var(--muted)]">
            You already have an active or processing deployment. Upgrade to Pro for more apps, custom
            domains, and team seats.
          </p>
          <Link
            href="/payouts"
            className="mt-3 inline-flex items-center gap-1 font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            View plans
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Create project
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {METHODS.map((method) => {
              const Icon = method.icon;
              const active = source === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => selectSource(method.id)}
                  className={`group flex w-full flex-col rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-[var(--accent)]/40 bg-[var(--accent-muted)]/30 shadow-[0_0_24px_-8px_var(--accent-glow)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/25 hover:bg-[var(--accent-muted)]/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        active
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--accent-muted)] text-[var(--accent)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      {"recommended" in method && method.recommended ? (
                        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent-muted)] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--accent)]">
                          Recommended
                        </span>
                      ) : null}
                      <StatusBadge status={method.status} />
                    </div>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-[var(--foreground)]">{method.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{method.description}</p>
                  <span className="mt-2 text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    For {method.audience}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 ${
            freeBlocked ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {source === "github" ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Deploy from GitHub</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Connect once, pick a repository, and Mr.Software hosts your static site with a live URL.
                  </p>
                </div>
                <DeployGithubPanel freeBlocked={freeBlocked} />
              </div>
          ) : null}

          {source === "zip" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Upload ZIP</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  We extract your archive, find <code className="text-[var(--foreground)]">index.html</code>,
                  and host it with SSL on Mr.Software Cloud.
                </p>
                <div className="mt-3">
                  <WorkflowSteps
                    steps={["Website.zip", "Extract", "Validate", "Deploy", "Live URL"]}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Framework detection (coming)
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                  <code>package.json</code> → Node · <code>next.config.js</code> → Next.js ·{" "}
                  <code>vite.config.js</code> → Vite · static <code>index.html</code> → instant host
                </p>
              </div>
              <DeployUploadForm />
            </div>
          ) : null}

          {source === "import" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Import existing app</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Connect a product from your marketplace library and host its static build on Mr.Software
                  Cloud — buyers open it from your storefront.
                </p>
                <div className="mt-3">
                  <WorkflowSteps steps={["Pick listing", "Upload build ZIP", "Link & deploy"]} />
                </div>
              </div>

              {softwareListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
                  <p>No marketplace listings yet.</p>
                  <Link
                    href="/listings"
                    className="mt-2 inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline"
                  >
                    Create a listing first
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              ) : (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">Marketplace product</span>
                    <select
                      value={importSoftwareId}
                      onChange={(e) => setImportSoftwareId(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/30 focus:ring-2"
                    >
                      <option value="">Select a product…</option>
                      {softwareListings.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {importSoftwareId ? (
                    <DeployUploadForm
                      defaultName={importName}
                      softwareId={importSoftwareId}
                    />
                  ) : (
                    <p className="text-xs text-[var(--muted)]">
                      Choose a listing, then upload the ZIP build for that product.
                    </p>
                  )}
                </>
              )}
            </div>
          ) : null}

          {source === "ai" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">AI generated app</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Describe what you want — Mr.Software AI generates landing copy, structure, and a draft
                  you can review before going live.
                </p>
                <div className="mt-3">
                  <WorkflowSteps
                    steps={["Describe app", "AI builds draft", "Review", "Deploy"]}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-muted)]/20 p-5">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Example: &ldquo;Create a school management system for private schools in East Africa&rdquo;
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  AI produces your landing page, pricing, and dashboard preview. Export or deploy when
                  you&apos;re ready.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/app/factory"
                  className="btn-brand inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Open Startup Factory
                </Link>
                <Link
                  href="/app/ai/deployment"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-medium transition hover:border-[var(--accent)]/40"
                >
                  Deployment Advisor
                </Link>
              </div>

              <p className="text-xs text-[var(--muted)]">
                After generating a draft, return here with <strong className="text-[var(--foreground)]">Upload ZIP</strong>{" "}
                to host it — full one-click AI deploy ships next.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {recentDeployments.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent deployments</h2>
            <Link
              href="/projects"
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              View all projects →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDeployments.slice(0, 3).map((d) => (
              <DeploymentCard key={d.id} deployment={d} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
