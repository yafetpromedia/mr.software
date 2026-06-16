import Link from "next/link";
import type { Deployment } from "@prisma/client";

type Props = {
  deployment: Pick<
    Deployment,
    "id" | "name" | "status" | "url" | "createdAt" | "errorMessage"
  >;
};

export function DeploymentCard({ deployment: d }: Props) {
  const statusClass =
    d.status === "ACTIVE"
      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
      : d.status === "FAILED"
        ? "bg-red-500/15 text-red-800 dark:text-red-300"
        : "bg-amber-500/15 text-amber-900 dark:text-amber-200";

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-[var(--accent)]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-[var(--foreground)]">{d.name}</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {new Date(d.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${statusClass}`}
        >
          {d.status}
        </span>
      </div>
      {d.url ? (
        <a
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block truncate text-sm text-[var(--accent)] underline-offset-4 hover:underline"
        >
          {d.url}
        </a>
      ) : null}
      {d.errorMessage ? (
        <p className="mt-2 line-clamp-2 text-xs text-red-600 dark:text-red-400">{d.errorMessage}</p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <Link
          href={`/projects/${d.id}`}
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          Details →
        </Link>
      </div>
    </article>
  );
}
