import { randomBytes } from "node:crypto";
import { PaymentProvider, PricingModel, PurchaseStatus } from "@prisma/client";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { prisma } from "@/lib/prisma";

const CHAPA_API = "https://api.chapa.co/v1";

export function isChapaConfigured(): boolean {
  return Boolean(process.env.CHAPA_SECRET_KEY?.trim());
}

export function isTelebirrEnabled(): boolean {
  return isChapaConfigured() && process.env.ENABLE_TELEBIRR !== "false";
}

type ChapaInitResponse = {
  status?: string;
  message?: string;
  data?: { checkout_url?: string };
};

export async function createChapaCheckout(input: {
  request: Request;
  userId: string;
  email: string;
  name: string;
  softwareId: string;
  amount: number;
  currency?: string;
  provider?: PaymentProvider.CHAPA | PaymentProvider.TELEBIRR;
}): Promise<{ url: string; txRef: string }> {
  const secret = process.env.CHAPA_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("Chapa is not configured (CHAPA_SECRET_KEY)");
  }

  const software = await prisma.software.findUnique({ where: { id: input.softwareId } });
  if (!software) throw new Error("Software not found");
  if (software.pricingModel === PricingModel.FREE) {
    throw new Error("This product is free");
  }
  if (input.amount <= 0) {
    throw new Error("Invalid amount for Chapa checkout");
  }

  const txRef = `mr-${input.softwareId.slice(0, 8)}-${randomBytes(6).toString("hex")}`;
  const origin = oauthPublicOrigin(input.request);
  const currency = (input.currency ?? software.currency ?? "ETB").toUpperCase();
  const provider = input.provider ?? PaymentProvider.CHAPA;

  const purchase = await prisma.purchase.upsert({
    where: {
      userId_softwareId: { userId: input.userId, softwareId: input.softwareId },
    },
    create: {
      userId: input.userId,
      softwareId: input.softwareId,
      licenseKind: "ONE_TIME",
      status: PurchaseStatus.PENDING,
      amountCents: Math.round(input.amount * 100),
      currency: currency.toLowerCase(),
      paymentProvider: provider,
      chapaTxRef: txRef,
    },
    update: {
      status: PurchaseStatus.PENDING,
      amountCents: Math.round(input.amount * 100),
      currency: currency.toLowerCase(),
      paymentProvider: provider,
      chapaTxRef: txRef,
    },
  });

  const body = {
    amount: String(input.amount),
    currency,
    email: input.email,
    first_name: input.name.split(/\s+/)[0] || "Customer",
    last_name: input.name.split(/\s+/).slice(1).join(" ") || "User",
    tx_ref: txRef,
    callback_url: `${origin}/api/webhooks/chapa`,
    return_url: `${origin}/software/${input.softwareId}?checkout=success&provider=${provider.toLowerCase()}`,
    customization: {
      title: "Mr.Software",
      description: software.name,
    },
    meta: {
      purchaseId: purchase.id,
      userId: input.userId,
      softwareId: input.softwareId,
      provider,
    },
  };

  const res = await fetch(`${CHAPA_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as ChapaInitResponse;
  if (!res.ok || data.status !== "success" || !data.data?.checkout_url) {
    throw new Error(data.message ?? "Chapa initialization failed");
  }

  return { url: data.data.checkout_url, txRef };
}

export async function verifyChapaTransaction(txRef: string): Promise<boolean> {
  const secret = process.env.CHAPA_SECRET_KEY?.trim();
  if (!secret) return false;

  const res = await fetch(
    `${CHAPA_API}/transaction/verify/${encodeURIComponent(txRef)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  );
  const data = (await res.json()) as { status?: string; data?: { status?: string } };
  return res.ok && data.status === "success" && data.data?.status === "success";
}

export async function fulfillChapaPurchase(txRef: string): Promise<boolean> {
  const purchase = await prisma.purchase.findUnique({
    where: { chapaTxRef: txRef },
  });
  if (!purchase) return false;
  if (purchase.status === PurchaseStatus.ACTIVE) return true;

  const ok = await verifyChapaTransaction(txRef);
  if (!ok) return false;

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { status: PurchaseStatus.ACTIVE },
  });
  return true;
}

/** ETB amount for display/checkout when price is stored in cents (USD-style) or ETB. */
export function chapaAmountFromSoftware(priceCents: number, currency: string): number {
  const cur = currency.toLowerCase();
  if (cur === "etb" || cur === "birr") {
    return Math.max(1, Math.round(priceCents / 100));
  }
  // Simple USD→ETB display conversion for demo when ETB not set on product
  const etbRate = Number(process.env.ETB_PER_USD ?? "57");
  return Math.max(1, Math.round((priceCents / 100) * etbRate));
}
