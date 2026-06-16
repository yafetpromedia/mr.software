import Link from "next/link";
import { PurchaseStatus } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { formatMoneyAmount } from "@/lib/portal/format-amount";

export const metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);

  const [rows, monthRows, total] = await Promise.all([
    prisma.purchase.findMany({
      where: { software: { developerId: session.id }, status: PurchaseStatus.ACTIVE },
      include: { software: { select: { name: true } } },
    }),
    prisma.purchase.findMany({
      where: {
        software: { developerId: session.id },
        status: PurchaseStatus.ACTIVE,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.purchase.aggregate({
      where: { software: { developerId: session.id }, status: PurchaseStatus.ACTIVE },
      _sum: { amountCents: true },
    }),
  ]);

  const bySoftware = new Map<string, { name: string; cents: number }>();
  for (const p of rows) {
    if (!p.software) continue;
    const cur = bySoftware.get(p.softwareId) ?? { name: p.software.name, cents: 0 };
    cur.cents += p.amountCents ?? 0;
    bySoftware.set(p.softwareId, cur);
  }

  const monthCents = monthRows.reduce((a, p) => a + (p.amountCents ?? 0), 0);
  const totalCents = total._sum.amountCents ?? 0;
  const displayCurrency = rows.find((r) => r.currency)?.currency ?? "ETB";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">Earnings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Revenue from licenses sold on your listings (excludes tax and platform fees when those exist).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">All time</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {formatMoneyAmount(totalCents, displayCurrency)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">This month (approx.)</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {formatMoneyAmount(monthCents, displayCurrency)}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">By product</h2>
        {bySoftware.size === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No sales recorded yet. Publish a listing in My listings.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {Array.from(bySoftware.entries()).map(([id, v]) => (
              <li key={id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="font-medium text-[var(--foreground)]">{v.name}</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {formatMoneyAmount(v.cents, displayCurrency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-[var(--muted)]">
        Payouts: <Link className="font-medium text-[var(--accent)] underline-offset-4 hover:underline" href="/payouts">withdraw via Chapa</Link> when connected.
      </p>
    </div>
  );
}
