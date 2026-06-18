import Link from "next/link";
import { MiniAreaChart } from "@/components/admin/charts/mini-area-chart";
import { MiniBarChart } from "@/components/admin/charts/mini-bar-chart";
import { SegmentBar } from "@/components/admin/charts/segment-bar";
import type { PlatformAnalytics } from "@/lib/admin/platform-analytics";
import { pctChange } from "@/lib/admin/platform-analytics";

export type AdminStat = {
  label: string;
  value: string | number;
  href: string;
  hint?: string;
};

export type AdminAlert = {
  text: string;
  href: string;
  kind: "warn" | "bad";
};

export type AdminActivity = {
  id: string;
  action: string;
  adminName: string;
  createdAt: string;
  targetType: string;
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#f97316",
  DEVELOPER: "#0ea5e9",
  USER: "#94a3b8",
};

const DEPLOY_COLORS: Record<string, string> = {
  ACTIVE: "#10b981",
  PENDING: "#f59e0b",
  FAILED: "#ef4444",
};

function usdCents(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

function usdCentsFull(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n / 100);
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrendBadge({ current, prior }: { current: number; prior: number }) {
  const pct = pctChange(current, prior);
  if (pct === null) {
    return <span className="text-xs text-[var(--muted)]">— vs prior</span>;
  }
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
        up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      {up ? "↑" : "↓"} {Math.abs(pct)}%
      <span className="font-normal text-[var(--muted)]">vs prior</span>
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  trend,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: { current: number; prior: number };
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/25 hover:shadow-[var(--shadow-card)] sm:p-5"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:text-3xl">
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-[var(--muted)]">{sub}</p> : null}
      {trend ? (
        <div className="mt-3">
          <TrendBadge current={trend.current} prior={trend.prior} />
        </div>
      ) : null}
    </Link>
  );
}

