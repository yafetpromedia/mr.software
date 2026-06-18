import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, Package, Settings2, Sparkles } from "lucide-react";
import { StorefrontAnalyticsPanel } from "@/components/app/storefront-analytics-panel";
import { StorefrontSummaryCard } from "@/components/app/storefront-summary-card";
import { StorefrontSettingsForm } from "@/components/app/storefront-settings-form";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { getOwnStorefront, getStorefrontAnalytics } from "@/lib/storefront/storefront";

export const metadata = {
  title: "Storefront",
  description: "Manage your public creator store, brand, and analytics.",
};

export default async function StorefrontManagePage() {
  const session = await getSession();
  if (!session) notFound();
  assertDeveloperPortalUser(session);

  const [storefront, analytics, storefrontRecord] = await Promise.all([
    getOwnStorefront(session.id),
    getStorefrontAnalytics(session.id),
    prisma.developerStorefront.findUnique({
      where: { userId: session.id },
      select: { verified: true, featured: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Creator store
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Storefront
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
              Your public store at{" "}
              <code className="rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 text-xs">
                mr.software/@{analytics?.handle ?? "handle"}
              </code>
              . Brand it, list products, and track real views and followers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/listings"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
            >
              <Package className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              Manage products
            </Link>
            {storefront ? (
              <Link
                href={storefront.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand btn-brand-shine inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
              >
                View live store
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {analytics ? (
        <StorefrontSummaryCard
          storefront={analytics}
          verified={storefrontRecord?.verified ?? false}
          manageHref="/app/storefront"
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">Create your storefront</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Pick a handle below to launch your public creator store. Add products from My listings once
            it is live.
          </p>
        </div>
      )}

      {storefrontRecord?.featured ? (
        <p className="flex items-center gap-2 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-muted)]/40 px-4 py-3 text-sm text-[var(--foreground)]">
          <Sparkles className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
          Your storefront is featured on the Mr.Software landing page.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="modern-card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
              <Settings2 className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Store settings</h2>
              <p className="text-xs text-[var(--muted)]">Handle, theme, bio, and visibility.</p>
            </div>
          </div>
          <StorefrontSettingsForm initial={storefront} />
        </section>

        <section className="modern-card space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
              <BarChart3 className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Analytics</h2>
              <p className="text-xs text-[var(--muted)]">
                Real views, followers, revenue, and recent activity.
              </p>
            </div>
          </div>
          {analytics ? (
            <StorefrontAnalyticsPanel analytics={analytics} />
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Save your storefront settings to start tracking views and followers.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
