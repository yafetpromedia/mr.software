import type { EmailDigestFrequency, NotificationKind } from "@prisma/client";
import type { NotificationPreferencesDto } from "@/lib/notifications/constants";
import { prisma } from "@/lib/prisma";

export type { NotificationPreferencesDto } from "@/lib/notifications/constants";
export { NOTIFICATION_KIND_LABELS, ALL_NOTIFICATION_KINDS } from "@/lib/notifications/constants";

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferencesDto> {
  const row = await prisma.notificationPreferences.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  return {
    mutedKinds: row.mutedKinds,
    pushEnabled: row.pushEnabled,
    emailDigest: row.emailDigest,
  };
}

export function isKindMuted(
  prefs: NotificationPreferencesDto,
  kind: NotificationKind,
): boolean {
  return prefs.mutedKinds.includes(kind);
}

export async function updateNotificationPreferences(
  userId: string,
  input: Partial<NotificationPreferencesDto>,
): Promise<NotificationPreferencesDto> {
  const row = await prisma.notificationPreferences.upsert({
    where: { userId },
    create: {
      userId,
      mutedKinds: input.mutedKinds ?? [],
      pushEnabled: input.pushEnabled ?? false,
      emailDigest: input.emailDigest ?? "OFF",
    },
    update: {
      ...(input.mutedKinds !== undefined ? { mutedKinds: input.mutedKinds } : {}),
      ...(input.pushEnabled !== undefined ? { pushEnabled: input.pushEnabled } : {}),
      ...(input.emailDigest !== undefined ? { emailDigest: input.emailDigest } : {}),
    },
  });
  return {
    mutedKinds: row.mutedKinds,
    pushEnabled: row.pushEnabled,
    emailDigest: row.emailDigest,
  };
}
