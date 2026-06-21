import { LicenseKind, PricingModel, PurchaseStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function devCheckoutEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_CHECKOUT === "true"
  );
}

/**
 * Local / dev-only: grant an ACTIVE license without Stripe (for integration testing).
 */
export async function POST(request: Request) {
  if (!devCheckoutEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const software = await prisma.software.findUnique({ where: { id: softwareId } });
  if (!software) {
    return NextResponse.json({ error: "Software not found" }, { status: 404 });
  }

  if (software.pricingModel === PricingModel.FREE) {
    return NextResponse.json(
      { error: "Free products do not need a dev grant" },
      { status: 400 },
    );
  }

  const licenseKind =
    software.pricingModel === PricingModel.SUBSCRIPTION
      ? LicenseKind.SUBSCRIPTION
      : LicenseKind.ONE_TIME;

  const validUntil =
    licenseKind === LicenseKind.SUBSCRIPTION
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null;

  const purchase = await prisma.purchase.upsert({
    where: {
      userId_softwareId: { userId: session.id, softwareId: software.id },
    },
    create: {
      userId: session.id,
      softwareId: software.id,
      licenseKind,
      status: PurchaseStatus.ACTIVE,
      amountCents: software.priceCents,
      currency: software.currency,
      validUntil,
    },
    update: {
      licenseKind,
      status: PurchaseStatus.ACTIVE,
      amountCents: software.priceCents,
      currency: software.currency,
      validUntil,
    },
  });

  const { ensureLicenseKeyForPurchase } = await import("@/lib/trust/license-key");
  await ensureLicenseKeyForPurchase(purchase.id);

  return NextResponse.json({ ok: true });
}
