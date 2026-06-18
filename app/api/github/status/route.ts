import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isGithubConfigured } from "@/lib/github/config";
import { getGithubConnection } from "@/lib/github/connection";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await getGithubConnection(session.id);

  return NextResponse.json({
    configured: isGithubConfigured(),
    connected: Boolean(connection),
    connection: connection
      ? {
          login: connection.login,
          githubId: connection.githubId,
          connectedAt: connection.createdAt.toISOString(),
        }
      : null,
  });
}
