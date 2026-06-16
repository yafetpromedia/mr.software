import { Plan } from "@prisma/client";

export type WorkspacePlanId = "free" | "pro";

export type WorkspacePlanDefinition = {
  id: WorkspacePlanId;
  plan: Plan;
  name: string;
  tagline: string;
  usdCents: number;
  etbCents: number;
  deploymentSlots: number | "unlimited";
  features: string[];
};

const PRO_USD_CENTS = Number(process.env.WORKSPACE_PRO_USD_CENTS ?? "1900");
const PRO_ETB_CENTS = Number(process.env.WORKSPACE_PRO_ETB_CENTS ?? "99900");

export const WORKSPACE_PLANS: WorkspacePlanDefinition[] = [
  {
    id: "free",
    plan: Plan.FREE,
    name: "Free",
    tagline: "Start building on Mr.Software Cloud",
    usdCents: 0,
    etbCents: 0,
    deploymentSlots: 1,
    features: [
      "1 active deployment",
      "Public storefront",
      "Marketplace listings",
      "AI-assisted builder",
    ],
  },
  {
    id: "pro",
    plan: Plan.PRO,
    name: "Pro",
    tagline: "Scale deployments and seller tools",
    usdCents: PRO_USD_CENTS,
    etbCents: PRO_ETB_CENTS,
    deploymentSlots: "unlimited",
    features: [
      "Unlimited active deployments",
      "Priority deploy pipeline",
      "Advanced storefront analytics",
      "Pro seller badge (when enabled)",
    ],
  },
];

export function getWorkspacePlan(id: WorkspacePlanId): WorkspacePlanDefinition {
  const plan = WORKSPACE_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function formatPlanPrice(cents: number, currency: "USD" | "ETB"): string {
  if (cents === 0) return "Free";
  const n = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "ETB" ? 0 : 2,
    }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

export function proPlanMonthlyLabel(): { usd: string; etb: string } {
  const pro = getWorkspacePlan("pro");
  return {
    usd: `${formatPlanPrice(pro.usdCents, "USD")}/mo`,
    etb: `${formatPlanPrice(pro.etbCents, "ETB")}/mo`,
  };
}
