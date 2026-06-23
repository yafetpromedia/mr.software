import { NextResponse } from "next/server";
import { planSoftwareArchitecture } from "@/lib/ai/architect";
import { isAiConfigured } from "@/lib/ai/config";
import { architectRequestSchema } from "@/lib/ai/schema";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to use Mr.Software AI" }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Mr.Software AI is not configured. Add AI_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(`ai-architect:${session.id}:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = architectRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const plan = await planSoftwareArchitecture(parsed.data.idea, parsed.data.context, session.id);
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("POST /api/ai/architect", err);
    const message =
      err instanceof Error && err.name === "ZodError"
        ? "Mr.Software AI returned an invalid plan. Please try again."
        : err instanceof Error
          ? err.message
          : "Planning failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
