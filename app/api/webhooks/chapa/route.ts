import { NextResponse } from "next/server";
import { fulfillChapaPurchase } from "@/lib/payments/chapa";
import { fulfillWorkspaceChapa } from "@/lib/subscription/workspace-checkout";

async function fulfillChapa(txRef: string): Promise<boolean> {
  const workspace = await fulfillWorkspaceChapa(txRef);
  if (workspace) return true;
  return fulfillChapaPurchase(txRef);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txRef = searchParams.get("trx_ref") ?? searchParams.get("tx_ref");
  if (!txRef) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  const ok = await fulfillChapa(txRef);
  return NextResponse.json({ ok });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const txRef =
    body && typeof body === "object"
      ? ((body as { trx_ref?: string; tx_ref?: string }).trx_ref ??
        (body as { tx_ref?: string }).tx_ref)
      : undefined;

  if (!txRef || typeof txRef !== "string") {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  const ok = await fulfillChapa(txRef);
  return NextResponse.json({ ok });
}
