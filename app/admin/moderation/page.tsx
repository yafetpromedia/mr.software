import type { Metadata } from "next";
import Link from "next/link";
import { UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Moderation",
  description: "Enforcement shortcuts",
};

const STATUSES: UserStatus[] = [
  UserStatus.ACTIVE,
  UserStatus.RESTRICTED,
  UserStatus.SUSPENDED,
  UserStatus.BANNED,
];

export default async function AdminModerationPage() {
  const counts = await Promise.all(
    STATUSES.map((status) =>
      prisma.user.count({ where: { status } }).then((n) => ({ status, n })),
    ),
  );
  const failedDeploys = await prisma.deployment.count({
    where: { status: "FAILED" },
  });
  const pendingPurchases = await prisma.purchase.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Moderation
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Quick counts and deep links to govern accounts. Changes to status and
          capabilities are recorded in the audit log.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(({ status, n }) => (
          <li key={status}>
            <Link
              href={
                status === UserStatus.ACTIVE
                  ? "/admin/users?active=1"
                  : `/admin/users?status=${encodeURIComponent(status)}`
              }
              className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-[var(--accent)]/35 hover:shadow-md dark:bg-[var(--surface-elevated)]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Users · {status}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                {n}
              </p>
              <p className="mt-2 text-xs font-medium text-[var(--accent)]">
                Open in Users →
              </p>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/admin/deployments"
            className="block h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-red-500/30 hover:shadow-md dark:bg-[var(--surface-elevated)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Failed deployments
            </p>
            <p
              className={
                failedDeploys > 0
                  ? "mt-2 text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400"
                  : "mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]"
              }
            >
              {failedDeploys}
            </p>
            <p className="mt-2 text-xs font-medium text-[var(--accent)]">
              Review deployments →
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/payments"
            className="block h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-amber-500/30 hover:shadow-md dark:bg-[var(--surface-elevated)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Pending purchases
            </p>
            <p
              className={
                pendingPurchases > 0
                  ? "mt-2 text-2xl font-semibold tabular-nums text-amber-700 dark:text-amber-300"
                  : "mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]"
              }
            >
              {pendingPurchases}
            </p>
            <p className="mt-2 text-xs font-medium text-[var(--accent)]">
              View payments →
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