export function AdminOverviewDashboard({
  stats,
  alerts,
  recentActivity,
  deploySummary,
  analytics,
}: {
  stats: AdminStat[];
  alerts: AdminAlert[];
  recentActivity: AdminActivity[];
  deploySummary: { active: number; failed: number; pending: number };
  analytics: PlatformAnalytics;
}) {
  const healthy = alerts.length === 0;
  const { periodDays } = analytics;

  const roleSegments = analytics.roleBreakdown.map((r) => ({
    label: r.role,
    value: r.count,
    color: ROLE_COLORS[r.role] ?? "#cbd5e1",
  }));

  const deploySegments = analytics.deployBreakdown.map((d) => ({
    label: d.status,
    value: d.count,
    color: DEPLOY_COLORS[d.status] ?? "#cbd5e1",
  }));

  const chartLabels = analytics.revenueSeries
    .filter((_, i) => i % 7 === 0 || i === analytics.revenueSeries.length - 1)
    .map((d) => ({
      date: d.date,
      label: new Date(d.date + "T12:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Analytics
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-3xl">
            Platform dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Live metrics from your database — revenue, signups, catalog, and operations for the
            last {periodDays} days.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
            Last {periodDays} days
          </span>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              healthy
                ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-800 dark:text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${healthy ? "bg-emerald-500" : "animate-pulse bg-amber-500"}`}
              aria-hidden
            />
            {healthy ? "All clear" : `${alerts.length} alert${alerts.length === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={usdCents(analytics.revenueCents)}
          sub={`${analytics.purchases} purchase${analytics.purchases === 1 ? "" : "s"} in period`}
          trend={{ current: analytics.revenueCents, prior: analytics.revenuePriorCents }}
          href="/admin/payments"
        />
        <KpiCard
          label="New signups"
          value={String(analytics.signups)}
          sub={`${analytics.totalProductViews.toLocaleString()} product views`}
          trend={{ current: analytics.signups, prior: analytics.signupsPrior }}
          href="/admin/users"
        />
        {stats.slice(2, 4).map((s) => (
          <KpiCard
            key={s.label}
            label={s.label}
            value={String(s.value)}
            sub={s.hint}
            href={s.href}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Revenue</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">Daily gross from active purchases</p>
            </div>
            <p className="font-display text-lg font-semibold tabular-nums text-[var(--foreground)]">
              {usdCentsFull(analytics.revenueCents)}
            </p>
          </div>
          <div className="mt-4 h-36 sm:h-44">
            <MiniAreaChart
              data={analytics.revenueSeries}
              className="h-full w-full"
              formatValue={(n) => usdCents(n)}
            />
          </div>
          <div className="mt-2 flex justify-between text-[0.6rem] tabular-nums text-[var(--muted)]">
            {chartLabels.map((l) => (
              <span key={l.date}>{l.label}</span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Signups</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">New accounts per day</p>
            <div className="mt-4 h-24">
              <MiniBarChart data={analytics.signupSeries} className="h-full w-full" />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Purchases</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Completed licenses per day</p>
            <div className="mt-4 h-24">
              <MiniBarChart data={analytics.purchaseSeries} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Top products</h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">By active purchase count</p>
            </div>
            <Link href="/admin/software" className="text-xs font-medium text-[var(--accent)] hover:underline">
              Catalog
            </Link>
          </div>
          {analytics.topProducts.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    <th className="pb-2 pr-4 font-semibold">Product</th>
                    <th className="pb-2 pr-4 text-right font-semibold">Sales</th>
                    <th className="pb-2 text-right font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {analytics.topProducts.map((p, i) => (
                    <tr key={p.id} className="group">
                      <td className="py-2.5 pr-4">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-[var(--surface-elevated)] text-[0.6rem] font-bold text-[var(--muted)]">
                          {i + 1}
                        </span>
                        <span className="font-medium text-[var(--foreground)]">{p.name}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--foreground)]">
                        {p.purchases}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-[var(--foreground)]">
                        {usdCentsFull(p.revenueCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">No purchases yet — revenue will appear here.</p>
          )}

          {analytics.recentPurchases.length > 0 ? (
            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Recent transactions
              </p>
              <ul className="mt-3 space-y-2">
                {analytics.recentPurchases.slice(0, 4).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-elevated)]/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {p.softwareName}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">{p.buyerName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums text-[var(--foreground)]">
                        {p.amountCents != null ? usdCentsFull(p.amountCents) : "—"}
                      </p>
                      <p className="text-[0.65rem] text-[var(--muted)]">{formatWhen(p.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">User mix</h2>
            <SegmentBar segments={roleSegments} className="mt-4" />
            <ul className="mt-4 space-y-2">
              {roleSegments.map((seg) => (
                <li key={seg.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[var(--foreground)]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
                    {seg.label}
                  </span>
                  <span className="tabular-nums font-medium">{seg.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Deployments</h2>
            <SegmentBar segments={deploySegments} className="mt-4" />
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-[var(--surface-elevated)] px-2 py-2.5">
                <dt className="text-[0.6rem] font-medium uppercase text-[var(--muted)]">Live</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {deploySummary.active}
                </dd>
              </div>
              <div className="rounded-lg bg-[var(--surface-elevated)] px-2 py-2.5">
                <dt className="text-[0.6rem] font-medium uppercase text-[var(--muted)]">Pending</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums">{deploySummary.pending}</dd>
              </div>
              <div className="rounded-lg bg-[var(--surface-elevated)] px-2 py-2.5">
                <dt className="text-[0.6rem] font-medium uppercase text-[var(--muted)]">Failed</dt>
                <dd
                  className={`mt-0.5 text-lg font-semibold tabular-nums ${
                    deploySummary.failed > 0 ? "text-red-600 dark:text-red-400" : ""
                  }`}
                >
                  {deploySummary.failed}
                </dd>
              </div>
            </dl>
            {alerts.length > 0 ? (
              <ul className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                {alerts.map((a) => (
                  <li key={a.text}>
                    <Link
                      href={a.href}
                      className={
                        a.kind === "bad"
                          ? "text-xs text-red-700 hover:underline dark:text-red-300"
                          : "text-xs text-amber-800 hover:underline dark:text-amber-200"
                      }
                    >
                      {a.text}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
                No operational alerts.
              </p>
            )}
            <Link
              href="/admin/deployments"
              className="mt-3 inline-flex text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Manage deployments →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Admin activity</h2>
            <Link href="/admin/audit" className="text-xs font-medium text-[var(--accent)] hover:underline">
              Audit log
            </Link>
          </div>
          {recentActivity.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {recentActivity.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">{row.action}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {row.adminName} · {row.targetType}
                    </p>
                  </div>
                  <time className="shrink-0 text-[0.65rem] tabular-nums text-[var(--muted)]">
                    {formatWhen(row.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">No privileged actions logged yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Quick access</h2>
          <ul className="mt-4 space-y-1">
            {[
              { label: "Users", href: "/admin/users", desc: `${stats[0]?.value ?? 0} accounts` },
              { label: "Payments", href: "/admin/payments", desc: "Purchases & payouts" },
              { label: "Storefronts", href: "/admin/storefronts", desc: stats[3]?.hint ?? "Creators" },
              { label: "Moderation", href: "/admin/moderation", desc: "Content review" },
              { label: "Reports", href: "/admin/reports", desc: "User reports" },
              { label: "System", href: "/admin/system", desc: "Health & config" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between rounded-lg px-2 py-2 transition hover:bg-[var(--surface-elevated)]"
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">{link.label}</span>
                  <span className="text-xs text-[var(--muted)]">{link.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-3 text-sm transition hover:border-[var(--accent)]/25 hover:bg-[var(--surface)]"
            >
              <span className="text-[var(--muted)]">{s.label}</span>
              <span className="font-semibold tabular-nums text-[var(--foreground)]">{s.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
