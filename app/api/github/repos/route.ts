import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { getGithubAccessToken } from "@/lib/github/connection";
import { listGithubRepos } from "@/lib/github/api";
import { isGithubConfigured } from "@/lib/github/config";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGithubConfigured()) {
    return NextResponse.json({ error: "GitHub is not configured" }, { status: 503 });
  }

  const token = await getGithubAccessToken(session.id);
  if (!token) {
    return NextResponse.json({ error: "Connect GitHub first" }, { status: 400 });
  }

  try {
    const repos = await listGithubRepos(token);
    return NextResponse.json({ repos });
  } catch {
    return NextResponse.json({ error: "Could not load repositories" }, { status: 502 });
  }
}
