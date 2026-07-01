import { PaymentProvider, Plan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "-");
}

export function isValidCouponCodeFormat(code: string): boolean {
  return CODE_PATTERN.test(code);
}

export function generateCouponCode(prefix = "FRIEND"): string {
  const chunk = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${chunk}`;
}

export type RedeemCouponResult =
  | { ok: true; expiresAt: Date; durationDays: number; code: string }
  | { ok: false; error: string };

export async function redeemWorkspaceCoupon(
  userId: string,
  rawCode: string,
): Promise<RedeemCouponResult> {
  const code = normalizeCouponCode(rawCode);
  if (!isValidCouponCodeFormat(code)) {
    return { ok: false, error: "Enter a valid coupon code (letters, numbers, hyphens)." };
  }

  const coupon = await prisma.workspaceCoupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return { ok: false, error: "This coupon code is not valid." };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { ok: false, error: "This coupon has expired." };
  }

  if (coupon.redemptionCount >= coupon.maxRedemptions) {
    return { ok: false, error: "This coupon has reached its redemption limit." };
  }

  const existing = await prisma.workspaceCouponRedemption.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId } },
  });
  if (existing) {
    return { ok: false, error: "You have already used this coupon." };
  }

  const now = new Date();
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, expiresAt: true, stripeSubscriptionId: true },
  });

  if (
    sub?.plan === Plan.PRO &&
    sub.status === SubscriptionStatus.ACTIVE &&
    sub.stripeSubscriptionId &&
    (!sub.expiresAt || sub.expiresAt > now)
  ) {
    return {
      ok: false,
      error: "You already have an active paid subscription. Cancel it first to use a coupon.",
    };
  }

  const base =
    sub?.plan === Plan.PRO && sub.expiresAt && sub.expiresAt > now ? sub.expiresAt : now;
  const expiresAt = new Date(base.getTime() + coupon.durationDays * 24 * 60 * 60 * 1000);

  try {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.workspaceCoupon.findUnique({ where: { id: coupon.id } });
      if (!fresh || !fresh.active) {
        throw new Error("COUPON_INACTIVE");
      }
      if (fresh.expiresAt && fresh.expiresAt < new Date()) {
        throw new Error("COUPON_EXPIRED");
      }
      if (fresh.redemptionCount >= fresh.maxRedemptions) {
        throw new Error("COUPON_LIMIT");
      }

      await tx.workspaceCouponRedemption.create({
        data: { couponId: fresh.id, userId },
      });

      await tx.workspaceCoupon.update({
        where: { id: fresh.id },
        data: { redemptionCount: { increment: 1 } },
      });

      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: Plan.PRO,
          status: SubscriptionStatus.ACTIVE,
          expiresAt,
          paymentProvider: PaymentProvider.COUPON,
          billingCurrency: "usd",
          amountCents: 0,
        },
        update: {
          plan: Plan.PRO,
          status: SubscriptionStatus.ACTIVE,
          expiresAt,
          paymentProvider: PaymentProvider.COUPON,
          billingCurrency: "usd",
          amountCents: 0,
          stripeSubscriptionId: null,
        },
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "COUPON_INACTIVE") {
      return { ok: false, error: "This coupon code is not valid." };
    }
    if (msg === "COUPON_EXPIRED") {
      return { ok: false, error: "This coupon has expired." };
    }
    if (msg === "COUPON_LIMIT") {
      return { ok: false, error: "This coupon has reached its redemption limit." };
    }
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return { ok: false, error: "You have already used this coupon." };
    }
    throw e;
  }

  return { ok: true, expiresAt, durationDays: coupon.durationDays, code: coupon.code };
}

export async function listWorkspaceCouponsForAdmin() {
  return prisma.workspaceCoupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { redemptions: true } },
      redemptions: {
        take: 5,
        orderBy: { redeemedAt: "desc" },
        select: {
          redeemedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}
