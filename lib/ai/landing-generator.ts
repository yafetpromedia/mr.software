import { LANDING_GENERATOR_SYSTEM } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/chat";
import { isAiConfigured } from "@/lib/ai/config";
import { generateStartupFromIdea } from "@/lib/startup/generate";
import { generatedStartupPayloadSchema } from "@/lib/startup/schema";
import type { GeneratedStartupPayload } from "@/lib/startup/types";

export async function generateStartupWithAi(idea: string): Promise<GeneratedStartupPayload> {
  if (!isAiConfigured()) {
    return generateStartupFromIdea(idea);
  }

  try {
    return await completeJson(
      [
        { role: "system", content: LANDING_GENERATOR_SYSTEM },
        {
          role: "user",
          content: `Generate a startup landing package for this idea. Respond with JSON:
{
  "name": string,
  "tagline": string,
  "features": string[],
  "pricing": [{ "name": string, "price": string, "description"?: string, "highlighted"?: boolean }],
  "landingSections": [
    { "type": "hero", "headline": string, "subheadline": string, "cta": string },
    { "type": "features", "title": string, "items": string[] },
    { "type": "pricing", "title": string, "plans": [{ "name": string, "price": string, "description"?: string, "highlighted"?: boolean }] },
    { "type": "cta", "title": string, "subtitle": string, "button": string }
  ],
  "brand": { "primaryHue": number (0-360), "label": string }
}

Idea:
${idea}`,
        },
      ],
      generatedStartupPayloadSchema,
    );
  } catch {
    return generateStartupFromIdea(idea);
  }
}
