import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { createWorkspaceStripeCheckout } from "@/lib/subscription/workspace-checkout";
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
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
