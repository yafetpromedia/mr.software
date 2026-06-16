import Link from "next/link";
import { PurchaseStatus, LicenseKind } from "@prisma/client";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getAppOpenUrlForSoftware } from "@/lib/portal/resolve-app-open-url";

function statusText(
  status: PurchaseStatus,
  kind: LicenseKind,
  validUntil: Date | null,
): string {
  if (status === PurchaseStatus.EXPIRED) return "Expired";
  if (status === PurchaseStatus.PENDING) return "Pending";
  if (status === PurchaseStatus.CANCELED) return "Canceled";
  if (status === PurchaseStatus.REFUNDED) return "Refunded";
  if (status !== PurchaseStatus.ACTIVE) return status;
  if (kind === LicenseKind.SUBSCRIPTION && validUntil) {
    return `Subscription active · renews ${new Date(validUntil).toLocaleDateString()}`;
  }
  return "Active";
}

export default async function MySoftwarePage() {
  const session = await getSession();
  if (!session) notFound();

  const items = await prisma.purchase.findMany({
    where: { userId: session.id },
    include: { software: true },
    orderBy: { updatedAt: "desc" },
  });

  const openUrls: Record<string, string | null> = {};
  for (const p of items) {
    if (p.status !== PurchaseStatus.ACTIVE) continue;
    if (!p.software) continue;
    // eslint-disable-next-line no-await-in-loop
    openUrls[p.softwareId] = await getAppOpenUrlForSoftware(p.softwareId);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">My software</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Everything you have purchased or subscribed to—open hosted apps and manage access.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
          No software in your library yet.{" "}
          <Link href="/app/marketplace" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
            Browse the marketplace
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => {
            if (!p.software) return null;
            const st = statusText(p.status, p.licenseKind, p.validUntil);
            const canOpen = p.status === PurchaseStatus.ACTIVE;
            const href = openUrls[p.softwareId];
            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-semibold text-[var(--foreground)]">{p.software.name}</h2>
                  <p className="text-sm text-[var(--muted)]">{st}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canOpen && href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent)]"
                    >
                      Open
                    </a>
                  ) : p.status === PurchaseStatus.EXPIRED ? (
                    <span className="inline-flex h-9 items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-4 text-sm font-medium text-amber-900 dark:text-amber-200">
                      Expired
                    </span>
                  ) : null}
                  <Link
                    href={`/app/my-software/${p.softwareId}`}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
                  >
                    {canOpen ? "Details" : "View"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
