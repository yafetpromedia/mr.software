import Link from "next/link";
import { DeploymentStatus } from "@prisma/client";
import { MiniAreaChart } from "@/components/admin/charts/mini-area-chart";
import { SegmentBar } from "@/components/admin/charts/segment-bar";
import { StorefrontSummaryCard } from "@/components/app/storefront-summary-card";
import { InfrastructureCard } from "@/components/ui/infrastructure-card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatMoneyAmount } from "@/lib/portal/format-amount";
import type { StorefrontAnalytics } from "@/lib/storefront/storefront";
import type { Deployment } from "@prisma/client";

type TrendPoint = { date: string; value: number };

type StatusBreakdown = { active: number; pending: number; failed: number };

type PlanInfo = {
  proActive: boolean;
  usedSlots: number;
  maxFree: number;
  atLimit: boolean;
};

type Props = {
  userName: string;
  deployments: Deployment[];
  activeCount: number;
  totalDeploys: number;
  earningsCents: number;
  listingCount: number;
  currency?: string;
  storefront: StorefrontAnalytics | null;
  storefrontVerified?: boolean;
  deploymentTrend: TrendPoint[];
  statusBreakdown: StatusBreakdown;
  planInfo: PlanInfo;
};

const DEPLOY_COLORS = {
  ACTIVE: "#10b981",
  PENDING: "#f59e0b",
  FAILED: "#ef4444",
} as const;

function formatWhen(iso: string | Date) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function KpiCard({
  label,
  value,
  hint,
  href,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-3xl">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-stone-500 dark:text-[var(--muted)]">{hint}</p>
          ) : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)] transition group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent-muted)]">
          {icon}
        </span>
      </div>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--accent)]/30 hover:bg-[var(--surface)]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-stone-900 dark:text-[var(--foreground)]">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-stone-500 dark:text-[var(--muted)]">
          {description}
        </span>
      </span>
    </Link>
  );
}

