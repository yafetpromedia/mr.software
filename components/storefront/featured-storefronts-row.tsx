import Link from "next/link";
import { VerifiedBadge } from "@/components/storefront/verified-badge";
import { listFeaturedStorefronts } from "@/lib/storefront/storefront";

export async function FeaturedStorefrontsRow({
  title = "Featured creators",
  subtitle = "Developer storefronts on Mr.Software",
}: {
  title?: string;
  subtitle?: string;
}) {
  const stores = await listFeaturedStorefronts(6);
  if (stores.length === 0) return null;

  return (
    <section className="pt-8 sm:pt-10" aria-labelledby="featured-stores-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="featured-stores-heading"
            className="text-lg font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-xl"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-[var(--muted)]">{subtitle}</p>
        </div>
        <Link
          href="/marketplace"
          className="shrink-0 text-sm font-semibold text-orange-700 hover:underline dark:text-[var(--accent)]"
        >
          Browse all →
        </Link>
      </div>

      <ul className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-thin sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {stores.map((store) => (
          <li key={store.handle} className="w-[min(100%,18rem)] shrink-0 sm:w-auto">
            <Link
              href={`/@${store.handle}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)]/35"
            >
              <div className="h-1 bg-gradient-to-r from-orange-500/80 to-amber-400/40" aria-hidden />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-display text-lg font-bold text-orange-600 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]"
                    aria-hidden
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate font-bold text-stone-900 group-hover:text-orange-600 dark:text-[var(--foreground)] dark:group-hover:text-[var(--accent)]">
                        {store.name}
                      </p>
                      {store.verified ? <VerifiedBadge size="sm" /> : null}
                    </div>
                    <p className="font-mono text-xs text-stone-500 dark:text-[var(--muted)]">
                      @{store.handle}
                    </p>
                  </div>
                </div>
                {store.tagline ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-[var(--muted)]">
                    {store.tagline}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2 text-[0.65rem] font-semibold text-stone-500 dark:text-[var(--muted)]">
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]">
                    {store.productCount} products
                  </span>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]">
                    {store.followerCount} followers
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
