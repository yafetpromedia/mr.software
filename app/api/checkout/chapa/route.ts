import { NextResponse } from "next/server";
import { PaymentProvider } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  chapaAmountFromSoftware,
  createChapaCheckout,
  isChapaConfigured,
  isTelebirrEnabled,
} from "@/lib/payments/chapa";

export async function POST(request: Request) {
  if (!isChapaConfigured()) {
    return NextResponse.json(
      { error: "Chapa is not configured (CHAPA_SECRET_KEY)" },
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
  const method =
    body && typeof body === "object" && (body as { method?: unknown }).method === "telebirr"
      ? PaymentProvider.TELEBIRR
      : PaymentProvider.CHAPA;

  if (method === PaymentProvider.TELEBIRR && !isTelebirrEnabled()) {
    return NextResponse.json({ error: "Telebirr checkout is not enabled" }, { status: 503 });
  }

  if (!softwareId) {
    return NextResponse.json({ error: "softwareId is required" }, { status: 400 });
  }

  const software = await prisma.software.findUnique({ where: { id: softwareId } });
  if (!software) {
    return NextResponse.json({ error: "Software not found" }, { status: 404 });
  }

  try {
    const amount = chapaAmountFromSoftware(software.priceCents, software.currency);
    const { url } = await createChapaCheckout({
      request,
      userId: session.id,
      email: session.email,
      name: session.name,
      softwareId,
      amount,
      currency: software.currency.toLowerCase() === "usd" ? "ETB" : software.currency.toUpperCase(),
      provider: method,
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chapa checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
