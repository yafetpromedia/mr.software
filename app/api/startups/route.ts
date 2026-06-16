import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listGeneratedStartupsForUser } from "@/lib/startup/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startups = await listGeneratedStartupsForUser(session.id);
  return NextResponse.json({
    startups: startups.map((s) => ({
      id: s.id,
      idea: s.idea,
      name: s.payload.name,
      tagline: s.payload.tagline,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
