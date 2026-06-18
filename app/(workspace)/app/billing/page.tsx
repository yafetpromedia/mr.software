import { LicenseKind, PurchaseStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import {
  BillingDashboard,
  type BillingSubscription,
  type BillingTransaction,
} from "@/components/app/billing-dashboard";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function statusLabel(status: PurchaseStatus, kind: LicenseKind): string {
  if (status === PurchaseStatus.ACTIVE) {
    return kind === LicenseKind.SUBSCRIPTION ? "Active" : "Paid";
  }
  if (status === PurchaseStatus.PENDING) return "Pending";
  if (status === PurchaseStatus.EXPIRED) return "Expired";
  if (status === PurchaseStatus.REFUNDED) return "Refunded";
  if (status === PurchaseStatus.CANCELED) return "Canceled";
  return status;
}

function providerLabel(provider: string | null | undefined): string | null {
  if (!provider) return null;
  if (provider === "CHAPA") return "Chapa";
  if (provider === "STRIPE") return "Stripe";
  if (provider === "TELEBIRR") return "Telebirr";
  if (provider === "DEV_GRANT") return "Dev grant";
}

export const metadata = { title: "Purchases & billing" };

export default async function BillingPage() {
  const session = await getSession();
  if (!session) notFound();

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [rows, workspaceSub] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.id },
      include: { software: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.id },
      select: {
        plan: true,
        status: true,
        amountCents: true,
        billingCurrency: true,
        expiresAt: true,
      },
    }),
  ]);

  const completedRows = rows.filter(
    (row) =>
      row.status === PurchaseStatus.ACTIVE ||
      row.status === PurchaseStatus.EXPIRED ||
      row.status === PurchaseStatus.REFUNDED,
  );

  const totalSpentCents = completedRows.reduce((sum, row) => sum + (row.amountCents ?? 0), 0);
  const monthSpentCents = completedRows
    .filter((row) => row.createdAt >= monthStart)
    .reduce((sum, row) => sum + (row.amountCents ?? 0), 0);

  const activeLicenseCount = rows.filter((row) => row.status === PurchaseStatus.ACTIVE).length;
  const subscriptionCount = rows.filter(
    (row) => row.licenseKind === LicenseKind.SUBSCRIPTION && row.status === PurchaseStatus.ACTIVE,
  ).length;

  const displayCurrency = (
    rows.find((row) => row.currency)?.currency ?? "ETB"
  ).toUpperCase();

  const transactions: BillingTransaction[] = rows.map((row) => ({
    id: row.id,
    softwareId: row.softwareId,
    productName: row.software?.name ?? "Software",
    amountCents: row.amountCents ?? 0,
    currency: (row.currency ?? displayCurrency).toUpperCase(),
    status: row.status,
    statusLabel: statusLabel(row.status, row.licenseKind),
    licenseKind: row.licenseKind,
    provider: providerLabel(row.paymentProvider),
    createdAt: row.createdAt.toISOString(),
    validUntil: row.validUntil?.toISOString() ?? null,
  }));

  const subscriptions: BillingSubscription[] = rows
    .filter((row) => row.licenseKind === LicenseKind.SUBSCRIPTION)
    .map((row) => ({
      id: row.id,
      productName: row.software?.name ?? "Software",
      status: row.status,
      statusLabel: statusLabel(row.status, row.licenseKind),
      validUntil: row.validUntil?.toISOString() ?? null,
      amountCents: row.amountCents ?? 0,
      currency: (row.currency ?? displayCurrency).toUpperCase(),
    }));

  const workspacePlan = workspaceSub
    ? {
        plan: workspaceSub.plan,
        status: workspaceSub.status,
        amountCents: workspaceSub.amountCents,
        currency: workspaceSub.billingCurrency?.toUpperCase() ?? null,
        expiresAt: workspaceSub.expiresAt?.toISOString() ?? null,
      }
    : null;

  return (
    <BillingDashboard
      totalSpentCents={totalSpentCents}
      monthSpentCents={monthSpentCents}
      currency={displayCurrency}
      activeLicenseCount={activeLicenseCount}
      subscriptionCount={subscriptionCount}
      transactions={transactions}
      subscriptions={subscriptions}
      workspacePlan={workspacePlan}
    />
  );
}
