import { Eye, Package, TrendingUp, Users } from "lucide-react";
import { formatPublicRevenue } from "@/lib/storefront/format-public-revenue";
import type { StorefrontAnalytics } from "@/lib/storefront/storefront";

type Props = {
  analytics: StorefrontAnalytics;
};

export function StorefrontAnalyticsPanel({ analytics }: Props) {
  const statCards = [
    {
      label: "Product views",
      value: analytics.totalProductViews.toLocaleString(),
      icon: Eye,
      hint: "Across all your listings",
    },
    {
      label: "Followers",
      value: analytics.followerCount.toLocaleString(),
      icon: Users,
      hint: "People following your store",
    },
    {
      label: "Products",
      value: analytics.productCount.toLocaleString(),
      icon: Package,
      hint: "Listed in your store",
    },
    {
      label: "Lifetime revenue",
      value: formatPublicRevenue(analytics.totalRevenueCents, analytics.revenueCurrency),
      icon: TrendingUp,
      hint: analytics.showRevenuePublic ? "Visible on your store" : "Hidden from public store",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-4 transition hover:border-[var(--accent)]/25"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {stat.label}
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">{stat.hint}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
                <stat.icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Recent followers
        </p>
        {analytics.recentFollowers.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {analytics.recentFollowers.map((follower, index) => (
              <li
                key={`${follower.name}-${follower.followedAt}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)]/60 bg-[var(--surface)] px-3 py-2.5 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent)]">
                    {follower.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate font-medium text-[var(--foreground)]">{follower.name}</span>
                </div>
                <time
                  dateTime={follower.followedAt}
                  className="shrink-0 text-xs text-[var(--muted)]"
                >
                  {new Date(follower.followedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            No followers yet. Share your store link — anyone with a Mr.Software account can follow you
            from your public page.
          </p>
        )}
      </div>
    </div>
  );
}
