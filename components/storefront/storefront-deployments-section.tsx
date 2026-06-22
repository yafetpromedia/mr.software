import { DeploymentStatus } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";

export type StorefrontDeployment = {
  id: string;
  name: string;
  url: string | null;
  status: DeploymentStatus;
  createdAt: string;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StorefrontDeploymentsSection({
  deployments,
  isMidnight,
}: {
  deployments: StorefrontDeployment[];
  isMidnight: boolean;
}) {
  if (deployments.length === 0) return null;

  const text = {
    section: isMidnight ? "text-zinc-100" : "text-stone-900 dark:text-stone-50",
    muted: isMidnight ? "text-zinc-400" : "text-stone-600 dark:text-stone-400",
    card: isMidnight
      ? "border-zinc-700 bg-zinc-900/80 hover:border-violet-500/30"
      : "border-stone-200 bg-white hover:border-orange-300 dark:border-[var(--border)] dark:bg-[var(--surface)]",
    name: isMidnight ? "text-zinc-100" : "text-stone-900 dark:text-[var(--foreground)]",
    link: isMidnight ? "text-violet-400 hover:text-violet-300" : "text-orange-700 dark:text-[var(--accent)]",
  };

  return (
    <section className="mt-10 sm:mt-12" aria-labelledby="store-deployments-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="store-deployments-heading" className={`text-lg font-bold tracking-tight sm:text-2xl ${text.section}`}>
            Live deployments
          </h2>
          <p className={`mt-1 text-sm ${text.muted}`}>Projects hosted on Mr.Software Cloud</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${
            isMidnight
              ? "bg-zinc-800 text-zinc-200"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
          }`}
        >
          {deployments.filter((d) => d.status === "ACTIVE").length} live
        </span>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {deployments.map((d) => (
          <li key={d.id}>
            <div
              className={`flex h-full flex-col rounded-2xl border p-4 transition ${text.card}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`font-semibold ${text.name}`}>{d.name}</p>
                <StatusPill
                  tone={
                    d.status === DeploymentStatus.ACTIVE
                      ? "success"
                      : d.status === DeploymentStatus.FAILED
                        ? "danger"
                        : "warning"
                  }
                >
                  {d.status === DeploymentStatus.ACTIVE ? "Live" : d.status}
                </StatusPill>
              </div>
              <p className={`mt-1 text-xs ${text.muted}`}>{formatWhen(d.createdAt)}</p>
              {d.url && d.status === DeploymentStatus.ACTIVE ? (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${text.link}`}
                >
                  Open site
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : (
                <span className={`mt-3 text-xs ${text.muted}`}>Preview when active</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
