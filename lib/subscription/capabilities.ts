import { Plan } from "@prisma/client";

export type PlanCapabilities = {
  maxPublishedProducts: number | "unlimited";
  maxDeployments: number | "unlimited";
  zipUpload: boolean;
  sourceCodeListing: boolean;
  teamMembers: number | "unlimited";
  analytics: "basic" | "advanced" | "enterprise";
  customDomain: boolean;
  apiAccess: boolean;
  prioritySupport: boolean | "dedicated";
  premiumBadge: boolean;
  higherSearchRanking: boolean;
};

const CAPABILITIES: Record<Plan, PlanCapabilities> = {
  [Plan.FREE]: {
    maxPublishedProducts: 5,
    maxDeployments: 5,
    zipUpload: false,
    sourceCodeListing: false,
    teamMembers: 1,
    analytics: "basic",
    customDomain: false,
    apiAccess: false,
    prioritySupport: false,
    premiumBadge: false,
    higherSearchRanking: false,
  },
  [Plan.PRO]: {
    maxPublishedProducts: "unlimited",
    maxDeployments: "unlimited",
    zipUpload: true,
    sourceCodeListing: true,
    teamMembers: 5,
    analytics: "advanced",
    customDomain: true,
    apiAccess: true,
    prioritySupport: true,
    premiumBadge: true,
    higherSearchRanking: true,
  },
  [Plan.STUDIO]: {
    maxPublishedProducts: "unlimited",
    maxDeployments: "unlimited",
    zipUpload: true,
    sourceCodeListing: true,
    teamMembers: "unlimited",
    analytics: "enterprise",
    customDomain: true,
    apiAccess: true,
    prioritySupport: "dedicated",
    premiumBadge: true,
    higherSearchRanking: true,
  },
};

export function getPlanCapabilities(plan: Plan): PlanCapabilities {
  return CAPABILITIES[plan] ?? CAPABILITIES[Plan.FREE];
}

export function isPaidWorkspacePlan(plan: Plan): boolean {
  return plan === Plan.PRO || plan === Plan.STUDIO;
}

export function formatQuotaLimit(limit: number | "unlimited"): string {
  return limit === "unlimited" ? "Unlimited" : String(limit);
}
