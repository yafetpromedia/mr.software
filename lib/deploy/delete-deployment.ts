import { prisma } from "@/lib/prisma";
import { stopRuntime } from "@/lib/deploy/runtime-manager";
import { deleteDeploymentFiles } from "@/lib/deploy/storage";

export async function deleteDeployment(
  deploymentId: string,
  userId: string,
): Promise<boolean> {
  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, userId },
    select: { id: true, userId: true },
  });
  if (!deployment) return false;

  stopRuntime(deploymentId);
  await deleteDeploymentFiles(deployment);
  await prisma.deployment.delete({ where: { id: deploymentId } });
  return true;
}
