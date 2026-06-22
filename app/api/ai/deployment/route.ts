import { NextResponse } from "next/server";
import { adviseDeployment } from "@/lib/ai/deployment-advisor";
import { isAiConfigured } from "@/lib/ai/config";
import { startupAdvisorRequestSchema } from "@/lib/ai/schema";
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
  const rl = checkRateLimit(`ai-deployment:${session.id}:${ip}`, 8, 60_000);
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

  const parsed = startupAdvisorRequestSchema.pick({ idea: true }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const plan = await adviseDeployment(parsed.data.idea, session.id);
    return NextResponse.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Advice failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
