import { NextResponse } from "next/server";
import { AiGenerationError, generateStartupWithAi } from "@/lib/ai/landing-generator";
import { isAiConfigured } from "@/lib/ai/config";
import { getSession } from "@/lib/auth/session";
import { saveGeneratedStartup } from "@/lib/startup/db";
import { notifyAiSaved } from "@/lib/notifications/events";
import { generateStartupBodySchema } from "@/lib/startup/schema";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to generate startups" }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Mr.Software AI is not configured. Add AI_API_KEY to your .env file." },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(`generate-startup:${session.id}:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many generations. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = generateStartupBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { idea, save } = parsed.data;

  try {
    const payload = await generateStartupWithAi(idea, session.id);

    if (save) {
      const record = await saveGeneratedStartup(session.id, idea, payload);
      await notifyAiSaved({
        userId: session.id,
        productLabel: "SaaS Blueprint",
        title: record.idea,
        href: `/startup/${record.id}/dashboard-preview`,
      }).catch((e) => console.error("blueprint notification", e));
      return NextResponse.json({
        source: "ai",
        startup: {
          id: record.id,
          idea: record.idea,
          payload: record.payload,
          createdAt: record.createdAt.toISOString(),
        },
      });
    }

    return NextResponse.json({ source: "ai", payload });
  } catch (err) {
    const message =
      err instanceof AiGenerationError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
