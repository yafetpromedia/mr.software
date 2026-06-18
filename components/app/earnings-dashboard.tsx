import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Banknote,
  Package,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MiniAreaChart } from "@/components/admin/charts/mini-area-chart";
import { formatMoneyAmount } from "@/lib/portal/format-amount";

export type EarningsProductRow = {
  id: string;
  name: string;
  cents: number;
  saleCount: number;
};

export type EarningsRecentSale = {
  id: string;
  productName: string;
  amountCents: number;
  currency: string;
  createdAt: string;
};

export type EarningsTrendPoint = { date: string; value: number };

type Props = {
  totalCents: number;
  monthCents: number;
  currency: string;
  saleCount: number;
  monthSaleCount: number;
  listingCount: number;
  byProduct: EarningsProductRow[];
  recentSales: EarningsRecentSale[];
  revenueTrend: EarningsTrendPoint[];
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KpiStat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="modern-card relative overflow-hidden p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--accent)]/8 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-[2rem]">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-xs text-[var(--muted)]">{hint}</p> : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
          {icon}
        </span>
      </div>
    </div>
  );
}

export function EarningsDashboard({
  totalCents,
  monthCents,
  currency,
  saleCount,
  monthSaleCount,
  listingCount,
  byProduct,
  recentSales,
  revenueTrend,
}: Props) {
  const hasSales = saleCount > 0;
  const trendTotal = revenueTrend.reduce((sum, point) => sum + point.value, 0);
  const monthDelta =
    totalCents > 0 ? Math.round((monthCents / Math.max(totalCents, 1)) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 100% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 58%), radial-gradient(ellipse 45% 40% at 0% 100%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 52%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Seller revenue
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Revenue
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
              License sales from your marketplace listings — gross amounts before tax and platform
              fees.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/listings"
              className="btn-brand btn-brand-shine inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
            >
              <Package className="h-4 w-4" aria-hidden />
              My listings
            </Link>
            <Link
              href="/payouts"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
            >
              Withdraw
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStat
          label="All-time revenue"
          value={formatMoneyAmount(totalCents, currency)}
          hint={hasSales ? `${saleCount} license${saleCount !== 1 ? "s" : ""} sold` : "No sales yet"}
          icon={<Wallet className="h-5 w-5" aria-hidden />}
        />
        <KpiStat
          label="This month"
          value={formatMoneyAmount(monthCents, currency)}
          hint={
            hasSales
              ? `${monthSaleCount} sale${monthSaleCount !== 1 ? "s" : ""}${monthDelta > 0 ? ` · ${monthDelta}% of total` : ""}`
              : "Resets on the 1st"
          }
          icon={<TrendingUp className="h-5 w-5" aria-hidden />}
        />
        <KpiStat
          label="Active listings"
          value={String(listingCount)}
          hint={listingCount > 0 ? "Live on marketplace" : "Publish your first product"}
          icon={<Package className="h-5 w-5" aria-hidden />}
        />
        <KpiStat
          label="Avg. order value"
          value={
            hasSales
              ? formatMoneyAmount(Math.round(totalCents / saleCount), currency)
              : formatMoneyAmount(0, currency)
          }
          hint="Per completed license"
          icon={<Receipt className="h-5 w-5" aria-hidden />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="modern-card space-y-4 p-5 sm:col-span-2 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Revenue trend</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">Last 30 days · {currency}</p>
            </div>
            <p className="font-display text-lg font-bold tabular-nums text-[var(--foreground)]">
              {formatMoneyAmount(trendTotal, currency)}
            </p>
          </div>
          <div className="h-32 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/60 px-2 py-3">
            {hasSales ? (
              <MiniAreaChart
                data={revenueTrend}
                height={120}
                formatValue={(n) => formatMoneyAmount(n, currency)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <TrendingUp className="h-6 w-6 text-[var(--muted)] opacity-50" aria-hidden />
                <p className="text-xs text-[var(--muted)]">
                  Sales will appear here once customers purchase your listings.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="modern-card flex flex-col justify-between gap-4 p-5 sm:p-6">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
              <Banknote className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-[var(--foreground)]">Payouts</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Connect Chapa to withdraw ETB to your bank or mobile money account when seller
              onboarding is complete.
            </p>
          </div>
          <Link
            href="/payouts"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
          >
            Set up withdrawals
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="modern-card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">By product</h2>
            {byProduct.length > 0 ? (
              <span className="text-xs text-[var(--muted)]">{byProduct.length} products</span>
            ) : null}
          </div>

          {byProduct.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/50 px-5 py-10 text-center">
              <Package className="mx-auto h-8 w-8 text-[var(--muted)] opacity-60" aria-hidden />
              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">No sales yet</p>
              <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
                Publish a product to the marketplace and share your storefront link to start earning.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/listings"
                  className="btn-brand inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold"
                >
                  Publish listing
                </Link>
                <Link
                  href="/app/storefront"
                  className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium hover:border-[var(--accent)]/35"
                >
                  Create storefront
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {byProduct.map((product) => {
                const share = totalCents > 0 ? (product.cents / totalCents) * 100 : 0;
                return (
                  <li
                    key={product.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--foreground)]">{product.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {product.saleCount} sale{product.saleCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                        {formatMoneyAmount(product.cents, currency)}
                      </p>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all"
                        style={{ width: `${Math.max(share, 4)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="modern-card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent sales</h2>
            {recentSales.length > 0 ? (
              <span className="text-xs text-[var(--muted)]">Latest activity</span>
            ) : null}
          </div>

          {recentSales.length === 0 ? (
            <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/40 px-4 py-8 text-center text-sm text-[var(--muted)]">
              Completed purchases will show up here in real time.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/40">
              {recentSales.map((sale) => (
                <li
                  key={sale.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {sale.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{formatWhen(sale.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
                      {formatMoneyAmount(sale.amountCents, sale.currency || currency)}
                    </p>
                    <p className="text-[0.65rem] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Paid
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {!hasSales && listingCount === 0 ? (
        <section className="modern-card grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Step 1</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Create storefront</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Brand your public page at{" "}
              <Link href="/app/storefront" className="text-[var(--accent)] hover:underline">
                /app/storefront
              </Link>
              .
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Step 2</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Publish a listing</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Add pricing and description at{" "}
              <Link href="/listings" className="text-[var(--accent)] hover:underline">
                /listings
              </Link>
              .
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Step 3</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Get paid</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Connect Chapa on{" "}
              <Link href="/payouts" className="text-[var(--accent)] hover:underline">
                Billing
              </Link>{" "}
              to withdraw ETB.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
