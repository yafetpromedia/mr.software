import { NextResponse } from "next/server";
import { PricingModel } from "@prisma/client";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/monetization/stripe-server";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY)" },
      { status: 503 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const softwareId =
    body && typeof body === "object" && typeof (body as { softwareId?: unknown }).softwareId === "string"
      ? (body as { softwareId: string }).softwareId.trim()
      : "";

  if (!softwareId) {
    return NextResponse.json({ error: "softwareId is required" }, { status: 400 });
  }

  const software = await prisma.software.findUnique({
    where: { id: softwareId },
    include: { developer: true },
  });

  if (!software) {
    return NextResponse.json({ error: "Software not found" }, { status: 404 });
  }

  if (software.pricingModel === PricingModel.FREE) {
    return NextResponse.json(
      { error: "This product is free — sign in and use Download" },
      { status: 400 },
    );
  }

  if (!software.stripePriceId?.trim()) {
    return NextResponse.json(
      {
        error:
          "This product is not configured for Stripe (missing stripePriceId on the catalog item)",
      },
      { status: 400 },
    );
  }

  const origin = oauthPublicOrigin(request);
  const stripe = getStripe();

  const mode =
    software.pricingModel === PricingModel.SUBSCRIPTION ? "subscription" : "payment";

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { stripeCustomerId: true },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: software.stripePriceId.trim(), quantity: 1 }],
    success_url: `${origin}/software/${software.id}?checkout=success`,
    cancel_url: `${origin}/software/${software.id}?checkout=cancel`,
    client_reference_id: session.id,
    metadata: {
      userId: session.id,
      softwareId: software.id,
    },
    ...(dbUser?.stripeCustomerId
      ? { customer: dbUser.stripeCustomerId }
      : session.email
        ? { customer_email: session.email }
        : {}),
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}
