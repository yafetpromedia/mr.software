import OpenAI from "openai";

/** Mr.Software AI — server-side only. Never import in client components. */
export const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY ?? "",
  baseURL: process.env.AI_BASE_URL?.trim()?.endsWith("/v1")
    ? process.env.AI_BASE_URL.trim()
    : `${(process.env.AI_BASE_URL?.trim() || "https://api.freemodel.dev").replace(/\/$/, "")}/v1`,
});
