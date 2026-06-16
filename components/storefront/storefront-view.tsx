import { VerifiedAvatarMark, VerifiedBadge } from "@/components/storefront/verified-badge";
import Link from "next/link";
import { SoftwareCard } from "@/components/software-card";
import { StorefrontFollowButton } from "@/components/storefront/storefront-client";
import { formatPublicRevenue } from "@/lib/storefront/format-public-revenue";
import {
  getStorefrontTheme,
  storefrontBannerUsesLightText,
} from "@/lib/storefront/themes";
import type { PublicStorefront } from "@/lib/storefront/storefront";

function Metric({
  label,
  value,
  lightText,
}: {
  label: string;
  value: string | number;
  lightText?: boolean;
}) {
  return (
    <div className="min-w-[4.5rem] text-center sm:text-left">
      <p
        className={`font-display text-xl font-bold tabular-nums tracking-tight sm:text-2xl ${
          lightText ? "text-white" : "text-stone-900 dark:text-stone-100"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
          lightText ? "text-white/90" : "text-stone-600 dark:text-stone-400"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export function StorefrontView({
  store,
  isStoreOwner,
}: {
  store: PublicStorefront;
  isStoreOwner: boolean;
}) {
  const theme = getStorefrontTheme(store.theme);
  const isMidnight = store.theme === "MIDNIGHT";
  const isMinimal = store.theme === "MINIMAL";
  const lightBannerText = storefrontBannerUsesLightText(store.theme);
  const subtitle = store.tagline ?? "Developer storefront on Mr.Software";
  const revenueLabel =
    store.publicRevenueCents != null
      ? formatPublicRevenue(store.publicRevenueCents, store.revenueCurrency ?? "usd")
      : null;

  const metrics = [
    { label: "Views", value: store.viewCount.toLocaleString() },
    { label: "Followers", value: store.followerCount.toLocaleString() },
    { label: "Products", value: store.productCount },
    ...(revenueLabel ? [{ label: "Earned", value: revenueLabel }] : []),
  ];

  const text = {
    title: isMidnight ? "text-zinc-50" : "text-stone-900 dark:text-stone-50",
    body: isMidnight ? "text-zinc-300" : "text-stone-600 dark:text-stone-400",
    handle: isMidnight ? "text-zinc-400" : "text-stone-500 dark:text-stone-400",
    section: isMidnight ? "text-zinc-100" : "text-stone-900 dark:text-stone-50",
    sectionMuted: isMidnight ? "text-zinc-400" : "text-stone-600 dark:text-stone-400",
    profileBg: isMidnight ? "bg-zinc-900" : "bg-white dark:bg-[var(--surface)]",
    avatarRing: isMidnight ? "ring-zinc-900" : "ring-white dark:ring-[var(--surface)]",
  };

  return (
    <div
      data-storefront-theme={store.theme}
      className={`min-h-[calc(100vh-3.5rem)] w-full overflow-x-hidden border-t border-[var(--border)] ${theme.page}`}
    >
      {!isMidnight ? (
        <div
          className="bg-grid-pattern pointer-events-none fixed inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_100%_80%_at_50%_-10%,black_20%,transparent_70%)]"
          aria-hidden
        />
      ) : (
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/25 via-zinc-950 to-zinc-950"
          aria-hidden
        />
      )}

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 sm:pt-8">
          <Link
            href="/marketplace"
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
              isMidnight
                ? "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-violet-500/40 hover:text-violet-300"
                : "border-stone-200 bg-white text-stone-800 hover:border-orange-300 hover:text-orange-600 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)]"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Marketplace
          </Link>
          {isStoreOwner ? (
            <Link
              href="/settings"
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                isMidnight
                  ? "border-zinc-600 bg-zinc-800 text-zinc-100 hover:border-violet-500/40"
                  : "border-stone-200 bg-white text-stone-900 hover:border-orange-300 dark:border-[var(--border)] dark:bg-[var(--surface)]"
              }`}
            >
              Edit storefront
            </Link>
          ) : null}
        </div>

        <header
          className={`mt-5 overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] sm:mt-6 sm:rounded-3xl ${
            isMidnight ? "border-zinc-800" : "border-stone-200 dark:border-[var(--border)]"
          }`}
        >
          <div className={`relative min-h-[10rem] sm:min-h-[11.5rem] ${theme.header}`}>
            {lightBannerText ? <div className="storefront-banner-shine" aria-hidden /> : null}
            {lightBannerText ? (
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
                }}
                aria-hidden
              />
            ) : null}
            <div className="relative flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 md:flex-row md:items-start md:justify-between md:px-8 md:py-7">
              <div className="flex flex-wrap items-center gap-2">
                {store.featured ? (
                  <span
                    className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${theme.bannerBadge}`}
                  >
                    Featured creator
                  </span>
                ) : null}
                {store.verified ? (
                  <VerifiedBadge variant={lightBannerText ? "onColor" : "default"} />
                ) : null}
              </div>
              <div
                className={`grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-6 lg:gap-8 ${
                  isMinimal
                    ? "rounded-xl border border-stone-200 bg-white/90 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
                    : ""
                }`}
              >
                {metrics.map((m) => (
                  <Metric key={m.label} label={m.label} value={m.value} lightText={lightBannerText} />
                ))}
              </div>
            </div>
          </div>

          <div className={`${text.profileBg} px-4 pb-5 pt-0 sm:px-6 sm:pb-7 md:px-8`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-6">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <div
                    className={`-mt-8 flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-bold ring-4 sm:-mt-10 sm:h-20 sm:w-20 sm:text-3xl md:h-24 md:w-24 md:text-4xl ${text.avatarRing} ${theme.avatar}`}
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  {store.verified ? <VerifiedAvatarMark /> : null}
                </div>
                <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-[var(--accent)]">
                    Developer store
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h1 className={`text-xl font-bold tracking-tight sm:text-2xl md:text-3xl ${text.title}`}>
                      {store.name}
                    </h1>
                    {store.verified ? (
                      <VerifiedBadge variant={isMidnight ? "light" : "default"} size="sm" />
                    ) : null}
                  </div>
                  <p className={`mt-1 font-mono text-sm ${text.handle}`}>@{store.handle}</p>
                  <p className={`mt-2 max-w-2xl text-sm leading-relaxed sm:mt-3 sm:text-base ${text.body}`}>
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 md:items-end md:pt-1">
                <StorefrontFollowButton
                  handle={store.handle}
                  initialFollowing={store.isFollowing ?? false}
                  initialCount={store.followerCount}
                  isOwner={isStoreOwner}
                  variant={isMidnight ? "midnight" : "default"}
                />
                {store.website ? (
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm font-medium transition ${
                      isMidnight ? "text-zinc-400 hover:text-violet-400" : "text-stone-600 hover:text-orange-600 dark:text-[var(--muted)]"
                    }`}
                  >
                    Website ↗
                  </a>
                ) : null}
              </div>
            </div>

            {store.bio ? (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-relaxed sm:mt-6 ${
                  isMidnight
                    ? "border-zinc-700 bg-zinc-800 text-zinc-200"
                    : "border-orange-200 bg-orange-50 text-stone-800 dark:border-[var(--accent)]/25 dark:bg-[var(--accent-muted)] dark:text-[var(--foreground)]"
                }`}
              >
                {store.bio}
              </div>
            ) : null}
          </div>
        </header>

        <section className="mt-8 sm:mt-10 lg:mt-12" aria-labelledby="store-products-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 id="store-products-heading" className={`text-lg font-bold tracking-tight sm:text-2xl ${text.section}`}>
                  Products
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${
                    isMidnight
                      ? "bg-zinc-800 text-zinc-200"
                      : "bg-orange-100 text-orange-800 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]"
                  }`}
                >
                  {store.productCount}
                </span>
              </div>
              <p className={`mt-1 text-sm ${text.sectionMuted}`}>Software published by {store.name}</p>
            </div>
            <Link
              href="/marketplace"
              className={`shrink-0 text-sm font-semibold transition ${
                isMidnight ? "text-violet-400 hover:text-violet-300" : "text-orange-700 hover:underline dark:text-[var(--accent)]"
              }`}
            >
              Browse all marketplace →
            </Link>
          </div>

          {store.products.length > 0 ? (
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {store.products.map((item) => (
                <li key={item.id} className="min-w-0">
                  <SoftwareCard item={item} hideDeveloper />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className={`mt-6 rounded-2xl border border-dashed px-4 py-12 text-center sm:mt-8 sm:px-6 sm:py-16 ${
                isMidnight
                  ? "border-zinc-700 bg-zinc-900/50 text-zinc-300"
                  : "border-stone-200 bg-white text-stone-600 dark:border-[var(--border)] dark:bg-[var(--surface)]"
              }`}
            >
              <p className={`text-sm font-medium ${isMidnight ? "text-zinc-200" : "text-stone-900 dark:text-[var(--foreground)]"}`}>
                No products listed yet
              </p>
              <p className="mt-1 text-xs">Check back soon for new releases.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
