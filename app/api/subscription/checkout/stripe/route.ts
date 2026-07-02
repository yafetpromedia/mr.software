import { NextResponse } from "next/server";
import { Plan } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { createWorkspaceStripeCheckout } from "@/lib/subscription/workspace-checkout";
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

  let body: { planId?: WorkspacePlanId; interval?: BillingInterval } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* default pro monthly */
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { stripeCustomerId: true },
  });

  try {
    const { url } = await createWorkspaceStripeCheckout({
      request,
      userId: session.id,
      email: session.email,
      stripeCustomerId: user?.stripeCustomerId,
      planId: body.planId ?? "pro",
      interval: body.interval ?? "month",
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
