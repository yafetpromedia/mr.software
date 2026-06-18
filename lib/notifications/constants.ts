import type { NotificationKind } from "@prisma/client";

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  DEPLOYMENT: "Deployments",
  AI: "AI saves",
  MARKETPLACE: "Marketplace",
  BILLING: "Billing",
  STOREFRONT: "Storefront",
  SYSTEM: "System",
};

export const ALL_NOTIFICATION_KINDS = Object.keys(
  NOTIFICATION_KIND_LABELS,
) as NotificationKind[];

export type NotificationPreferencesDto = {
  mutedKinds: NotificationKind[];
  pushEnabled: boolean;
  emailDigest: "OFF" | "DAILY" | "WEEKLY";
};
