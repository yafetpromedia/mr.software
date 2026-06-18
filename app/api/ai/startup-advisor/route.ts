import { NextResponse } from "next/server";
import { analyzeStartupIdea } from "@/lib/ai/startup-advisor";
import { isAiConfigured } from "@/lib/ai/config";
import { createAdvisorConversation } from "@/lib/ai/conversations";
import { notifyAiSaved } from "@/lib/notifications/events";
import { startupAdvisorRequestSchema } from "@/lib/ai/schema";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to use Mr.Software Advisor" }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Mr.Software AI is not configured. Add AI_API_KEY to your .env file." },
      { status: 503 },
    );
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
    const analysis = { ...(await analyzeStartupIdea(idea)), source: "ai" as const };

    if (save) {
      const conversation = await createAdvisorConversation(session.id, idea, analysis);
      await notifyAiSaved({
        userId: session.id,
        productLabel: "Startup Advisor",
        title: conversation.title,
        href: "/app/builder?tab=advisor",
      }).catch((e) => console.error("advisor notification", e));
      return NextResponse.json({
        analysis,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt.toISOString(),
        },
        aiEnabled: true,
      });
    }

    return NextResponse.json({ analysis, aiEnabled: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
