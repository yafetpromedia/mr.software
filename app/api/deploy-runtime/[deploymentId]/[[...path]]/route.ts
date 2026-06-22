import { NextResponse } from "next/server";
import { DeploymentStatus } from "@prisma/client";
import {
  ensureRuntimeForDeployment,
  getRuntimePort,
  proxyToRuntime,
} from "@/lib/deploy/runtime-manager";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ deploymentId: string; path?: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  return handleRuntimeRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleRuntimeRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRuntimeRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleRuntimeRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRuntimeRequest(request, context);
}

async function handleRuntimeRequest(request: Request, context: RouteContext) {
  const { deploymentId, path: pathSegs } = await context.params;
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });

  if (!deployment || deployment.status !== DeploymentStatus.ACTIVE) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (deployment.runtime === "STATIC") {
    return NextResponse.redirect(new URL(`/api/deploy-preview/${deploymentId}/`, request.url));
  }

  let port = deployment.runtimePort ?? getRuntimePort(deploymentId);

  try {
    if (!port) {
      port = await ensureRuntimeForDeployment(deployment);
      if (port !== deployment.runtimePort) {
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: { runtimePort: port },
        });
      }
    }
  } catch (e) {
    console.error("deploy-runtime start", e);
    return NextResponse.json(
      {
        error:
          "Runtime failed to start. Install Node.js, PHP, or Python on the host, or upload a pre-built static export.",
      },
      { status: 503 },
    );
  }

  if (!port) {
    return NextResponse.json({ error: "Runtime unavailable" }, { status: 503 });
  }

  const relPath = `/${(pathSegs ?? []).join("/")}`;
  return proxyToRuntime(port, relPath, request);
}
