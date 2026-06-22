import { SOFTWARE_ARCHITECT_SYSTEM } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/chat";
import { appendCreatorContext, getCreatorContextBlock } from "@/lib/ai/developer-memory/context";
import { softwareArchitectSchema, type SoftwareArchitectPlan } from "@/lib/ai/schema";

export async function planSoftwareArchitecture(
  idea: string,
  context: string | undefined,
  userId: string,
): Promise<SoftwareArchitectPlan> {
  const contextBlock = context?.trim()
    ? `\n\nAdditional context:\n${context.trim()}`
    : "";

  const creatorBlock = await getCreatorContextBlock(userId);
  const systemPrompt = appendCreatorContext(SOFTWARE_ARCHITECT_SYSTEM, creatorBlock);

  return completeJson(
    [
      { role: "system", content: systemPrompt },
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
