import type { z } from "zod";
import { ai } from "@/lib/ai/client";
import { getAiModel } from "@/lib/ai/config";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(raw);
}

export async function completeText(messages: ChatMessage[], temperature = 0.7): Promise<string> {
  const response = await ai.chat.completions.create({
    model: getAiModel(),
    messages,
    temperature,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Mr.Software AI returned an empty response");
  }
  return content;
}

export async function completeJson<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  temperature = 0.6,
): Promise<T> {
  const response = await ai.chat.completions.create({
    model: getAiModel(),
    messages,
    temperature,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Mr.Software AI returned an empty response");
  }

  const parsed = extractJson(content);
  return schema.parse(parsed);
}
