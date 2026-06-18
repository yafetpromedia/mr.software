import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { removePushSubscription } from "@/lib/notifications/push";
import { pushUnsubscribeSchema } from "@/lib/validation/notifications";

export async function DELETE(request: Request) {
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

  const parsed = pushUnsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  await removePushSubscription(session.id, parsed.data.endpoint);
  return NextResponse.json({ ok: true });
}
