import { DeploymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Best-effort public URL for a hosted app tied to a catalog software row (developer deployment). */
export async function getAppOpenUrlForSoftware(softwareId: string): Promise<string | null> {
  const d = await prisma.deployment.findFirst({
    where: { softwareId, status: DeploymentStatus.ACTIVE, url: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { url: true },
  });
  if (!d?.url) return null;
  if (d.url.startsWith("http://") || d.url.startsWith("https://")) return d.url;
  return `https://${d.url}`;
}
