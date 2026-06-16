import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Deployments",
  description: "Hosted projects",
};

export default async function AdminDeploymentsPage() {
  const rows = await prisma.deployment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      url: true,
      errorMessage: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
      software: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Deployments
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Workspace projects, status, and owners.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm dark:bg-[var(--surface-elevated)]">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3 sm:px-5">Project</th>
              <th className="px-4 py-3 sm:px-5">Owner</th>
              <th className="px-4 py-3 sm:px-5">Software</th>
              <th className="px-4 py-3 sm:px-5">Status</th>
              <th className="px-4 py-3 sm:px-5">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-[var(--muted)] sm:px-5"
                >
                  No deployments yet.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr
                  key={d.id}
                  className="bg-[var(--surface)] transition-colors hover:bg-[var(--accent-muted)]/30 dark:bg-[var(--surface-elevated)] dark:hover:bg-[var(--accent-muted)]/20"
                >
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-medium text-[var(--foreground)]">
                      {d.name}
                    </p>
                    <p className="font-mono text-[0.65rem] text-[var(--muted)]">
                      {d.slug}
                    </p>
                    {d.url ? (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-[var(--accent)] underline-offset-4 hover:underline"
                      >
                        {d.url}
                      </a>
                    ) : null}
                    {d.errorMessage && d.status === "FAILED" ? (
                      <p
                        className="mt-2 max-w-md truncate text-xs text-red-600 dark:text-red-400"
                        title={d.errorMessage}
                      >
                        {d.errorMessage}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <p className="text-[var(--foreground)]">{d.user.name}</p>
                    <p className="text-xs text-[var(--muted)]">{d.user.email}</p>
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(d.user.email)}`}
                      className="mt-1 inline-block text-xs font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      Open in Users
                    </Link>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    {d.software ? (
                      <>
                        <span className="text-[var(--foreground)]">
                          {d.software.name}
                        </span>
                        <p className="font-mono text-[0.65rem] text-[var(--muted)]">
                          {d.software.id}
                        </p>
                        <Link
                          href={`/software/${d.software.id}`}
                          className="text-xs text-[var(--accent)] underline-offset-4 hover:underline"
                        >
                          Public page
                        </Link>
                      </>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <span
                      className={
                        d.status === "FAILED"
                          ? "rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300"
                          : d.status === "ACTIVE"
                            ? "rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                            : "rounded-md bg-[var(--background)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]"
                      }
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] sm:px-5">
                    {d.createdAt.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
