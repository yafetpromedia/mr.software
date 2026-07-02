import { PaymentProvider } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { isTelebirrEnabled } from "@/lib/payments/chapa";
import { createWorkspaceChapaCheckout } from "@/lib/subscription/workspace-checkout";
import { getUserPlan, isPaidWorkspacePlan } from "@/lib/subscription/limits";
import type { BillingInterval, WorkspacePlanId } from "@/lib/subscription/plans";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  assertDeveloperPortalUser(session);

  const plan = await getUserPlan(session.id);
  if (isPaidWorkspacePlan(plan)) {
    return NextResponse.json({ error: "You already have a paid workspace plan" }, { status: 400 });
  }

  let body: {
    method?: unknown;
    planId?: WorkspacePlanId;
    interval?: BillingInterval;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const method =
    body.method === "telebirr" ? PaymentProvider.TELEBIRR : PaymentProvider.CHAPA;

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
      planId: body.planId ?? "pro",
      interval: body.interval ?? "month",
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
