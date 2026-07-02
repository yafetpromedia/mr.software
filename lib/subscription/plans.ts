import { Plan } from "@prisma/client";
import { BRAND_AI_NAME, BRAND_CLOUD_NAME, BRAND_NAME } from "@/lib/branding/constants";

export type WorkspacePlanId = "free" | "pro" | "studio";
export type BillingInterval = "month" | "year";

export type WorkspacePlanDefinition = {
  id: WorkspacePlanId;
  plan: Plan;
  name: string;
  tagline: string;
  usdCents: number;
  usdYearlyCents: number;
  etbCents: number;
  etbYearlyCents: number;
  deploymentSlots: number | "unlimited";
  features: string[];
};

const PRO_USD_CENTS = Number(process.env.WORKSPACE_PRO_USD_CENTS ?? "999");
const PRO_USD_YEARLY_CENTS = Number(process.env.WORKSPACE_PRO_YEARLY_USD_CENTS ?? "9900");
const PRO_ETB_CENTS = Number(process.env.WORKSPACE_PRO_ETB_CENTS ?? "99900");
const PRO_ETB_YEARLY_CENTS = Number(process.env.WORKSPACE_PRO_YEARLY_ETB_CENTS ?? "999000");

const STUDIO_USD_CENTS = Number(process.env.WORKSPACE_STUDIO_USD_CENTS ?? "2999");
const STUDIO_USD_YEARLY_CENTS = Number(process.env.WORKSPACE_STUDIO_YEARLY_USD_CENTS ?? "29900");
const STUDIO_ETB_CENTS = Number(process.env.WORKSPACE_STUDIO_ETB_CENTS ?? "299900");
const STUDIO_ETB_YEARLY_CENTS = Number(process.env.WORKSPACE_STUDIO_YEARLY_ETB_CENTS ?? "2999000");

export const WORKSPACE_PLANS: WorkspacePlanDefinition[] = [
  {
    id: "free",
    plan: Plan.FREE,
    name: "Free",
    tagline: "Start selling on the marketplace",
    usdCents: 0,
    usdYearlyCents: 0,
    etbCents: 0,
    etbYearlyCents: 0,
    deploymentSlots: 5,
    features: [
      "Up to 5 published products",
      "Product pages, screenshots & demos",
      "Ratings and reviews",
      "Sell compiled apps & binaries",
      "Public storefront",
      `${BRAND_AI_NAME} copilot`,
      "No source-code (.zip) uploads",
    ],
  },
  {
    id: "pro",
    plan: Plan.PRO,
    name: "Pro",
    tagline: "Unlimited products & source-code sales",
    usdCents: PRO_USD_CENTS,
    usdYearlyCents: PRO_USD_YEARLY_CENTS,
    etbCents: PRO_ETB_CENTS,
    etbYearlyCents: PRO_ETB_YEARLY_CENTS,
    deploymentSlots: "unlimited",
    features: [
      "Unlimited published products",
      "Upload ZIP source code (up to 2 GB)",
      "Private files & version history",
      "Advanced storefront analytics",
      "Premium seller badge",
      "Higher marketplace ranking",
      "Custom license options",
      "Team collaboration (5 members)",
      `Priority ${BRAND_CLOUD_NAME} deploys`,
    ],
  },
  {
    id: "studio",
    plan: Plan.STUDIO,
    name: "Studio",
    tagline: "For teams and serious software businesses",
    usdCents: STUDIO_USD_CENTS,
    usdYearlyCents: STUDIO_USD_YEARLY_CENTS,
    etbCents: STUDIO_ETB_CENTS,
    etbYearlyCents: STUDIO_ETB_YEARLY_CENTS,
    deploymentSlots: "unlimited",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Enterprise analytics",
      "Custom domain for storefront",
      "API access",
      "Dedicated priority support",
      "Automatic update delivery",
    ],
  },
];

export function getWorkspacePlan(id: WorkspacePlanId): WorkspacePlanDefinition {
  const plan = WORKSPACE_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function workspacePlanIdFromDb(plan: Plan): WorkspacePlanId {
  if (plan === Plan.STUDIO) return "studio";
  if (plan === Plan.PRO) return "pro";
  return "free";
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

export function planPriceForInterval(
  plan: WorkspacePlanDefinition,
  interval: BillingInterval,
  currency: "USD" | "ETB",
): number {
  if (plan.usdCents === 0) return 0;
  if (currency === "USD") {
    return interval === "year" ? plan.usdYearlyCents : plan.usdCents;
  }
  return interval === "year" ? plan.etbYearlyCents : plan.etbCents;
}

export function proPlanMonthlyLabel(): { usd: string; etb: string } {
  const pro = getWorkspacePlan("pro");
  return {
    usd: `${formatPlanPrice(pro.usdCents, "USD")}/mo`,
    etb: `${formatPlanPrice(pro.etbCents, "ETB")}/mo`,
  };
}
