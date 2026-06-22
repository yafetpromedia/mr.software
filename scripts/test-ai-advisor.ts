import "dotenv/config";
import { analyzeStartupIdea } from "@/lib/ai/startup-advisor";
import { isAiConfigured } from "@/lib/ai/config";

async function main() {
  if (!isAiConfigured()) {
    console.error("FAIL: AI_API_KEY not configured");
    process.exit(1);
  }

  console.log("Testing real Mr.Software Startup Advisor (structured JSON)…\n");

  const idea = "School management SaaS for private schools in Ethiopia";
  const start = Date.now();

  try {
    const analysis = await analyzeStartupIdea(idea, "");
    const ms = Date.now() - start;

    console.log("SUCCESS: Real AI returned structured blueprint.\n");
    console.log(`  Time:         ${ms}ms`);
    console.log(`  Project:      ${analysis.projectName}`);
    console.log(`  Problem:      ${analysis.problem.slice(0, 100)}…`);
    console.log(`  Features:     ${analysis.features.length} items`);
    console.log(`  Target users: ${analysis.targetUsers.join(", ")}`);
    console.log(`  Stack:        ${analysis.technicalArchitecture.frontend} + ${analysis.technicalArchitecture.backend} + ${analysis.technicalArchitecture.database}`);
    console.log(`  Modules:      ${analysis.technicalArchitecture.modules.slice(0, 4).join(", ")}…`);
  } catch (err) {
    console.error("FAIL: Startup Advisor AI call failed.");
    if (err instanceof Error) console.error(`  ${err.message}`);
    process.exit(1);
  }
}

void main();
