import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { savePushSubscription } from "@/lib/notifications/push";
import { pushSubscribeSchema } from "@/lib/validation/notifications";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = pushSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const ua = request.headers.get("user-agent") ?? undefined;

  await savePushSubscription({
    userId: session.id,
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
    userAgent: ua,
  });

  return NextResponse.json({ ok: true });
}
