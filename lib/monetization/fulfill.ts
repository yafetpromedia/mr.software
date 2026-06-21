import type Stripe from "stripe";
import { LicenseKind, PurchaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "./stripe-server";

function requireMeta(session: Stripe.Checkout.Session): { userId: string; softwareId: string } {
  const userId = session.metadata?.userId;
  const softwareId = session.metadata?.softwareId;
  if (!userId || !softwareId) {
    throw new Error("Checkout session missing userId or softwareId metadata");
  }
  return { userId, softwareId };
}

export async function fulfillCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const { userId, softwareId } = requireMeta(session);
  const stripe = getStripe();

  const existingBySession = await prisma.purchase.findFirst({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (existingBySession?.status === PurchaseStatus.ACTIVE) {
    return;
  }

  const licenseKind =
    session.mode === "subscription" ? LicenseKind.SUBSCRIPTION : LicenseKind.ONE_TIME;

  let validUntil: Date | null = null;
  let stripeSubscriptionId: string | null = null;

  const rawSub = session.subscription;
  const subscriptionId =
    typeof rawSub === "string"
      ? rawSub
      : rawSub && typeof rawSub === "object" && "id" in rawSub
        ? String((rawSub as { id: string }).id)
        : null;

  if (session.mode === "subscription" && subscriptionId) {
    stripeSubscriptionId = subscriptionId;
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    validUntil = new Date(sub.current_period_end * 1000);
  } else {
    validUntil = null;
  }

  const amountCents = session.amount_total ?? null;
  const currency = session.currency ?? "usd";

  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  if (typeof session.customer === "string") {
    await prisma.user.updateMany({
      where: { id: userId, stripeCustomerId: null },
      data: { stripeCustomerId: session.customer },
    });
  }

  await prisma.purchase.upsert({
    where: {
      userId_softwareId: { userId, softwareId },
    },
    create: {
      userId,
      softwareId,
      licenseKind,
      status: PurchaseStatus.ACTIVE,
      amountCents: amountCents ?? undefined,
      currency,
      validFrom: new Date(),
      validUntil,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntent,
      stripeSubscriptionId,
    },
    update: {
      licenseKind,
      status: PurchaseStatus.ACTIVE,
      amountCents: amountCents ?? undefined,
      currency,
      validUntil,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntent ?? undefined,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
    },
  });

  const purchase = await prisma.purchase.findUniqueOrThrow({
    where: { userId_softwareId: { userId, softwareId } },
    select: { id: true },
  });

  const { ensureLicenseKeyForPurchase } = await import("@/lib/trust/license-key");
  await ensureLicenseKeyForPurchase(purchase.id);
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
): Promise<void> {
  const purchase = await prisma.purchase.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!purchase) {
    return;
  }

  const validUntil = new Date(subscription.current_period_end * 1000);
  const active =
    subscription.status === "active" || subscription.status === "trialing";

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      validUntil,
      status: active ? PurchaseStatus.ACTIVE : PurchaseStatus.EXPIRED,
    },
  });
}

export async function cancelPurchaseBySubscriptionId(
  subscriptionId: string,
): Promise<void> {
  await prisma.purchase.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: PurchaseStatus.EXPIRED },
  });
}
