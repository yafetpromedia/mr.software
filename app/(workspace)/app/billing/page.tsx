import { PurchaseStatus, LicenseKind } from "@prisma/client";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatMoneyAmount } from "@/lib/portal/format-amount";

function statusText(status: PurchaseStatus, kind: LicenseKind): string {
  if (status === PurchaseStatus.ACTIVE) {
    return kind === LicenseKind.SUBSCRIPTION ? "Active subscription" : "Paid (active)";
  }
  if (status === PurchaseStatus.PENDING) return "Pending";
  if (status === PurchaseStatus.EXPIRED) return "Expired";
  if (status === PurchaseStatus.REFUNDED) return "Refunded";
  if (status === PurchaseStatus.CANCELED) return "Canceled";
  return status;
}

export default async function BillingPage() {
  const session = await getSession();
  if (!session) notFound();

  const rows = await prisma.purchase.findMany({
    where: { userId: session.id },
    include: { software: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Billing & payments
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Purchases, subscriptions, and local payments (e.g. Chapa in ETB) will appear here as they are
          completed.
        </p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Payment methods</h2>
        <p className="mt-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          Chapa and other methods will be saved here when checkout is fully wired. No card on file yet.
        </p>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Transactions</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No transactions yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">{p.software?.name ?? "Software"}</p>
                  <p className="text-xs text-[var(--muted)]">{new Date(p.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {formatMoneyAmount(p.amountCents, p.currency ?? "USD")}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {statusText(p.status, p.licenseKind)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Subscriptions</h2>
        {rows.filter((p) => p.licenseKind === LicenseKind.SUBSCRIPTION).length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No subscription rows yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows
              .filter((p) => p.licenseKind === LicenseKind.SUBSCRIPTION)
              .map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col justify-between gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center"
                >
                  <span className="font-medium text-[var(--foreground)]">{p.software?.name}</span>
                  <span className="text-sm text-[var(--muted)]">
                    {p.validUntil
                      ? `Next period ends ${new Date(p.validUntil).toLocaleDateString()}`
                      : "No end date"}
                    {" · "}
                    {p.status}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
