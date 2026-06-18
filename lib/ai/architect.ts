import { SOFTWARE_ARCHITECT_SYSTEM } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/chat";
import { softwareArchitectSchema, type SoftwareArchitectPlan } from "@/lib/ai/schema";

export async function planSoftwareArchitecture(
  idea: string,
  context?: string,
): Promise<SoftwareArchitectPlan> {
  const contextBlock = context?.trim()
    ? `\n\nAdditional context:\n${context.trim()}`
    : "";

  return completeJson(
    [
      { role: "system", content: SOFTWARE_ARCHITECT_SYSTEM },
      {
        role: "user",
        content: `Design the technical architecture for this software product. Respond with JSON:
{
  "summary": string,
  "frontend": string,
  "backend": string,
  "database": string,
  "modules": string[],
  "apiStructure": string[],
  "deploymentNotes": string
}

Product idea:
${idea}${contextBlock}`,
      },
    ],
    softwareArchitectSchema,
  );
}
