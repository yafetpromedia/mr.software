"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SoftwareItem } from "@/lib/software-item";
import { SoftwareCard } from "@/components/software-card";
import { SOFTWARE_CATEGORY_LABELS } from "@/lib/marketplace/categories";

function filterItems(items: SoftwareItem[], query: string, category: string): SoftwareItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchCat = category === "All" || item.category === category;
    if (!q) return matchCat;
    const haystack = `${item.name} ${item.shortDescription} ${item.category}`.toLowerCase();
    return matchCat && haystack.includes(q);
  });
}

type SortKey = "default" | "name" | "freeFirst";

function sortItems(items: SoftwareItem[], sort: SortKey): SoftwareItem[] {
  const arr = [...items];
  if (sort === "name") {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "freeFirst") {
    arr.sort((a, b) => {
      const af = a.priceType === "free" ? 0 : 1;
      const bf = b.priceType === "free" ? 0 : 1;
      if (af !== bf) return af - bf;
      return a.name.localeCompare(b.name);
    });
  }
  return arr;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-[var(--border)] dark:bg-[var(--surface)]">
      <div className="aspect-[16/10] bg-stone-100 dark:bg-[var(--accent-muted)]" />
      <div className="p-5">
        <div className="h-4 w-3/4 max-w-[14rem] rounded-lg bg-stone-100 dark:bg-[var(--accent-muted)]" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-stone-100 dark:bg-[var(--accent-muted)]" />
          <div className="h-3 w-5/6 rounded bg-stone-100 dark:bg-[var(--accent-muted)]" />
        </div>
      </div>
    </div>
  );
}

type MarketplaceClientProps = {
  initialQuery?: string;
  variant?: "catalog" | "portal";
};

