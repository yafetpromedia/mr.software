import type { EmailDigestFrequency } from "@prisma/client";
import { sendEmail, isEmailConfigured } from "@/lib/email/send";
import { NOTIFICATION_KIND_LABELS } from "@/lib/notifications/constants";
import { prisma } from "@/lib/prisma";

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "http://localhost:3000"
  );
}

function digestWindowMs(freq: EmailDigestFrequency): number {
  if (freq === "WEEKLY") return 7 * 24 * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000;
}

function digestLabel(freq: EmailDigestFrequency): string {
  return freq === "WEEKLY" ? "weekly" : "daily";
}

export async function runNotificationDigests(): Promise<{ sent: number; skipped: number }> {
  if (!isEmailConfigured()) {
    return { sent: 0, skipped: 0 };
  }

  const now = new Date();
  let sent = 0;
  let skipped = 0;

  const prefsRows = await prisma.notificationPreferences.findMany({
    where: { emailDigest: { not: "OFF" } },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  for (const prefs of prefsRows) {
    const windowMs = digestWindowMs(prefs.emailDigest);
    const since =
      prefs.lastDigestAt ?? new Date(now.getTime() - windowMs);

    if (prefs.lastDigestAt && now.getTime() - prefs.lastDigestAt.getTime() < windowMs) {
      skipped += 1;
      continue;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: prefs.userId,
        digestSentAt: null,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    if (notifications.length === 0) {
      skipped += 1;
      continue;
    }

    const label = digestLabel(prefs.emailDigest);
    const lines = notifications.map((n) => {
      const kind = NOTIFICATION_KIND_LABELS[n.kind];
      const link = n.href ? new URL(n.href, appOrigin()).toString() : appOrigin();
      return `• [${kind}] ${n.title} — ${n.body} (${link})`;
    });

    const htmlItems = notifications
      .map((n) => {
        const link = n.href ? new URL(n.href, appOrigin()).toString() : appOrigin();
        return `<li><strong>${n.title}</strong><br/><span style="color:#666">${n.body}</span><br/><a href="${link}">Open</a></li>`;
      })
      .join("");

    const ok = await sendEmail({
      to: prefs.user.email,
      subject: `Your ${label} Mr.Software digest (${notifications.length})`,
      text: `Hi ${prefs.user.name},\n\nHere is your ${label} notification digest:\n\n${lines.join("\n")}\n\n— Mr.Software`,
      html: `<p>Hi ${prefs.user.name},</p><p>Your ${label} notification digest:</p><ul>${htmlItems}</ul><p><a href="${appOrigin()}/app/settings">Notification settings</a></p>`,
    });

    if (!ok) {
      skipped += 1;
      continue;
    }

    await prisma.$transaction([
      prisma.notification.updateMany({
        where: { id: { in: notifications.map((n) => n.id) } },
        data: { digestSentAt: now },
      }),
      prisma.notificationPreferences.update({
        where: { userId: prefs.userId },
        data: { lastDigestAt: now },
      }),
    ]);

    sent += 1;
  }

  return { sent, skipped };
}
