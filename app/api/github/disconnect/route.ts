import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteGithubConnection } from "@/lib/github/connection";

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteGithubConnection(session.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not connected" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