export function CommandCenter({
  userName,
  deployments,
  activeCount,
  totalDeploys,
  earningsCents,
  listingCount,
  currency = "ETB",
  storefront,
  storefrontVerified = false,
  deploymentTrend,
  statusBreakdown,
  planInfo,
}: Props) {
  const firstName = userName.split(/\s+/)[0] ?? userName;
  const totalStatus =
    statusBreakdown.active + statusBreakdown.pending + statusBreakdown.failed;
  const trendTotal = deploymentTrend.reduce((s, d) => s + d.value, 0);

  const segments = [
    { label: "Active", value: statusBreakdown.active, color: DEPLOY_COLORS.ACTIVE },
    { label: "Pending", value: statusBreakdown.pending, color: DEPLOY_COLORS.PENDING },
    { label: "Failed", value: statusBreakdown.failed, color: DEPLOY_COLORS.FAILED },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {planInfo.atLimit ? (
        <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-4 sm:p-5">
          <p className="font-medium text-stone-900 dark:text-[var(--foreground)]">
            You&apos;ve used your free deployment slot
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-[var(--muted)]">
            Upgrade to Pro to run more active deployments and grow your catalog.
          </p>
          <Link
            href="/payouts"
            className="mt-3 inline-flex h-9 items-center rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white dark:bg-[var(--foreground)] dark:text-[var(--background)]"
          >
            Payouts &amp; upgrades
          </Link>
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 50%)",
          }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Command center
              </p>
              <StatusPill tone={planInfo.proActive ? "accent" : "neutral"}>
                {planInfo.proActive ? "Pro plan" : "Free plan"}
              </StatusPill>
              {activeCount > 0 ? (
                <StatusPill tone="success">{activeCount} live</StatusPill>
              ) : null}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-3xl lg:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-[var(--muted)] sm:text-base">
              Your builder workspace — deploy to web, list on Play Store &amp; App Store, and track revenue in one place.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/app/ai/blueprint"
              className="btn-brand inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold shadow-sm"
            >
              AI-assisted builder
            </Link>
            <Link
              href="/deploy"
              className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-medium text-stone-800 transition hover:border-[var(--accent)]/30 dark:text-[var(--foreground)]"
            >
              Deploy project
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active deployments"
          value={String(activeCount)}
          hint={totalDeploys > 0 ? `${totalDeploys} total projects` : "None yet"}
          href="/projects"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.25a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008H12v-.008Z" />
            </svg>
          }
        />
        <KpiCard
          label="Revenue"
          value={formatMoneyAmount(earningsCents, currency)}
          hint="From active purchases"
          href="/earnings"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.878 1.172-2.303 0-3.182C13.535 12.9 12 12 9.999 12c-1.021 0-1.875.291-2.5.75M12 6V3.25a.75.75 0 0 1 1.5 0V6M20.25 12a8.25 8.25 0 0 0-1.2-3.4m0 0a2.5 2.5 0 0 0-1.2-.8m-12.9 0a2.5 2.5 0 0 0-1.2.8m0 0A8.25 8.25 0 0 0 3.75 12" />
            </svg>
          }
        />
        <KpiCard
          label="Listings"
          value={String(listingCount)}
          hint="Products in marketplace"
          href="/listings"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75H3a.75.75 0 0 0-.75.75V21m0 0h18M2.25 10.5V4.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25M2.25 10.5h18" />
            </svg>
          }
        />
        <KpiCard
          label="Product views"
          value={storefront ? String(storefront.totalProductViews) : "—"}
          hint={
            storefront
              ? `${storefront.followerCount} follower${storefront.followerCount === 1 ? "" : "s"}`
              : "Set up your storefront"
          }
          href="/app/storefront"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <InfrastructureCard className="overflow-hidden" hover={false}>
            <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
                    Deployment activity
                  </h2>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-[var(--muted)]">
                    Last 7 days · {trendTotal} new project{trendTotal === 1 ? "" : "s"}
                  </p>
                </div>
                <Link href="/deploy" className="text-xs font-medium text-[var(--accent)] hover:underline">
                  New deploy
                </Link>
              </div>
            </div>
            <div className="px-2 pb-2 pt-4 sm:px-4">
              <MiniAreaChart
                data={deploymentTrend}
                height={100}
                className="w-full text-[var(--accent)]"
                formatValue={(n) => String(n)}
              />
              <div className="mt-1 flex justify-between px-2 text-[0.6rem] text-stone-400 dark:text-[var(--muted)]">
                {deploymentTrend.map((d) => (
                  <span key={d.date}>{formatShortDate(d.date)}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-[var(--border)] px-4 py-4 sm:px-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700 dark:text-[var(--foreground)]">
                  Status breakdown
                </span>
                <span className="text-stone-500 dark:text-[var(--muted)]">{totalStatus} total</span>
              </div>
              <SegmentBar segments={segments} />
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-500 dark:text-[var(--muted)]">
                {segments.map((s) => (
                  <span key={s.label} className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                      aria-hidden
                    />
                    {s.label} {s.value}
                  </span>
                ))}
              </div>
            </div>
          </InfrastructureCard>

          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                Recent deployments
              </h2>
              <Link href="/projects" className="text-xs font-medium text-[var(--accent)] hover:underline">
                View all
              </Link>
            </div>
            {deployments.length === 0 ? (
              <InfrastructureCard className="p-8 text-center" hover={false}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-stone-900 dark:text-[var(--foreground)]">
                  No deployments yet
                </p>
                <p className="mt-1 text-sm text-stone-500 dark:text-[var(--muted)]">
                  Ship your first project to the cloud in minutes.
                </p>
                <Link
                  href="/deploy"
                  className="btn-brand mt-4 inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold"
                >
                  Deploy your first project
                </Link>
              </InfrastructureCard>
            ) : (
              <InfrastructureCard className="overflow-hidden p-0" hover={false}>
                <ul className="divide-y divide-[var(--border)]">
                  {deployments.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/projects/${d.id}`}
                        className="flex flex-col gap-2 px-4 py-3 transition hover:bg-[var(--background)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-900 dark:text-[var(--foreground)]">
                            {d.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-[var(--muted)]">
                            {d.url ?? `/${d.slug}`} · {formatWhen(d.createdAt)}
                          </p>
                        </div>
                        <StatusPill
                          tone={
                            d.status === DeploymentStatus.ACTIVE
                              ? "success"
                              : d.status === DeploymentStatus.FAILED
                                ? "danger"
                                : "warning"
                          }
                        >
                          {d.status}
                        </StatusPill>
                      </Link>
                    </li>
                  ))}
                </ul>
              </InfrastructureCard>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {storefront ? (
            <StorefrontSummaryCard
              storefront={storefront}
              verified={storefrontVerified}
              manageHref="/app/storefront"
            />
          ) : (
            <InfrastructureCard className="p-4 sm:p-5" hover={false}>
              <p className="text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
                Your storefront
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-[var(--muted)]">
                Create a public creator store at your @handle.
              </p>
              <Link
                href="/app/storefront"
                className="mt-4 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Set up storefront →
              </Link>
            </InfrastructureCard>
          )}

          <InfrastructureCard className="p-4 sm:p-5" hover={false}>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
              Quick actions
            </h2>
            <div className="mt-3 grid gap-2">
              <QuickAction
                href="/app/ai/blueprint"
                title="AI-assisted builder"
                description="Draft structure and copy with copilot"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                }
              />
              <QuickAction
                href="/listings"
                title="Manage listings"
                description="Publish and price your software"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                }
              />
              <QuickAction
                href="/marketplace"
                title="Browse marketplace"
                description="See what other builders ship"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75H3a.75.75 0 0 0-.75.75V21m0 0h18M2.25 10.5V4.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25M2.25 10.5h18" />
                  </svg>
                }
              />
              <QuickAction
                href="/settings"
                title="Storefront settings"
                description="Theme, bio, and public profile"
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                }
              />
            </div>
          </InfrastructureCard>

          {storefront && storefront.recentFollowers.length > 0 ? (
            <InfrastructureCard className="p-4 sm:p-5" hover={false}>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
                Recent followers
              </h2>
              <ul className="mt-3 space-y-2">
                {storefront.recentFollowers.slice(0, 5).map((f, i) => (
                  <li
                    key={`${f.name}-${f.followedAt}-${i}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate font-medium text-stone-800 dark:text-[var(--foreground)]">
                      {f.name}
                    </span>
                    <span className="shrink-0 text-xs text-stone-500 dark:text-[var(--muted)]">
                      {formatWhen(f.followedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </InfrastructureCard>
          ) : null}

          {!planInfo.proActive ? (
            <InfrastructureCard className="border-dashed p-4 sm:p-5" hover={false}>
              <p className="text-sm text-stone-800 dark:text-[var(--foreground)]">
                <span className="font-semibold">Free plan</span> — {planInfo.usedSlots}/{planInfo.maxFree}{" "}
                deployment slot{planInfo.usedSlots === 1 ? "" : "s"} in use
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-[var(--muted)]">
                Unlock more slots, priority deploys, and advanced analytics with Pro.
              </p>
              <Link
                href="/payouts"
                className="mt-3 inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/30"
              >
                Upgrade &amp; billing
              </Link>
            </InfrastructureCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
