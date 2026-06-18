import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.AI_API_KEY?.trim();
if (!apiKey) {
  console.error("AI_API_KEY not set");
  process.exit(1);
}

const candidates = [
  { baseURL: "https://api.freemodel.dev/v1", model: "claude-t0" },
  { baseURL: "https://api.freemodel.dev", model: "claude-t0" },
  { baseURL: "https://cc.freemodel.dev/v1", model: "claude-t0" },
  { baseURL: "https://cc.freemodel.dev", model: "claude-t0" },
  { baseURL: "https://api.freemodel.dev/v1", model: "claude-sonnet-4-20250514" },
  { baseURL: "https://api.freemodel.dev/v1", model: "gpt-4o-mini" },
];

async function tryOne(baseURL: string, model: string) {
  const ai = new OpenAI({ apiKey, baseURL });
  const response = await ai.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Reply OK" }],
    max_tokens: 8,
  });
  return response.choices[0]?.message?.content?.trim() ?? "(empty)";
}

async function main() {
  for (const { baseURL, model } of candidates) {
    process.stdout.write(`Trying ${baseURL} + ${model} … `);
    try {
      const text = await tryOne(baseURL, model);
      console.log(`OK → "${text}"`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAIL → ${msg.slice(0, 80)}`);
    }
  }
}

void main();