export function MarketplaceClient({ initialQuery, variant = "catalog" }: MarketplaceClientProps) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("default");
  const [items, setItems] = useState<SoftwareItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const portal = variant === "portal";

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/software");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid response");
      setItems(data as SoftwareItem[]);
    } catch (e) {
      console.error(e);
      setError("Could not load listings. Check the database and try again.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (initialQuery != null) setQuery(initialQuery);
  }, [initialQuery]);

  const categories = useMemo(() => {
    const labels = Object.values(SOFTWARE_CATEGORY_LABELS);
    if (!items?.length) return ["All", ...labels] as const;
    const set = new Set(items.map((s) => s.category));
    return ["All", ...Array.from(set).sort()] as const;
  }, [items]);

  const filtered = useMemo(
    () => (items ? filterItems(items, query, category) : []),
    [items, query, category],
  );

  const sorted = useMemo(() => sortItems(filtered, sort), [filtered, sort]);

  const stats = useMemo(() => {
    if (!items?.length) return { total: 0, free: 0 };
    return {
      total: items.length,
      free: items.filter((i) => i.priceType === "free").length,
    };
  }, [items]);

  const showSpotlight =
    items && !query.trim() && category === "All" && items.length >= 3 && sort === "default";

  const spotlightIds = useMemo(() => {
    if (!showSpotlight || !items) return new Set<string>();
    return new Set(items.slice(0, 3).map((i) => i.id));
  }, [showSpotlight, items]);

  const mainList = useMemo(() => {
    if (!showSpotlight) return sorted;
    return sorted.filter((i) => !spotlightIds.has(i.id));
  }, [sorted, showSpotlight, spotlightIds]);

  return (
    <div className={`w-full ${portal ? "pb-12 pt-6 sm:pb-14 sm:pt-8" : "pb-14 pt-8 sm:pb-20 sm:pt-10"}`}>
      <div
        className={`relative overflow-hidden border border-stone-200 bg-white shadow-[var(--shadow-card)] dark:border-[var(--border)] dark:bg-[var(--surface)] ${
          portal ? "rounded-2xl px-5 py-6 sm:px-8 sm:py-8" : "rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-8 sm:py-10 lg:px-10"
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-violet-500/8 blur-3xl" aria-hidden />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]">
              {portal ? "Discover" : "Live catalog"}
            </span>
            {items ? (
              <span className="text-xs font-medium text-stone-500 dark:text-[var(--muted)]">
                {stats.total} listing{stats.total !== 1 ? "s" : ""} · {stats.free} free
              </span>
            ) : null}
          </div>

          {portal ? (
            <>
              <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-3xl">
                Marketplace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-[var(--muted)] sm:text-base">
                Find tools and apps. Checkout supports local currency (e.g. ETB via Chapa) when
                payment is connected.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-5 max-w-3xl font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-4xl sm:leading-tight lg:text-[2.75rem]">
                Your public catalog—
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-violet-600 bg-clip-text text-transparent dark:from-[var(--accent)] dark:to-indigo-300">
                  {" "}
                  built on real infrastructure
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-[var(--muted)] sm:text-base">
                Search, filter, and open product pages — the same listings your APIs and checkout
                already understand.
              </p>
            </>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
            <label className="relative flex min-w-0 flex-1 items-center rounded-xl border border-stone-200 bg-stone-50 shadow-sm transition focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/20 dark:border-[var(--border)] dark:bg-[var(--background)] dark:focus-within:border-[var(--accent)] dark:focus-within:ring-[var(--ring)]">
              <span className="pl-4 text-stone-400 dark:text-[var(--muted)]" aria-hidden>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
              <span className="sr-only">Search software</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories…"
                className="h-12 w-full min-w-0 flex-1 bg-transparent px-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-[var(--foreground)] dark:placeholder:text-[var(--muted)]"
              />
            </label>

            <select
              id="marketplace-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort listings"
              className="h-12 w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition hover:border-orange-300 focus:ring-2 focus:ring-orange-500/20 sm:w-auto sm:min-w-[10.5rem] dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--foreground)]"
            >
              <option value="default">Sort: Featured</option>
              <option value="name">Sort: Name A–Z</option>
              <option value="freeFirst">Sort: Free first</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
          Categories
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-thin sm:flex-wrap sm:overflow-visible">
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={
                  active
                    ? "shrink-0 rounded-full bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/20 dark:bg-[var(--accent)] dark:shadow-[var(--accent-glow)]"
                    : "shrink-0 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 transition hover:border-orange-300 hover:text-stone-900 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)] dark:hover:text-[var(--foreground)]"
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {items && !error ? (
        <p className="mt-6 text-sm text-stone-600 dark:text-[var(--muted)]">
          Showing{" "}
          <span className="font-bold text-stone-900 dark:text-[var(--foreground)]">{sorted.length}</span>{" "}
          {sorted.length === 1 ? "product" : "products"}
          {query.trim() ? (
            <>
              {" "}
              for “<span className="font-medium text-stone-900 dark:text-[var(--foreground)]">{query.trim()}</span>”
            </>
          ) : null}
        </p>
      ) : null}

      {items === null ? (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="min-w-0">
              <SkeletonCard />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white dark:bg-[var(--foreground)] dark:text-[var(--background)]"
          >
            Retry
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-stone-900 dark:text-[var(--foreground)]">No matches</p>
          <p className="mt-2 text-sm text-stone-600 dark:text-[var(--muted)]">Try another search or category.</p>
        </div>
      ) : (
        <>
          {showSpotlight ? (
            <section className="mt-10" aria-labelledby="spotlight-heading">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 id="spotlight-heading" className="text-lg font-bold text-stone-900 dark:text-[var(--foreground)]">
                    Spotlight
                  </h2>
                  <p className="mt-0.5 text-sm text-stone-600 dark:text-[var(--muted)]">
                    Popular picks from the catalog
                  </p>
                </div>
              </div>
              <ul className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {items.slice(0, 3).map((item) => (
                  <li key={item.id} className="min-w-0">
                    <SoftwareCard item={item} featured />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {mainList.length > 0 ? (
            <section className={showSpotlight ? "mt-12" : "mt-8"} aria-labelledby="all-listings-heading">
              <h2 id="all-listings-heading" className="sr-only">
                All listings
              </h2>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mainList.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <SoftwareCard item={item} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
