import type { z } from "zod";
import { ai } from "@/lib/ai/client";
import { getAiModel } from "@/lib/ai/config";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type CompleteTextOptions = {
  maxTokens?: number;
};

function stripThinkingArtifacts(text: string): string {
  let out = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");
  const open = "`" + "<" + "think" + ">";
  const close = "`" + "<" + "/" + "think" + ">";
  while (true) {
    const start = out.indexOf(open);
    if (start === -1) break;
    const end = out.indexOf(close, start);
    if (end === -1) break;
    out = out.slice(0, start) + out.slice(end + close.length);
  }
  return out.trim();
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(raw);
}

export async function completeText(
  messages: ChatMessage[],
  temperature = 0.7,
  options?: CompleteTextOptions,
): Promise<string> {
  const response = await ai.chat.completions.create({
    model: getAiModel(),
    messages,
    temperature,
    ...(options?.maxTokens ? { max_tokens: options.maxTokens } : {}),
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Mr.Software AI returned an empty response");
  }
  return stripThinkingArtifacts(raw);
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
