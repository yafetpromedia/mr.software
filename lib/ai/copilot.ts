import { completeText } from "@/lib/ai/chat";
import { COPILOT_SYSTEM } from "@/lib/ai/prompts";

export type CopilotTurn = { role: "user" | "assistant"; content: string };

export async function runCopilotTurn(
  history: CopilotTurn[],
  userMessage: string,
): Promise<string> {
  const messages = [
    { role: "system" as const, content: COPILOT_SYSTEM },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  return completeText(messages, 0.65);
}
