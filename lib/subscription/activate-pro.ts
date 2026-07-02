import {
  PaymentProvider,
  Plan,
  PurchaseStatus,
  SubscriptionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PRO_PERIOD_DAYS = 30;

export async function activateWorkspacePlan(input: {
  userId: string;
  plan: Plan;
  provider: PaymentProvider;
  currency: string;
  amountCents: number;
  expiresAt?: Date | null;
  stripeSubscriptionId?: string | null;
}): Promise<void> {
  const expiresAt =
    input.expiresAt ??
    new Date(Date.now() + PRO_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  await prisma.subscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      plan: input.plan,
      status: SubscriptionStatus.ACTIVE,
      expiresAt,
      paymentProvider: input.provider,
      billingCurrency: input.currency.toLowerCase(),
      amountCents: input.amountCents,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    },
    update: {
      plan: input.plan,
      status: SubscriptionStatus.ACTIVE,
      expiresAt,
      paymentProvider: input.provider,
      billingCurrency: input.currency.toLowerCase(),
      amountCents: input.amountCents,
      stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
    },
  });
}

/** @deprecated Use activateWorkspacePlan with plan: Plan.PRO */
export async function activateWorkspacePro(input: {
  userId: string;
  provider: PaymentProvider;
  currency: string;
  amountCents: number;
  expiresAt?: Date | null;
  stripeSubscriptionId?: string | null;
}): Promise<void> {
  await activateWorkspacePlan({ ...input, plan: Plan.PRO });
}

export async function markWorkspaceCheckoutComplete(checkoutId: string): Promise<void> {
  await prisma.workspacePlanCheckout.update({
    where: { id: checkoutId },
    data: { status: PurchaseStatus.ACTIVE },
  });
}

export async function syncWorkspaceStripeSubscription(
  stripeSubscriptionId: string,
  currentPeriodEnd: number,
  active: boolean,
): Promise<void> {
  const checkout = await prisma.workspacePlanCheckout.findFirst({
    where: { stripeSubscriptionId },
  });
  if (!checkout) return;

  if (active) {
    await activateWorkspacePlan({
      userId: checkout.userId,
      plan: checkout.targetPlan,
      provider: PaymentProvider.STRIPE,
      currency: checkout.currency,
      amountCents: checkout.amountCents,
      expiresAt: new Date(currentPeriodEnd * 1000),
      stripeSubscriptionId,
    });
    await markWorkspaceCheckoutComplete(checkout.id);
  } else {
    await prisma.subscription.updateMany({
      where: { userId: checkout.userId, stripeSubscriptionId },
      data: { plan: Plan.FREE, status: SubscriptionStatus.CANCELED },
    });
  }
}
