import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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
