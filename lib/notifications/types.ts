import type { NotificationKind } from "@prisma/client";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type CreateNotificationInput = {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
};
