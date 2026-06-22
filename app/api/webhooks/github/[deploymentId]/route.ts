import { NextResponse } from "next/server";
import { redeployFromGithub } from "@/lib/github/redeploy";
import {
  getGithubWebhookSecret,
  verifyGithubWebhookSignature,
} from "@/lib/github/webhooks";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ deploymentId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const secret = getGithubWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhooks not configured" }, { status: 503 });
  }

  const { deploymentId } = await context.params;
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyGithubWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  if (event === "ping") {
    return NextResponse.json({ ok: true, ping: true });
  }

  if (event !== "push") {
    return NextResponse.json({ ok: true, ignored: event });
  }

  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    select: {
      id: true,
      autoDeploy: true,
      githubBranch: true,
    },
  });

  if (!deployment?.autoDeploy || !deployment.githubBranch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let payload: { ref?: string };
  try {
    payload = JSON.parse(rawBody) as { ref?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pushedBranch = payload.ref?.replace(/^refs\/heads\//, "");
  if (pushedBranch !== deployment.githubBranch) {
    return NextResponse.json({ ok: true, skipped: "branch_mismatch" });
  }

  void redeployFromGithub(deploymentId, request);

  return NextResponse.json({ ok: true, redeploying: true }, { status: 202 });
}
