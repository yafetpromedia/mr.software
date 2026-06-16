import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Audit log",
  description: "Privileged admin actions",
};

const TAKE = 100;

function detailPreview(d: unknown): string {
  if (d == null) return "—";
  if (typeof d === "string") return d;
  try {
    return JSON.stringify(d);
  } catch {
    return String(d);
  }
}

export default async function AdminAuditPage() {
  const rows = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: TAKE,
    include: { admin: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Audit log
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Last {TAKE} privileged actions, newest first, with the administrator
          who performed them.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm dark:bg-[var(--surface-elevated)]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3 sm:px-5">When</th>
              <th className="px-4 py-3 sm:px-5">Admin</th>
              <th className="px-4 py-3 sm:px-5">Action</th>
              <th className="px-4 py-3 sm:px-5">Target</th>
              <th className="px-4 py-3 sm:px-5">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-[var(--muted)] sm:px-5"
                >
                  No entries yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="bg-[var(--surface)] align-top dark:bg-[var(--surface-elevated)]"
                >
                  <td className="px-4 py-3 text-xs text-[var(--muted)] sm:px-5">
                    {r.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <p className="text-[var(--foreground)]">
                      {r.admin.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {r.admin.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)] sm:px-5">
                    {r.action}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <p className="text-xs text-[var(--foreground)]">
                      {r.targetType}
                    </p>
                    {r.targetId ? (
                      <p className="mt-0.5 break-all font-mono text-[0.65rem] text-[var(--muted)]">
                        {r.targetId}
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-md px-4 py-3 sm:px-5">
                    <p
                      className="break-words font-mono text-[0.7rem] text-[var(--muted)]"
                      title={detailPreview(r.detail)}
                    >
                      {detailPreview(r.detail)}
                    </p>
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
