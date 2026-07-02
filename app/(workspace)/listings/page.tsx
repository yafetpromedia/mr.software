import Link from "next/link";
import { ArrowRight, Package, Store } from "lucide-react";
import { ListingCreateForm } from "@/components/app/listing-create-form";
import { DeveloperListingsPanel } from "@/components/app/developer-listings-panel";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { assertCanUploadSoftware } from "@/lib/auth/governance";
import { categoryLabel } from "@/lib/marketplace/categories";
import { prisma } from "@/lib/prisma";
import { getOwnStorefront } from "@/lib/storefront/storefront";
import { countPublishedProducts, getUserPlan } from "@/lib/subscription/limits";
import { getPlanCapabilities } from "@/lib/subscription/capabilities";

export const metadata = { title: "My listings" };

export default async function ListingsPage() {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);

  const [items, storefront, uploadGate, plan, publishedCount] = await Promise.all([
    prisma.software.findMany({
      where: { developerId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    getOwnStorefront(session.id),
    Promise.resolve(assertCanUploadSoftware(session)),
    getUserPlan(session.id),
    countPublishedProducts(session.id),
  ]);

  const caps = getPlanCapabilities(plan);
  const canUpload = uploadGate.ok;
  const canUploadSource = caps.sourceCodeListing;

  const serializedListings = items.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    pricingModel: s.pricingModel,
    priceCents: s.priceCents,
    currency: s.currency,
    category: s.category,
    categoryLabel: categoryLabel(s.category),
    thumbnailUrl: s.thumbnailUrl,
    published: s.published,
  }));

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
              Marketplace
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              My listings
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
              Publish products to the public catalog at{" "}
              <Link href="/marketplace" className="font-medium text-[var(--accent)] hover:underline">
                /marketplace
              </Link>
              . They also appear on your storefront when you have one.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/app/storefront"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)]"
            >
              <Store className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              {storefront ? "Storefront" : "Create storefront"}
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition hover:border-[var(--accent)]/35"
            >
              Browse marketplace
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="modern-card grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--accent)]">
            1
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Create storefront</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
              Pick your @handle at{" "}
              <Link href="/app/storefront" className="text-[var(--accent)] hover:underline">
                /app/storefront
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--accent)]">
            2
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Publish a product</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
              Add name, price, and description below — it goes live immediately.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--accent)]">
            3
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Deploy &amp; sell</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
              Host builds from{" "}
              <Link href="/deploy" className="text-[var(--accent)] hover:underline">
                Deploy
              </Link>{" "}
              and collect checkout revenue.
            </p>
          </div>
        </div>
      </section>

      {!storefront ? (
        <p className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-muted)]/40 px-4 py-3 text-sm text-[var(--foreground)]">
          Tip: create your storefront first so buyers see your brand at{" "}
          <code className="rounded bg-[var(--background)] px-1.5 py-0.5 text-xs">mr.software/@handle</code>.
        </p>
      ) : null}

      <section className="modern-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
            <Package className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">New listing</h2>
            <p className="text-xs text-[var(--muted)]">
              Appears on the marketplace and your storefront product grid.
            </p>
          </div>
        </div>

        {canUpload ? (
          <ListingCreateForm
            defaultCurrency="etb"
            canUploadSource={canUploadSource}
            publishedCount={publishedCount}
            maxPublishedProducts={caps.maxPublishedProducts}
          />
        ) : (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            {uploadGate.message}. Contact an admin if you need upload access restored.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Your products ({items.length})
        </h2>

        {items.length === 0 ? (
          <DeveloperListingsPanel initialListings={[]} />
        ) : (
          <DeveloperListingsPanel initialListings={serializedListings} />
        )}
      </section>
    </div>
  );
}
