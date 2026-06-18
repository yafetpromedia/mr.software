import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CreditCard,
  Package,
  Receipt,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { formatMoneyAmount } from "@/lib/portal/format-amount";

export type BillingTransaction = {
  id: string;
  softwareId: string;
  productName: string;
  amountCents: number;
  currency: string;
  status: string;
  statusLabel: string;
  licenseKind: string;
  provider: string | null;
  createdAt: string;
  validUntil: string | null;
};

export type BillingSubscription = {
  id: string;
  productName: string;
  status: string;
  statusLabel: string;
  validUntil: string | null;
  amountCents: number;
  currency: string;
};

export type WorkspacePlanSummary = {
  plan: string;
  status: string;
  amountCents: number | null;
  currency: string | null;
  expiresAt: string | null;
} | null;

type Props = {
  totalSpentCents: number;
  monthSpentCents: number;
  currency: string;
  activeLicenseCount: number;
  subscriptionCount: number;
  transactions: BillingTransaction[];
  subscriptions: BillingSubscription[];
  workspacePlan: WorkspacePlanSummary;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
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

function StatusBadge({ label, tone }: { label: string; tone: "success" | "neutral" | "warning" }) {
  const styles = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
    neutral: "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  } as const;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${styles[tone]}`}>
      {label}
    </span>
  );
}

function statusTone(status: string): "success" | "neutral" | "warning" {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING") return "warning";
  return "neutral";
}

export function BillingDashboard({
  totalSpentCents,
  monthSpentCents,
  currency,
  activeLicenseCount,
  subscriptionCount,
  transactions,
  subscriptions,
  workspacePlan,
}: Props) {
  const hasActivity = transactions.length > 0;

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
              Your account
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Purchases &amp; billing
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
              Marketplace purchases, subscriptions, and local payments via Chapa or card — all in one
              place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/app/marketplace"
              className="btn-brand btn-brand-shine inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Discover software
            </Link>
            <Link
              href="/app/my-software"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
            >
              My software
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStat
          label="Total spent"
          value={formatMoneyAmount(totalSpentCents, currency)}
          hint={hasActivity ? "All completed purchases" : "No purchases yet"}
          icon={<Receipt className="h-5 w-5" aria-hidden />}
        />
        <KpiStat
          label="This month"
          value={formatMoneyAmount(monthSpentCents, currency)}
          hint="Recent checkout activity"
          icon={<CreditCard className="h-5 w-5" aria-hidden />}
        />
        <KpiStat
          label="Active licenses"
          value={String(activeLicenseCount)}
          hint="Software you can open now"
          icon={<Package className="h-5 w-5" aria-hidden />}
        />
        <KpiStat
          label="Subscriptions"
          value={String(subscriptionCount)}
          hint={subscriptionCount > 0 ? "Recurring products" : "None active"}
          icon={<Repeat className="h-5 w-5" aria-hidden />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="modern-card space-y-4 p-5 sm:col-span-2 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Transactions</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">Marketplace checkout history</p>
            </div>
            {transactions.length > 0 ? (
              <span className="text-xs text-[var(--muted)]">{transactions.length} total</span>
            ) : null}
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/50 px-5 py-12 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-[var(--muted)] opacity-60" aria-hidden />
              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">No transactions yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
                When you buy software from the marketplace, receipts and license status will show up
                here instantly.
              </p>
              <Link
                href="/app/marketplace"
                className="btn-brand mt-4 inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold"
              >
                Browse marketplace
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/40">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex flex-col gap-3 px-4 py-4 first:rounded-t-xl last:rounded-b-xl sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/software/${tx.softwareId}`}
                        className="truncate text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                      >
                        {tx.productName}
                      </Link>
                      <StatusBadge label={tx.statusLabel} tone={statusTone(tx.status)} />
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">{formatWhen(tx.createdAt)}</p>
                    {tx.provider ? (
                      <p className="mt-0.5 text-[0.65rem] uppercase tracking-wide text-[var(--muted)]">
                        via {tx.provider}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
                      {formatMoneyAmount(tx.amountCents, tx.currency || currency)}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-[var(--muted)]">
                      {tx.licenseKind.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="modern-card space-y-4 p-5 sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
              <CreditCard className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Payment methods</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                Pay with Chapa (ETB, Telebirr) or card at checkout. Saved methods will appear here
                when enabled.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/60 px-4 py-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--muted)]" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">No card on file</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Checkout uses secure one-time payment — nothing stored yet.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {workspacePlan ? (
            <section className="modern-card space-y-3 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Workspace plan</h2>
              </div>
              <p className="font-display text-xl font-bold capitalize text-[var(--foreground)]">
                {workspacePlan.plan.toLowerCase()}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Status: {workspacePlan.status.toLowerCase()}
                {workspacePlan.amountCents && workspacePlan.currency
                  ? ` · ${formatMoneyAmount(workspacePlan.amountCents, workspacePlan.currency)}/mo`
                  : ""}
                {workspacePlan.expiresAt
                  ? ` · renews ${formatDate(workspacePlan.expiresAt)}`
                  : ""}
              </p>
              <Link
                href="/payouts"
                className="inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Manage workspace billing →
              </Link>
            </section>
          ) : null}
        </div>
      </div>

      <section className="modern-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Subscriptions</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Recurring marketplace licenses</p>
          </div>
          {subscriptions.length > 0 ? (
            <span className="text-xs text-[var(--muted)]">{subscriptions.length} active</span>
          ) : null}
        </div>

        {subscriptions.length === 0 ? (
          <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/40 px-4 py-8 text-center text-sm text-[var(--muted)]">
            No subscription products yet. Subscriptions you buy from the marketplace will be managed
            here.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--foreground)]">{sub.productName}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {sub.validUntil
                        ? `Renews ${formatDate(sub.validUntil)}`
                        : "No renewal date set"}
                    </p>
                  </div>
                  <StatusBadge label={sub.statusLabel} tone={statusTone(sub.status)} />
                </div>
                <p className="mt-3 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                  {formatMoneyAmount(sub.amountCents, sub.currency || currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
