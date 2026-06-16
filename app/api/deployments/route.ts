import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.deployment.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      url: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ deployments: items });
}
