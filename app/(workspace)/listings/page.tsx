import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "My listings" };

export default async function ListingsPage() {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);

  const items = await prisma.software.findMany({
    where: { developerId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">My listings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Software you offer on the catalog — web downloads, Play Store &amp; App Store links, and checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)]">
          No products yet. Listings are created with your data model and admin flow; the public product page is at{" "}
          <code className="text-[var(--foreground)]">/software/…</code> when a row exists.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-[var(--foreground)]">{s.name}</p>
                <p className="text-sm text-[var(--muted)]">{s.price} · {s.pricingModel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex h-8 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  Published
                </span>
                <Link
                  href={`/software/${s.id}`}
                  className="inline-flex h-8 items-center rounded-full border border-[var(--border)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
                >
                  View listing
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
