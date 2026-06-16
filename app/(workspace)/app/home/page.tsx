import Link from "next/link";
import { PurchaseStatus, LicenseKind } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { prisma } from "@/lib/prisma";
import { getAppOpenUrlForSoftware } from "@/lib/portal/resolve-app-open-url";
import { DeveloperAccessNotice } from "@/components/app/developer-access-notice";

function statusLabel(
  status: PurchaseStatus,
  kind: LicenseKind,
  validUntil: Date | null,
): { line: string; warn?: boolean } {
  if (status === PurchaseStatus.REFUNDED) return { line: "Refunded" };
  if (status === PurchaseStatus.CANCELED) return { line: "Canceled" };
  if (status === PurchaseStatus.PENDING) return { line: "Payment pending" };
  if (status === PurchaseStatus.EXPIRED) return { line: "Expired", warn: true };
  if (status === PurchaseStatus.ACTIVE) {
    if (kind === LicenseKind.SUBSCRIPTION && validUntil) {
      const d = new Date(validUntil);
      const soon = d.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
      return {
        line: `Subscription — renews ${d.toLocaleDateString()}`,
        warn: soon,
      };
    }
    return { line: kind === LicenseKind.SUBSCRIPTION ? "Subscription (active)" : "Active" };
  }
  return { line: status };
}

export default async function PortalHomePage() {
  const session = await getSession();
  if (!session) return null;
  const canDeploy = userCanDeploy(session.role);
  const firstName = session.name.split(/\s+/)[0] ?? "there";

  const [purchases, ownedIds] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        userId: session.id,
        status: { in: [PurchaseStatus.ACTIVE, PurchaseStatus.PENDING, PurchaseStatus.EXPIRED] },
      },
      include: { software: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    prisma.purchase.findMany({
      where: { userId: session.id },
      select: { softwareId: true },
    }),
  ]);

  const ownedSet = new Set(ownedIds.map((o) => o.softwareId));
  const notIn = [...ownedSet];
  const recs = await prisma.software.findMany({
    ...(notIn.length > 0 ? { where: { id: { notIn } } } : {}),
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const activeEntitlements = purchases.filter((p) => p.status === PurchaseStatus.ACTIVE);
  const subActive = activeEntitlements.filter(
    (p) => p.licenseKind === LicenseKind.SUBSCRIPTION,
  ).length;
  const expiringSoon = purchases.filter(
    (p) =>
      p.status === PurchaseStatus.ACTIVE &&
      p.licenseKind === LicenseKind.SUBSCRIPTION &&
      p.validUntil &&
      p.validUntil > now &&
      p.validUntil.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;

  const recent = purchases.slice(0, 3);
  const openUrls: Record<string, string | null> = {};
  for (const p of recent) {
    if (!p.software) continue;
    // eslint-disable-next-line no-await-in-loop
    openUrls[p.softwareId] = await getAppOpenUrlForSoftware(p.softwareId);
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Welcome back, {firstName} <span className="inline-block" aria-hidden>👋</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
          {canDeploy
            ? "Software you own — web, Play Store, and App Store access from the same account as your studio."
            : "Your software library and access center—open what you own and discover more."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {canDeploy ? (
            <Link
              href="/app"
              className="inline-flex h-9 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
            >
              Command center
            </Link>
          ) : null}
          <Link
            href="/app/my-software"
            className="inline-flex h-9 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
          >
            My software
          </Link>
          <Link
            href="/app/marketplace"
            className="inline-flex h-9 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm shadow-[var(--accent-glow)] transition hover:bg-[var(--accent-hover)]"
          >
            Explore marketplace
          </Link>
        </div>
      </section>

      {!canDeploy ? <DeveloperAccessNotice /> : null}

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">At a glance</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--muted)]">Purchases (active)</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {activeEntitlements.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--muted)]">Active subscriptions</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{subActive}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--muted)]">Expiring in 7 days</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {expiringSoon}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Recently used</h2>
        {recent.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            Nothing here yet.{" "}
            <Link href="/app/marketplace" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
              Browse the marketplace
            </Link>{" "}
            to add software to your library.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((p) => {
              if (!p.software) return null;
              const { line, warn } = statusLabel(p.status, p.licenseKind, p.validUntil);
              const open = openUrls[p.softwareId];
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{p.software.name}</p>
                    <p
                      className={`text-xs ${
                        warn ? "text-amber-700 dark:text-amber-300" : "text-[var(--muted)]"
                      }`}
                    >
                      {line}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {open ? (
                      <a
                        href={open}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent)]"
                      >
                        Open
                      </a>
                    ) : null}
                    <Link
                      href={`/app/my-software/${p.softwareId}`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
                    >
                      Details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">For you</h2>
        {recs.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">More recommendations soon.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/software/${s.id}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/40"
                >
                  <p className="font-medium text-[var(--foreground)]">{s.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{s.description}</p>
                  <p className="mt-2 text-sm font-medium text-[var(--accent)]">View →</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
