import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  countUnreadNotifications,
  listNotifications,
} from "@/lib/notifications/service";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 30), 50);

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(session.id, limit),
    countUnreadNotifications(session.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
