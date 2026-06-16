import Link from "next/link";
import type { Deployment } from "@prisma/client";

type Row = Pick<Deployment, "id" | "name" | "status" | "url" | "createdAt">;

type Props = {
  deployments: Row[];
};

function statusClass(status: Deployment["status"]): string {
  if (status === "ACTIVE") {
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
  }
  if (status === "FAILED") {
    return "bg-red-500/15 text-red-800 dark:text-red-300";
  }
  return "bg-amber-500/15 text-amber-900 dark:text-amber-200";
}

function displayUrl(url: string | null): { href: string; label: string } | null {
  if (!url) return null;
  const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  const label = url.replace(/^https?:\/\//, "");
  return { href, label: label.length > 48 ? `${label.slice(0, 45)}…` : label };
}

export function ProjectsTable({ deployments }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <th scope="col" className="px-4 py-3 pl-5">
              Project
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              URL
            </th>
            <th scope="col" className="px-4 py-3">
              Created
            </th>
            <th scope="col" className="px-4 py-3 pr-5 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((d) => {
            const u = displayUrl(d.url);
            return (
              <tr key={d.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 pl-5 font-medium text-[var(--foreground)]">{d.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass(d.status)}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="max-w-[12rem] px-4 py-3 text-[var(--muted)]">
                  {u ? (
                    <a
                      href={u.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-[var(--accent)] underline-offset-2 hover:underline"
                      title={d.url ?? ""}
                    >
                      {u.label}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                  {new Date(d.createdAt).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 pr-5 text-right">
                  <div className="inline-flex flex-wrap items-center justify-end gap-2">
                    {u ? (
                      <a
                        href={u.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
                      >
                        Open
                      </a>
                    ) : null}
                    <Link
                      href={`/projects/${d.id}`}
                      className="inline-flex h-8 items-center rounded-lg bg-[var(--foreground)] px-2.5 text-xs font-semibold text-[var(--background)] transition hover:bg-[var(--accent)]"
                    >
                      Details
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
