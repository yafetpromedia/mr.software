import "dotenv/config";
import OpenAI from "openai";

async function main() {
  const apiKey = process.env.AI_API_KEY?.trim();
  const baseURL = process.env.AI_BASE_URL?.trim() || "https://api.freemodel.dev/v1";
  const normalizedBase = baseURL.endsWith("/v1")
    ? baseURL
    : `${baseURL.replace(/\/$/, "")}/v1`;
  const model = process.env.AI_MODEL?.trim() || "claude-t0";

  if (!apiKey) {
    console.error("FAIL: AI_API_KEY is not set in .env or .env.local");
    process.exit(1);
  }

  console.log("Testing Mr.Software AI connection…");
  console.log(`  baseURL: ${normalizedBase}`);
  console.log(`  model:   ${model}`);
  console.log(`  key:     ${apiKey.slice(0, 6)}…${apiKey.slice(-4)} (${apiKey.length} chars)`);

  const ai = new OpenAI({ apiKey, baseURL: normalizedBase });

  try {
    const response = await ai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: "Reply with exactly one word: OK",
        },
      ],
      max_tokens: 16,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      console.error("FAIL: Empty response from API");
      process.exit(1);
    }

    console.log("\nSUCCESS: API is working.");
    console.log(`  Response: ${text}`);
    if (response.usage) {
      console.log(
        `  Tokens:   prompt=${response.usage.prompt_tokens ?? "?"} completion=${response.usage.completion_tokens ?? "?"}`,
      );
    }
  } catch (err) {
    console.error("\nFAIL: API request failed.");
    if (err instanceof Error) {
      console.error(`  ${err.message}`);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

void main();
