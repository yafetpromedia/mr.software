import { PaymentProvider } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { isTelebirrEnabled } from "@/lib/payments/chapa";
import { createWorkspaceChapaCheckout } from "@/lib/subscription/workspace-checkout";
import { getUserPlan } from "@/lib/subscription/limits";
import { Plan } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  assertDeveloperPortalUser(session);

  const plan = await getUserPlan(session.id);
  if (plan === Plan.PRO) {
    return NextResponse.json({ error: "You are already on Pro" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const method =
    body && typeof body === "object" && (body as { method?: unknown }).method === "telebirr"
      ? PaymentProvider.TELEBIRR
      : PaymentProvider.CHAPA;

  if (method === PaymentProvider.TELEBIRR && !isTelebirrEnabled()) {
    return NextResponse.json({ error: "Telebirr checkout is not enabled" }, { status: 503 });
  }

  try {
    const { url } = await createWorkspaceChapaCheckout({
      request,
      userId: session.id,
      email: session.email,
      name: session.name,
      method,
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
