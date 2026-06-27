import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import { PaymentProvider, PurchaseStatus } from "@prisma/client";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/monetization/stripe-server";
import {
  isChapaConfigured,
  verifyChapaTransaction,
} from "@/lib/payments/chapa";
import { activateWorkspacePro, markWorkspaceCheckoutComplete } from "@/lib/subscription/activate-pro";
import { getWorkspacePlan } from "@/lib/subscription/plans";

export const WORKSPACE_CHECKOUT_META = "workspace_pro";

export async function createWorkspaceStripeCheckout(input: {
  request: Request;
  userId: string;
  email: string;
  stripeCustomerId?: string | null;
}): Promise<{ url: string }> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY)");
  }

  const pro = getWorkspacePlan("pro");
  const stripe = getStripe();
  const origin = oauthPublicOrigin(input.request);
  const priceId = process.env.STRIPE_PRO_PRICE_ID?.trim();

  const checkout = await prisma.workspacePlanCheckout.create({
    data: {
      userId: input.userId,
      provider: PaymentProvider.STRIPE,
      status: PurchaseStatus.PENDING,
      currency: "usd",
      amountCents: pro.usdCents,
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Mr.Software Pro",
                description: "Unlimited deployments and Pro workspace features",
              },
              unit_amount: pro.usdCents,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
    success_url: `${origin}/payouts?upgrade=success`,
    cancel_url: `${origin}/payouts?upgrade=cancel`,
    client_reference_id: input.userId,
    metadata: {
      type: WORKSPACE_CHECKOUT_META,
      userId: input.userId,
      checkoutId: checkout.id,
    },
    subscription_data: {
      metadata: {
        type: WORKSPACE_CHECKOUT_META,
        userId: input.userId,
        checkoutId: checkout.id,
      },
    },
    ...(input.stripeCustomerId
      ? { customer: input.stripeCustomerId }
      : input.email
        ? { customer_email: input.email }
        : {}),
  });

  if (!session.url) {
    throw new Error("Could not create Stripe checkout session");
  }

  await prisma.workspacePlanCheckout.update({
    where: { id: checkout.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { url: session.url };
}

export async function createWorkspaceChapaCheckout(input: {
  request: Request;
  userId: string;
  email: string;
  name: string;
  method?: Extract<PaymentProvider, "CHAPA" | "TELEBIRR">;
}): Promise<{ url: string }> {
  if (!isChapaConfigured()) {
    throw new Error("Chapa is not configured (CHAPA_SECRET_KEY)");
  }

  const pro = getWorkspacePlan("pro");
  const amountEtb = Math.max(1, Math.round(pro.etbCents / 100));
  const txRef = `wspro-${input.userId.slice(0, 8)}-${randomBytes(6).toString("hex")}`;
  const origin = oauthPublicOrigin(input.request);
  const provider = input.method ?? PaymentProvider.CHAPA;
  const secret = process.env.CHAPA_SECRET_KEY?.trim();
  if (!secret) throw new Error("Chapa is not configured");

  const checkout = await prisma.workspacePlanCheckout.create({
    data: {
      userId: input.userId,
      provider,
      status: PurchaseStatus.PENDING,
      chapaTxRef: txRef,
      currency: "etb",
      amountCents: pro.etbCents,
    },
  });

  const body = {
    amount: String(amountEtb),
    currency: "ETB",
    email: input.email,
    first_name: input.name.split(/\s+/)[0] || "Developer",
    last_name: input.name.split(/\s+/).slice(1).join(" ") || "User",
    tx_ref: txRef,
    callback_url: `${origin}/api/webhooks/chapa`,
    return_url: `${origin}/payouts?upgrade=success&provider=chapa`,
    customization: {
      title: "Mr.Software Pro",
      description: "Workspace Pro — monthly plan (ETB)",
    },
    meta: {
      type: WORKSPACE_CHECKOUT_META,
      checkoutId: checkout.id,
      userId: input.userId,
      provider,
    },
  };

  const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    status?: string;
    message?: string;
    data?: { checkout_url?: string };
  };

  if (!res.ok || data.status !== "success" || !data.data?.checkout_url) {
    throw new Error(data.message ?? "Chapa initialization failed");
  }

  return { url: data.data.checkout_url };
}

export async function fulfillWorkspaceStripeSession(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  if (session.metadata?.type !== WORKSPACE_CHECKOUT_META) {
    return false;
  }

  const userId = session.metadata.userId;
  const checkoutId = session.metadata.checkoutId;
  if (!userId || !checkoutId) {
    throw new Error("Workspace checkout missing userId or checkoutId");
  }

  const checkout = await prisma.workspacePlanCheckout.findUnique({
    where: { id: checkoutId },
  });
  if (!checkout || checkout.userId !== userId) {
    throw new Error("Workspace checkout not found");
  }
  if (checkout.status === PurchaseStatus.ACTIVE) {
    return true;
  }

  const stripe = getStripe();
  let expiresAt: Date | null = null;
  let stripeSubscriptionId: string | null = null;

  const rawSub = session.subscription;
  const subscriptionId =
    typeof rawSub === "string"
      ? rawSub
      : rawSub && typeof rawSub === "object" && "id" in rawSub
        ? String((rawSub as { id: string }).id)
        : null;

  if (subscriptionId) {
    stripeSubscriptionId = subscriptionId;
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    expiresAt = new Date(sub.current_period_end * 1000);
  }

  if (typeof session.customer === "string") {
    await prisma.user.updateMany({
      where: { id: userId, stripeCustomerId: null },
      data: { stripeCustomerId: session.customer },
    });
  }

  await prisma.workspacePlanCheckout.update({
    where: { id: checkoutId },
    data: {
      stripeCheckoutSessionId: session.id,
      stripeSubscriptionId,
      status: PurchaseStatus.ACTIVE,
    },
  });

  await activateWorkspacePro({
    userId,
    provider: PaymentProvider.STRIPE,
    currency: checkout.currency,
    amountCents: checkout.amountCents,
    expiresAt,
    stripeSubscriptionId,
  });

  return true;
}

export async function fulfillWorkspaceChapa(txRef: string): Promise<boolean> {
  const checkout = await prisma.workspacePlanCheckout.findUnique({
    where: { chapaTxRef: txRef },
  });
  if (!checkout) return false;
  if (checkout.status === PurchaseStatus.ACTIVE) return true;

  const ok = await verifyChapaTransaction(txRef);
  if (!ok) return false;

  await markWorkspaceCheckoutComplete(checkout.id);
  await activateWorkspacePro({
    userId: checkout.userId,
    provider: checkout.provider,
    currency: checkout.currency,
    amountCents: checkout.amountCents,
  });

  return true;
}
