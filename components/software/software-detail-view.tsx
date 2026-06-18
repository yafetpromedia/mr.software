import Image from "next/image";
import Link from "next/link";
import { SoftwarePurchaseActions } from "@/components/software-purchase-actions";
import { ProductPlatformLinks } from "@/components/software/product-platform-links";
import { VerifiedBadge } from "@/components/storefront/verified-badge";
import { hasMobileStores, platformSummary } from "@/lib/software-platforms";
import type { SoftwareItem } from "@/lib/software-item";

type Props = {
  item: SoftwareItem;
  developerVerified: boolean;
  entitled: boolean;
  hasSession: boolean;
  isOwner: boolean;
  stripeConfigured: boolean;
  chapaConfigured: boolean;
  telebirrEnabled: boolean;
  devCheckoutEnabled: boolean;
};

function pricingLabel(item: SoftwareItem) {
  if (item.priceType === "free") return "Free";
  if (item.pricingModel === "SUBSCRIPTION") return `${item.price} / mo`;
  return item.price;
}

export function SoftwareDetailView({
  item,
  developerVerified,
  entitled,
  hasSession,
  isOwner,
  stripeConfigured,
  chapaConfigured,
  telebirrEnabled,
  devCheckoutEnabled,
}: Props) {
  const isFree = item.priceType === "free";
  const isSubscription = item.pricingModel === "SUBSCRIPTION";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full overflow-x-hidden border-t border-stone-200 bg-[var(--background)] dark:border-[var(--border)]">
      <div
        className="bg-grid-pattern pointer-events-none fixed inset-0 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_100%_80%_at_50%_-10%,black_20%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Marketplace
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-10">
          <div className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[var(--shadow-card)] dark:border-[var(--border)] dark:bg-[var(--surface)] sm:rounded-3xl">
              <div className="relative aspect-[16/9] w-full bg-stone-100 dark:bg-[var(--background)] sm:aspect-[2/1]">
                <Image
                  src={item.thumbnailUrl}
                  alt={`${item.name} cover`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 56rem"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                  aria-hidden
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
                      {item.category}
                    </span>
                    {isSubscription ? (
                      <span className="rounded-lg bg-violet-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        Subscription
                      </span>
                    ) : null}
                    {isFree ? (
                      <span className="rounded-lg bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        Free
                      </span>
                    ) : null}
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
                    {item.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {item.shortDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-[var(--muted)]">
                About
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-[1.75] text-stone-800 dark:text-[var(--foreground)]">
                {item.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Views", value: (item.viewCount ?? 0).toLocaleString() },
                { label: "License", value: isFree ? "Free to use" : isSubscription ? "Monthly" : "One-time" },
                { label: "Platforms", value: platformSummary(item) },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-[var(--border)] dark:bg-[var(--surface)]"
                >
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                    {chip.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
                    {chip.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[var(--shadow-card)] dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <div className="border-b border-stone-100 bg-stone-50 px-5 py-4 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/50">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                  Get this product
                </p>
                <p className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)]">
                  {pricingLabel(item)}
                </p>
                {!isFree && isSubscription ? (
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-[var(--muted)]">Billed monthly</p>
                ) : null}
              </div>
              <div className="p-5">
                <SoftwarePurchaseActions
                  softwareId={item.id}
                  pricingModel={item.pricingModel}
                  entitled={entitled}
                  hasSession={hasSession}
                  isOwner={isOwner}
                  stripeConfigured={stripeConfigured}
                  stripePriceId={item.stripePriceId}
                  chapaConfigured={chapaConfigured}
                  telebirrEnabled={telebirrEnabled}
                  priceCents={item.priceCents}
                  currency={item.currency}
                  devCheckoutEnabled={devCheckoutEnabled}
                  embedded
                />
              </div>
            </div>

            {hasMobileStores(item) ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <ProductPlatformLinks platforms={item} />
              </div>
            ) : null}

            {item.developerHandle ? (
              <Link
                href={`/@${item.developerHandle}`}
                className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)]/35"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-lg font-bold text-orange-600 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]">
                  {item.developerName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-bold text-stone-900 dark:text-[var(--foreground)]">
                      {item.developerName}
                    </p>
                    {developerVerified ? <VerifiedBadge size="sm" /> : null}
                  </div>
                  <p className="font-mono text-xs text-stone-500 dark:text-[var(--muted)]">
                    @{item.developerHandle}
                  </p>
                </div>
                <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
