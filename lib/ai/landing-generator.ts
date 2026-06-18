import { LANDING_GENERATOR_SYSTEM } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/chat";
import { isAiConfigured } from "@/lib/ai/config";
import { aiLandingPayloadSchema } from "@/lib/startup/ai-landing-schema";
import { generatedStartupPayloadSchema } from "@/lib/startup/schema";
import type { GeneratedStartupPayload } from "@/lib/startup/types";

const AI_PAYLOAD_PROMPT = `Generate a complete startup landing package from the user's idea.

Rules:
- Every field must reflect the user's specific request (audience, style, visuals, features).
- If they ask for images or photos: include hero.imageUrl AND a showcase section with imageUrl.
  Pick relevant https://images.unsplash.com/photo-... URLs (real Unsplash links only).
- If they ask for 3D or modern visuals: set brand.enable3d to true and brand.visualStyle to "bold".
- Do not use placeholder text. Do not ignore parts of the idea.

Respond with JSON only:
{
  "name": string,
  "tagline": string,
  "features": string[],
  "pricing": [{ "name": string, "price": string, "description"?: string, "highlighted"?: boolean }],
  "landingSections": [
    { "type": "hero", "headline": string, "subheadline": string, "cta": string, "imageUrl"?: string, "imageAlt"?: string },
    { "type": "showcase", "title": string, "caption": string, "imageUrl": string, "imageAlt"?: string },
    { "type": "features", "title": string, "items": string[] },
    { "type": "pricing", "title": string, "plans": [...] },
    { "type": "cta", "title": string, "subtitle": string, "button": string }
  ],
  "brand": { "primaryHue": number, "label": string, "enable3d"?: boolean, "visualStyle"?: "modern"|"minimal"|"bold" }
}

User idea:`;

export class AiGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiGenerationError";
  }
}

/** 100% Mr.Software AI — no templates, no keyword injection, no silent fallbacks. */
export async function generateStartupWithAi(idea: string): Promise<GeneratedStartupPayload> {
  if (!isAiConfigured()) {
    throw new AiGenerationError(
      "Mr.Software AI is not configured. Add AI_API_KEY to your .env file.",
    );
  }

  const raw = await completeJson(
    [
      { role: "system", content: LANDING_GENERATOR_SYSTEM },
      { role: "user", content: `${AI_PAYLOAD_PROMPT}\n${idea}` },
    ],
    aiLandingPayloadSchema,
  );

  const validated = generatedStartupPayloadSchema.safeParse(raw);
  if (!validated.success) {
    throw new AiGenerationError(
      "Mr.Software AI returned an invalid draft. Try rephrasing your idea.",
    );
  }

  return validated.data;
}
