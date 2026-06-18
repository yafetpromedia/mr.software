import { z } from "zod";
import { completeJson } from "@/lib/ai/chat";
import { MR_SOFTWARE_AI_IDENTITY } from "@/lib/ai/prompts";

export const deploymentPlanSchema = z.object({
  summary: z.string().min(1).max(500),
  environments: z.array(z.string().min(1).max(120)).min(2).max(5),
  hostingOptions: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        fit: z.string().min(1).max(200),
        tradeoffs: z.string().min(1).max(200),
      }),
    )
    .min(2)
    .max(4),
  ciCdSteps: z.array(z.string().min(1).max(200)).min(3).max(8),
  securityChecklist: z.array(z.string().min(1).max(200)).min(3).max(8),
  mrSoftwarePath: z.string().min(1).max(400),
});

export type DeploymentPlan = z.infer<typeof deploymentPlanSchema>;

const DEPLOYMENT_ADVISOR_SYSTEM = `${MR_SOFTWARE_AI_IDENTITY}

You are Mr.Software Deployment Advisor. Recommend practical deployment strategies for SaaS products.
Consider Mr.Software cloud deploy, VPS, and marketplace distribution. Respond with JSON only.`;

export async function adviseDeployment(idea: string): Promise<DeploymentPlan> {
  return completeJson(
    [
      { role: "system", content: DEPLOYMENT_ADVISOR_SYSTEM },
      {
        role: "user",
        content: `Recommend a deployment plan for this product. JSON shape:
{
  "summary": string,
  "environments": string[],
  "hostingOptions": [{ "name": string, "fit": string, "tradeoffs": string }],
  "ciCdSteps": string[],
  "securityChecklist": string[],
  "mrSoftwarePath": string
}

Product:
${idea}`,
      },
    ],
    deploymentPlanSchema,
  );
}
