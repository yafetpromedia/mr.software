import { z } from "zod";

const notificationKind = z.enum([
  "DEPLOYMENT",
  "AI",
  "MARKETPLACE",
  "BILLING",
  "STOREFRONT",
  "SYSTEM",
]);

export const notificationPreferencesSchema = z.object({
  mutedKinds: z.array(notificationKind).optional(),
  pushEnabled: z.boolean().optional(),
  emailDigest: z.enum(["OFF", "DAILY", "WEEKLY"]).optional(),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});
