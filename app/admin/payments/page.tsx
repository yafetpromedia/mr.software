import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Payments",
  description: "Purchases and entitlements",
};

function formatAmount(cents: number | null, currency: string | null) {
  if (cents == null) return "—";
  const c = (currency || "usd").toUpperCase();
  if (c === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }
  return `${(cents / 100).toFixed(2)} ${c}`;
}

export default async function AdminPaymentsPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      status: true,
      licenseKind: true,
      amountCents: true,
      currency: true,
      validFrom: true,
      validUntil: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
      software: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Payments
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Marketplace purchases: buyer, product, and status.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm dark:bg-[var(--surface-elevated)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3 sm:px-5">Amount</th>
              <th className="px-4 py-3 sm:px-5">Buyer</th>
              <th className="px-4 py-3 sm:px-5">Software</th>
              <th className="px-4 py-3 sm:px-5">License</th>
              <th className="px-4 py-3 sm:px-5">Status</th>
              <th className="px-4 py-3 sm:px-5">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {purchases.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-[var(--muted)] sm:px-5"
                >
                  No purchases yet.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr
                  key={p.id}
                  className="bg-[var(--surface)] transition-colors hover:bg-[var(--accent-muted)]/30 dark:bg-[var(--surface-elevated)] dark:hover:bg-[var(--accent-muted)]/20"
                >
                  <td className="px-4 py-3 font-medium tabular-nums text-[var(--foreground)] sm:px-5">
                    {formatAmount(p.amountCents, p.currency)}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <p className="text-[var(--foreground)]">{p.user.name}</p>
                    <p className="text-xs text-[var(--muted)]">{p.user.email}</p>
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(p.user.email)}`}
                      className="mt-1 inline-block text-xs font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      Open in Users
                    </Link>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="text-[var(--foreground)]">
                      {p.software.name}
                    </span>
                    <p className="font-mono text-[0.65rem] text-[var(--muted)]">
                      {p.software.id}
                    </p>
                    <Link
                      href={`/software/${p.software.id}`}
                      className="text-xs text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      Public page
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] sm:px-5">
                    {p.licenseKind}
                    {p.validUntil ? (
                      <p className="mt-1">
                        until {p.validUntil.toLocaleDateString()}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="rounded-md bg-[var(--background)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] sm:px-5">
                    {p.createdAt.toLocaleString()}
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
