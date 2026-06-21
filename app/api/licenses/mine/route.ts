import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { licenseTierLabel } from "@/lib/trust/license-types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.softwareLicenseKey.findMany({
    where: { userId: session.id },
    orderBy: { issuedAt: "desc" },
    include: {
      software: {
        select: {
          id: true,
          name: true,
          licenseTier: true,
          thumbnailUrl: true,
        },
      },
    },
  });

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      softwareId: row.softwareId,
      product: row.software.name,
      licenseKey: row.licenseKey,
      status: row.status,
      tier: licenseTierLabel(row.software.licenseTier),
      issuedAt: row.issuedAt.toISOString(),
      expires: row.expiresAt?.toISOString().slice(0, 10) ?? null,
      certificateUrl: `/trust/certificate/${encodeURIComponent(row.licenseKey)}`,
    })),
  );
}
