import OpenAI from "openai";

function aiBaseUrl(): string {
  const raw = process.env.AI_BASE_URL?.trim();
  if (raw?.endsWith("/v1")) return raw;
  return `${(raw || "https://api.freemodel.dev").replace(/\/$/, "")}/v1`;
}

let cached: OpenAI | undefined;

function createAiClient(): OpenAI {
  const apiKey = process.env.AI_API_KEY?.trim() || "build-placeholder";
  return new OpenAI({
    apiKey,
    baseURL: aiBaseUrl(),
  });
}

/** Mr.Software AI — server-side only. Never import in client components. */
export function getAiClient(): OpenAI {
  if (!cached) {
    cached = createAiClient();
  }
  return cached;
}

export const ai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getAiClient();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
