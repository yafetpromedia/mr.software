import { NextResponse } from "next/server";
import { analyzeStartupIdea } from "@/lib/ai/startup-advisor";
import { isAiConfigured } from "@/lib/ai/config";
import { createAdvisorConversation } from "@/lib/ai/conversations";
import { startupAdvisorRequestSchema } from "@/lib/ai/schema";
import { generateStartupFromIdea } from "@/lib/startup/generate";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

function offlineAdvisorFallback(idea: string) {
  const payload = generateStartupFromIdea(idea);
  return {
    projectName: payload.name,
    problem: `Teams struggle to launch and monetize ${idea.trim().slice(0, 80)} efficiently.`,
    solution: payload.tagline,
    targetUsers: ["Founders", "Developers", "Small business operators"],
    features: payload.features,
    pricingIdeas: payload.pricing.map((plan) => ({
      name: plan.name,
      price: plan.price,
      rationale: plan.description ?? "Suggested tier for early validation.",
    })),
    marketOpportunities: [
      "Underserved vertical workflows",
      "Regional pricing for emerging markets",
      "Integration with existing Mr.Software marketplace distribution",
    ],
    businessModel: "Subscription SaaS with a free tier for validation and paid plans for teams.",
    technicalArchitecture: {
      frontend: "Next.js",
      backend: "NestJS or Next.js API routes",
      database: "PostgreSQL",
      modules: payload.features.slice(0, 6),
    },
    deploymentPlan: "Deploy on Mr.Software cloud infrastructure with staging and production environments.",
    monetizationStrategy: "Freemium entry, Pro subscription, and optional marketplace listing revenue.",
    source: "offline" as const,
  };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to use Mr.Software Advisor" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(`ai-advisor:${session.id}:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = startupAdvisorRequestSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { idea, save } = parsed.data;

  try {
    const analysis = isAiConfigured()
      ? { ...(await analyzeStartupIdea(idea)), source: "ai" as const }
      : offlineAdvisorFallback(idea);

    if (save) {
      const conversation = await createAdvisorConversation(session.id, idea, analysis);
      return NextResponse.json({
        analysis,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt.toISOString(),
        },
        aiEnabled: isAiConfigured(),
      });
    }

    return NextResponse.json({ analysis, aiEnabled: isAiConfigured() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
