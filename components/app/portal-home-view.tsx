import Link from "next/link";
import { ArrowRight, Clock, ExternalLink, Package, Sparkles, Store } from "lucide-react";
import { DeveloperAccessNotice } from "@/components/app/developer-access-notice";

type RecentItem = {
  id: string;
  softwareId: string;
  name: string;
  statusLine: string;
  warn?: boolean;
  openUrl: string | null;
};

type RecItem = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  firstName: string;
  canDeploy: boolean;
  showDeployNotice?: boolean;
  stats: {
    activePurchases: number;
    activeSubscriptions: number;
    expiringSoon: number;
  };
  recent: RecentItem[];
  recommendations: RecItem[];
};

export function PortalHomeView({
  firstName,
  canDeploy,
  showDeployNotice = false,
  stats,
  recent,
  recommendations,
}: Props) {
  const statCards = [
    {
      label: "Active purchases",
      value: stats.activePurchases,
      icon: Package,
      hint: "Software you own",
    },
    {
      label: "Subscriptions",
      value: stats.activeSubscriptions,
      icon: Sparkles,
      hint: "Recurring licenses",
    },
    {
      label: "Expiring soon",
      value: stats.expiringSoon,
      icon: Clock,
      hint: "Within 7 days",
      accent: stats.expiringSoon > 0,
    },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--accent)]/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Your library
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
            {canDeploy
              ? "Software you own — web, Play Store, and App Store access from the same account as your studio."
              : "Open what you own, track subscriptions, and discover more from the marketplace."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {canDeploy ? (
              <Link
                href="/app"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
              >
                Command center
              </Link>
            ) : null}
            <Link
              href="/app/my-software"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
            >
              <Package className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              My software
            </Link>
            <Link
              href="/app/marketplace"
              className="btn-brand btn-brand-shine inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
            >
              <Store className="h-4 w-4" aria-hidden />
              Explore marketplace
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {showDeployNotice ? <DeveloperAccessNotice /> : null}

      {/* Stats */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          At a glance
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`modern-card group p-5 ${
                  "accent" in card && card.accent ? "border-amber-500/30 bg-amber-500/[0.04]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)] transition group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent-muted)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
                    {card.value}
                  </p>
                </div>
                <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">{card.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{card.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recently used */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Recently used
          </h2>
          {recent.length > 0 ? (
            <Link
              href="/app/my-software"
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
              <Package className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-[var(--foreground)]">Your library is empty</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--muted)]">
              Browse the marketplace to add software you can open anytime.
            </p>
            <Link
              href="/app/marketplace"
              className="btn-brand mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {recent.map((item) => (
              <li
                key={item.id}
                className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/25 hover:shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-sm font-bold text-[var(--accent)]">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--foreground)]">{item.name}</p>
                    <p
                      className={`text-xs ${
                        item.warn ? "font-medium text-amber-700 dark:text-amber-300" : "text-[var(--muted)]"
                      }`}
                    >
                      {item.statusLine}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  {item.openUrl ? (
                    <a
                      href={item.openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent)]"
                    >
                      Open
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : null}
                  <Link
                    href={`/app/my-software/${item.softwareId}`}
                    className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
                  >
                    Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          For you
        </h2>
        {recommendations.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">More recommendations soon.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/software/${s.id}`}
                  className="modern-card group block h-full p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)] transition group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent-muted)]">
                    <Store className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="mt-4 font-semibold text-[var(--foreground)]">{s.name}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                    {s.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                    View product
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
