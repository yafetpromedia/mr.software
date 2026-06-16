import { NextResponse } from "next/server";
import { PaymentProvider } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { activateWorkspacePro } from "@/lib/subscription/activate-pro";
import { getUserPlan } from "@/lib/subscription/limits";
import { getWorkspacePlan } from "@/lib/subscription/plans";
import { Plan } from "@prisma/client";

function devUpgradeEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_CHECKOUT === "true"
  );
}

export async function POST() {
  if (!devUpgradeEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  assertDeveloperPortalUser(session);

  const plan = await getUserPlan(session.id);
  if (plan === Plan.PRO) {
    return NextResponse.json({ error: "Already on Pro" }, { status: 400 });
  }

  const pro = getWorkspacePlan("pro");
  await activateWorkspacePro({
    userId: session.id,
    provider: PaymentProvider.DEV_GRANT,
    currency: "usd",
    amountCents: pro.usdCents,
  });

  return NextResponse.json({ ok: true, plan: "PRO" });
}
