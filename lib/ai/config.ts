/** Mr.Software AI engine — OpenAI-compatible providers (FreeModel, etc.). */

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY?.trim());
}

export function getAiApiKey(): string {
  const key = process.env.AI_API_KEY?.trim();
  if (!key) {
    throw new Error("AI_API_KEY is not configured");
  }
  return key;
}

export function getAiBaseUrl(): string {
  const raw = process.env.AI_BASE_URL?.trim() || "https://api.freemodel.dev/v1";
  return raw.endsWith("/v1") ? raw : raw.replace(/\/$/, "") + "/v1";
}

export function getAiModel(): string {
  return process.env.AI_MODEL?.trim() || "claude-t0";
}
