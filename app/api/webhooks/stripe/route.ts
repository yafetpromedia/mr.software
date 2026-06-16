import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/monetization/stripe-server";
import {
  cancelPurchaseBySubscriptionId,
  fulfillCheckoutSessionCompleted,
  syncSubscriptionFromStripe,
} from "@/lib/monetization/fulfill";
import {
  fulfillWorkspaceStripeSession,
  WORKSPACE_CHECKOUT_META,
} from "@/lib/subscription/workspace-checkout";
import { syncWorkspaceStripeSubscription } from "@/lib/subscription/activate-pro";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (e) {
    console.error("Stripe webhook signature verification failed", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required"
        ) {
          if (session.mode === "payment" || session.mode === "subscription") {
            const workspace = await fulfillWorkspaceStripeSession(session);
            if (!workspace) {
              await fulfillCheckoutSessionCompleted(session);
            }
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata?.type === WORKSPACE_CHECKOUT_META) {
          const active =
            subscription.status === "active" || subscription.status === "trialing";
          await syncWorkspaceStripeSubscription(
            subscription.id,
            subscription.current_period_end,
            active,
          );
        } else {
          await syncSubscriptionFromStripe(subscription);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.metadata?.type === WORKSPACE_CHECKOUT_META) {
          await syncWorkspaceStripeSubscription(subscription.id, 0, false);
        } else {
          await cancelPurchaseBySubscriptionId(subscription.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook handler error", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
