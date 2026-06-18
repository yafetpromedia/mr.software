import type { Notification } from "@prisma/client";
import { publishNotification } from "@/lib/notifications/bus";
import { getNotificationPreferences, isKindMuted } from "@/lib/notifications/preferences";
import { sendPushToUser } from "@/lib/notifications/push";
import type { CreateNotificationInput, NotificationItem } from "@/lib/notifications/types";
import { prisma } from "@/lib/prisma";

export function serializeNotification(row: Notification): NotificationItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    href: row.href,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationItem | null> {
  const prefs = await getNotificationPreferences(input.userId);
  if (isKindMuted(prefs, input.kind)) {
    return null;
  }

  const row = await prisma.notification.create({
    data: {
      userId: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });
  const item = serializeNotification(row);
  publishNotification(input.userId, item);
  void sendPushToUser(input.userId, item).catch((e) => console.error("push delivery", e));
  return item;
}

export async function listNotifications(userId: string, limit = 30) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(serializeNotification);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
  return true;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}
