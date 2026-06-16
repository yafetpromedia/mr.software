"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LandingContainer } from "@/components/landing/landing-ui";
import type { SoftwareItem } from "@/lib/software-item";

type Props = {
  products: SoftwareItem[];
  totalCount: number;
};

export function LandingMarketplaceSpotlight({ products, totalCount }: Props) {
  const reduce = useReducedMotion();
  const rows = products.slice(0, 4);

  return (
    <section
      id="marketplace"
      className="scroll-mt-20 border-t border-[var(--border)] py-12 sm:py-16"
      aria-labelledby="marketplace-heading"
    >
      <LandingContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center gap-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Marketplace
              </p>
              {totalCount > 0 ? (
                <span className="ml-2 rounded-full bg-[var(--surface-elevated)] px-2 py-0.5 text-[0.6rem] font-medium tabular-nums text-[var(--muted)] ring-1 ring-[var(--border)]">
                  {totalCount}
                </span>
              ) : null}
            </div>
            <h2
              id="marketplace-heading"
              className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-[1.65rem]"
            >
              Discover builder products
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Templates and tools from creators. Pay with Chapa, Telebirr, or Stripe.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                href="/marketplace"
                className="btn-brand inline-flex h-9 items-center rounded-full px-5 text-sm font-medium"
              >
                Explore
              </Link>
              <Link
                href="/listings"
                className="inline-flex h-9 items-center rounded-full border border-[var(--border)] bg-transparent px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--foreground)]/25 hover:bg-[var(--surface)]"
              >
                Sell
              </Link>
            </div>
            {totalCount > 0 ? (
              <Link
                href="/marketplace"
                className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                View full catalog
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ) : null}
          </motion.div>

          {rows.length > 0 ? (
            <motion.ul
              className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 shadow-[var(--shadow-card)] backdrop-blur-sm"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.06 }}
            >
              {rows.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/software/${item.id}`}
                    className="group flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--surface-elevated)]/50 sm:gap-4 sm:px-5 sm:py-3.5"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--background)] ring-1 ring-[var(--border)]">
                      <Image
                        src={item.thumbnailUrl}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">
                          {item.name}
                        </p>
                        <span className="hidden rounded-md bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[0.6rem] font-medium text-[var(--muted)] sm:inline">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                        {item.developerHandle ? `@${item.developerHandle}` : item.developerName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          item.priceType === "free" ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--foreground)]"
                        }`}
                      >
                        {item.priceType === "free" ? "Free" : item.price}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--muted)] transition group-hover:bg-[var(--accent-muted)] group-hover:text-[var(--accent)]" aria-hidden>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </motion.ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
              No listings yet.{" "}
              <Link href="/listings" className="font-medium text-[var(--accent)] hover:underline">
                Be the first to sell
              </Link>
            </div>
          )}
        </div>
      </LandingContainer>
    </section>
  );
}
