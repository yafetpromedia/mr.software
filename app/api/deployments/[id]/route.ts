import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { deleteDeployment } from "@/lib/deploy/delete-deployment";
import { prisma } from "@/lib/prisma";
import { deploymentUpdateSchema } from "@/lib/validation/deployment";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const deployment = await prisma.deployment.findFirst({
    where: { id, userId: session.id },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      runtime: true,
      framework: true,
      url: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
      softwareId: true,
    },
  });

  if (!deployment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ deployment });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userCanDeploy(session.role)) {
      return NextResponse.json({ error: "Developer access required" }, { status: 403 });
    }

    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = deploymentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const existing = await prisma.deployment.findFirst({
      where: { id, userId: session.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const deployment = await prisma.deployment.update({
      where: { id },
      data: { name: parsed.data.name },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        runtime: true,
        framework: true,
        url: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        softwareId: true,
      },
    });

    return NextResponse.json({ deployment });
  } catch (e) {
    console.error("PATCH /api/deployments/[id]", e);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userCanDeploy(session.role)) {
      return NextResponse.json({ error: "Developer access required" }, { status: 403 });
    }

    const { id } = await context.params;
    const ok = await deleteDeployment(id, session.id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/deployments/[id]", e);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
