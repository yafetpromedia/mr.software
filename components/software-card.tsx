import Image from "next/image";
import Link from "next/link";
import { ProductPlatformBadges } from "@/components/software/product-platform-links";
import { hasMobileStores } from "@/lib/software-platforms";
import type { SoftwareItem } from "@/lib/software-item";

type Props = {
  item: SoftwareItem;
  /** Taller spotlight layout for featured row */
  featured?: boolean;
  /** Hide developer handle (e.g. on their storefront page) */
  hideDeveloper?: boolean;
  /** Link product detail inside the signed-in portal */
  linkVariant?: "catalog" | "portal";
};

export function SoftwareCard({ item, featured, hideDeveloper, linkVariant = "catalog" }: Props) {
  const isFree = item.priceType === "free";
  const aspect = featured ? "aspect-[16/10] sm:aspect-[16/9]" : "aspect-[16/10]";
  const detailHref =
    linkVariant === "portal" ? `/app/software/${item.id}` : `/software/${item.id}`;
  const storefrontHref =
    linkVariant === "portal" && item.developerHandle
      ? `/app/store/${item.developerHandle}`
      : item.developerHandle
        ? `/@${item.developerHandle}`
        : null;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-lg hover:shadow-[var(--accent-glow)]/15`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent opacity-0 transition group-hover:opacity-100"
        aria-hidden
      />

      <div className={`relative w-full overflow-hidden bg-[var(--background)] ${aspect}`}>
        <Image
          src={item.thumbnailUrl}
          alt={`${item.name} thumbnail`}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 transition group-hover:opacity-90"
          aria-hidden
        />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
          <span
            className={
              isFree
                ? "inline-flex items-center rounded-lg bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm"
                : "inline-flex items-center rounded-lg bg-white/90 px-2 py-0.5 text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-[var(--accent)]"
            }
          >
            {isFree ? "Free" : item.price}
          </span>
          <span className="rounded-lg bg-black/40 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
            {item.category}
          </span>
          {(item.viewCount ?? 0) > 0 ? (
            <span className="rounded-lg bg-black/40 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
              {(item.viewCount ?? 0).toLocaleString()} views
            </span>
          ) : null}
        </div>
      </div>

      <div className={featured ? "flex flex-1 flex-col p-5 sm:p-6" : "flex flex-1 flex-col p-5"}>
        <h2
          className={`font-semibold tracking-tight text-[var(--foreground)] ${
            featured ? "text-lg sm:text-xl" : "text-base"
          }`}
        >
          {item.name}
        </h2>

        <p
          className={`mt-3 line-clamp-2 flex-1 leading-relaxed text-[var(--muted)] ${
            featured ? "text-sm sm:text-base" : "text-sm"
          }`}
        >
          {item.shortDescription}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <span className="flex min-w-0 flex-col gap-1.5 text-xs text-[var(--muted)]">
            {!hideDeveloper && storefrontHref ? (
              <Link
                href={storefrontHref}
                className="truncate font-medium text-[var(--foreground)]/80 transition hover:text-[var(--accent)]"
              >
                @{item.developerHandle}
              </Link>
            ) : hideDeveloper ? (
              <span>{item.priceType === "free" ? "Free to start" : "Instant license"}</span>
            ) : isFree ? (
              <span>No payment to start</span>
            ) : (
              <span>Commercial license</span>
            )}
            {hasMobileStores(item) ? <ProductPlatformBadges platforms={item} /> : null}
            {(item.viewCount ?? 0) > 0 ? (
              <span className="tabular-nums">{(item.viewCount ?? 0).toLocaleString()} views</span>
            ) : null}
          </span>
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition group-hover:bg-[var(--accent)] group-hover:text-white dark:group-hover:text-white"
          >
            View
            <span aria-hidden className="transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
