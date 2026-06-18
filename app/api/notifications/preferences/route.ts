import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications/preferences";
import { notificationPreferencesSchema } from "@/lib/validation/notifications";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getNotificationPreferences(session.id);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
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

  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const preferences = await updateNotificationPreferences(session.id, parsed.data);
  return NextResponse.json({ preferences });
}
