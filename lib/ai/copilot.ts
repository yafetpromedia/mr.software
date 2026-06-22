import { completeText } from "@/lib/ai/chat";
import { appendCreatorContext, getCreatorContextBlock } from "@/lib/ai/developer-memory/context";
import { COPILOT_SYSTEM } from "@/lib/ai/prompts";

export type CopilotTurn = { role: "user" | "assistant"; content: string };

export async function runCopilotTurn(
  history: CopilotTurn[],
  userMessage: string,
  userId: string,
): Promise<string> {
  const creatorBlock = await getCreatorContextBlock(userId);
  const systemPrompt = appendCreatorContext(COPILOT_SYSTEM, creatorBlock);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  return completeText(messages, 0.65);
}
