import type { SoftwareCategory } from "@prisma/client";
import type { StartupAdvisorAnalysis } from "@/lib/ai/schema";
import type { GeneratedStartupPayload } from "@/lib/startup/types";
import type { ListingPrefill } from "@/lib/factory/types";

function inferCategory(idea: string, features: string[]): SoftwareCategory {
  const text = `${idea} ${features.join(" ")}`.toLowerCase();
  if (/school|education|campus|student|teacher/.test(text)) return "EDUCATION";
  if (/health|clinic|hospital|patient|medical/.test(text)) return "HEALTHCARE";
  if (/shop|e-?commerce|store|retail|marketplace/.test(text)) return "ECOMMERCE";
  if (/finance|fintech|payment|bank|wallet/.test(text)) return "FINANCE";
  if (/government|public|civic|permit/.test(text)) return "GOVERNMENT";
  if (/ai|machine learning|gpt|llm/.test(text)) return "AI_TOOLS";
  if (/business|erp|crm|inventory|hr/.test(text)) return "BUSINESS";
  return "DEVELOPER_TOOLS";
}

function parsePriceAmount(priceLabel: string): string {
  const match = priceLabel.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match?.[1] ?? "";
}

export function buildListingPrefill(
  idea: string,
  analysis: StartupAdvisorAnalysis | null,
  payload: GeneratedStartupPayload | null,
): ListingPrefill {
  const name = analysis?.projectName ?? payload?.name ?? "My product";
  const tagline = payload?.tagline ?? analysis?.solution ?? "";
  const problem = analysis?.problem ?? "";
  const description = [tagline, problem].filter(Boolean).join("\n\n").trim() || idea.trim();

  const tier = analysis?.pricingIdeas[0] ?? payload?.pricing[0];
  const priceStr = tier?.price ?? "";
  const amount = parsePriceAmount(priceStr);
  const pricingModel =
    !tier || amount === "0" || /free/i.test(priceStr)
      ? "FREE"
      : /mo|month|subscription/i.test(priceStr)
        ? "SUBSCRIPTION"
        : "ONE_TIME";

  return {
    name,
    description,
    amount,
    pricingModel,
    category: inferCategory(idea, analysis?.features ?? payload?.features ?? []),
  };
}

export function buildStorefrontPrefill(
  analysis: StartupAdvisorAnalysis | null,
  payload: GeneratedStartupPayload | null,
): { tagline: string; bio: string } {
  return {
    tagline: payload?.tagline ?? analysis?.solution?.slice(0, 120) ?? "",
    bio: analysis?.monetizationStrategy ?? analysis?.businessModel ?? "",
  };
}
