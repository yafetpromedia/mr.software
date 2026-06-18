import Link from "next/link";
import { ArrowRight, ExternalLink, Eye, Package, Users } from "lucide-react";
import { VerifiedBadge } from "@/components/storefront/verified-badge";
import type { StorefrontAnalytics } from "@/lib/storefront/storefront";

type Props = {
  storefront: StorefrontAnalytics;
  verified?: boolean;
  manageHref?: string;
  className?: string;
};

export function StorefrontSummaryCard({
  storefront,
  verified = false,
  manageHref = "/app/storefront",
  className = "",
}: Props) {
  const stats = [
    { label: "Product views", value: storefront.totalProductViews, icon: Eye },
    { label: "Followers", value: storefront.followerCount, icon: Users },
    { label: "Products", value: storefront.productCount, icon: Package },
  ] as const;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Your storefront
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="font-display text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
                @{storefront.handle}
              </p>
              {verified ? <VerifiedBadge size="sm" /> : null}
            </div>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              Live at{" "}
              <code className="rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 text-xs">
                mr.software/@{storefront.handle}
              </code>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={`/@${storefront.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
            >
              View live
              <ExternalLink className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
            </Link>
            <Link
              href={manageHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Manage
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)]/70 px-3 py-3 text-center transition hover:border-[var(--accent)]/25"
            >
              <dt className="flex items-center justify-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                <stat.icon className="h-3 w-3 text-[var(--accent)]" aria-hidden />
                {stat.label}
              </dt>
              <dd className="mt-1.5 font-display text-xl font-bold tabular-nums text-[var(--foreground)]">
                {stat.value.toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
