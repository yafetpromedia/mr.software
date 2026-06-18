import { STARTUP_ADVISOR_SYSTEM } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/chat";
import {
  startupAdvisorAnalysisSchema,
  type StartupAdvisorAnalysis,
} from "@/lib/ai/schema";

export async function analyzeStartupIdea(idea: string): Promise<StartupAdvisorAnalysis> {
  return completeJson(
    [
      { role: "system", content: STARTUP_ADVISOR_SYSTEM },
      {
        role: "user",
        content: `Analyze this startup idea and respond with JSON matching this shape:
{
  "projectName": string,
  "problem": string,
  "solution": string,
  "targetUsers": string[],
  "features": string[],
  "pricingIdeas": [{ "name": string, "price": string, "rationale": string }],
  "marketOpportunities": string[],
  "businessModel": string,
  "technicalArchitecture": {
    "frontend": string,
    "backend": string,
    "database": string,
    "modules": string[]
  },
  "deploymentPlan": string,
  "monetizationStrategy": string
}

Idea:
${idea}`,
      },
    ],
    startupAdvisorAnalysisSchema,
  );
}
