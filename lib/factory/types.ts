import type { FactoryStep } from "@prisma/client";
import type { StartupAdvisorAnalysis } from "@/lib/ai/schema";

export const FACTORY_STEP_ORDER: FactoryStep[] = [
  "IDEA",
  "VALIDATION",
  "PACKAGE",
  "DEPLOY",
  "STOREFRONT",
  "LISTING",
  "COMPLETE",
];

export const FACTORY_STEP_LABELS: Record<FactoryStep, string> = {
  IDEA: "Idea",
  VALIDATION: "Validate",
  PACKAGE: "Build",
  DEPLOY: "Deploy",
  STOREFRONT: "Storefront",
  LISTING: "List",
  COMPLETE: "Launch",
};

export type FactorySessionView = {
  id: string;
  idea: string;
  currentStep: FactoryStep;
  analysis: StartupAdvisorAnalysis | null;
  conversationId: string | null;
  startupId: string | null;
  deploymentId: string | null;
  softwareId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FactoryProgressItem = {
  step: FactoryStep;
  label: string;
  done: boolean;
  href: string;
};

export type FactoryProgress = {
  items: FactoryProgressItem[];
  completedCount: number;
  totalCount: number;
  percent: number;
  activeSessionId: string | null;
};

export type ListingPrefill = {
  name: string;
  description: string;
  amount: string;
  pricingModel: "FREE" | "ONE_TIME" | "SUBSCRIPTION";
  category: string;
};
