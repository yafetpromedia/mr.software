import Link from "next/link";
import { PurchaseStatus, LicenseKind } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { prisma } from "@/lib/prisma";
import { getAppOpenUrlForSoftware } from "@/lib/portal/resolve-app-open-url";
import { PortalHomeView } from "@/components/app/portal-home-view";

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

  const recentPurchases = purchases.slice(0, 3);
  const openUrls: Record<string, string | null> = {};
  for (const p of recentPurchases) {
    if (!p.software) continue;
    // eslint-disable-next-line no-await-in-loop
    openUrls[p.softwareId] = await getAppOpenUrlForSoftware(p.softwareId);
  }

  const recent = recentPurchases
    .filter((p) => p.software)
    .map((p) => {
      const { line, warn } = statusLabel(p.status, p.licenseKind, p.validUntil);
      return {
        id: p.id,
        softwareId: p.softwareId,
        name: p.software!.name,
        statusLine: line,
        warn,
        openUrl: openUrls[p.softwareId] ?? null,
      };
    });

  return (
    <PortalHomeView
      firstName={firstName}
      canDeploy={canDeploy}
      showDeployNotice={!canDeploy}
      stats={{
          activePurchases: activeEntitlements.length,
          activeSubscriptions: subActive,
          expiringSoon,
        }}
        recent={recent}
        recommendations={recs.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
        }))}
      />
  );
}
