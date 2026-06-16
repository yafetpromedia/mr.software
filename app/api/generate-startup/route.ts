import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateStartupFromIdea } from "@/lib/startup/generate";
import { saveGeneratedStartup } from "@/lib/startup/db";
import { generateStartupBodySchema, generatedStartupPayloadSchema } from "@/lib/startup/schema";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to generate startups" }, { status: 401 });
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
  const payload = generateStartupFromIdea(idea);
  const validated = generatedStartupPayloadSchema.safeParse(payload);
  if (!validated.success) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }

  if (save) {
    const record = await saveGeneratedStartup(session.id, idea, validated.data);
    return NextResponse.json({
      startup: {
        id: record.id,
        idea: record.idea,
        payload: record.payload,
        createdAt: record.createdAt.toISOString(),
      },
    });
  }

  return NextResponse.json({ payload: validated.data });
}
