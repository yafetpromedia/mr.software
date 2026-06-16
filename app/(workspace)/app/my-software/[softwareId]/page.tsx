import Link from "next/link";
import { PurchaseStatus, LicenseKind } from "@prisma/client";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getAppOpenUrlForSoftware } from "@/lib/portal/resolve-app-open-url";
import { formatMoneyAmount } from "@/lib/portal/format-amount";

type Props = { params: Promise<{ softwareId: string }> };

export default async function OwnedSoftwareDetailPage({ params }: Props) {
  const { softwareId } = await params;
  const session = await getSession();
  if (!session) notFound();

  const [purchase, software] = await Promise.all([
    prisma.purchase.findFirst({
      where: { userId: session.id, softwareId },
    }),
    prisma.software.findUnique({ where: { id: softwareId } }),
  ]);
  if (!software) notFound();
  if (!purchase) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">You do not have this product in your library.</p>
        <Link
          href={`/software/${softwareId}`}
          className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          View in marketplace
        </Link>
      </div>
    );
  }

  const openUrl = await getAppOpenUrlForSoftware(softwareId);
  const isActive = purchase.status === PurchaseStatus.ACTIVE;
  const isExpired = purchase.status === PurchaseStatus.EXPIRED;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/my-software"
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          ← My software
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {software.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{formatMoneyAmount(purchase.amountCents, purchase.currency)}</p>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">{software.description}</p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Entitlement</dt>
            <dd className="mt-0.5 font-medium text-[var(--foreground)]">
              {purchase.licenseKind === LicenseKind.SUBSCRIPTION ? "Subscription" : "One-time"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Status</dt>
            <dd className="mt-0.5 font-medium text-[var(--foreground)]">{purchase.status}</dd>
          </div>
          {purchase.validUntil ? (
            <div>
              <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Valid until</dt>
              <dd className="mt-0.5 font-medium text-[var(--foreground)]">
                {new Date(purchase.validUntil).toLocaleString()}
              </dd>
            </div>
          ) : null}
          {openUrl ? (
            <div>
              <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">App URL</dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-[var(--accent)]">
                <a href={openUrl} className="underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
                  {openUrl}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        {isActive && openUrl ? (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent)]"
          >
            Open app
          </a>
        ) : null}
        <Link
          href={`/software/${softwareId}`}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
        >
          Public product page
        </Link>
        {isExpired ? (
          <span className="inline-flex h-10 items-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 text-sm font-medium text-amber-900 dark:text-amber-200">
            Subscription expired — renew on the product page when checkout is available.
          </span>
        ) : null}
      </div>
    </div>
  );
}
