import { prisma } from "@/lib/prisma";
import { stopRuntime } from "@/lib/deploy/runtime-manager";
import { deleteDeploymentFiles } from "@/lib/deploy/storage";
import { getGithubAccessToken } from "@/lib/github/connection";
import { deleteGithubRepoWebhook } from "@/lib/github/webhooks";

export async function deleteDeployment(
  deploymentId: string,
  userId: string,
): Promise<boolean> {
  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, userId },
    select: {
      id: true,
      userId: true,
      githubOwner: true,
      githubRepo: true,
      githubWebhookId: true,
    },
  });
  if (!deployment) return false;

  if (deployment.githubWebhookId && deployment.githubOwner && deployment.githubRepo) {
    const token = await getGithubAccessToken(userId);
    if (token) {
      await deleteGithubRepoWebhook({
        accessToken: token,
        owner: deployment.githubOwner,
        repo: deployment.githubRepo,
        hookId: deployment.githubWebhookId,
      }).catch((e) => console.error("delete webhook", e));
    }
  }

  stopRuntime(deploymentId);
  await deleteDeploymentFiles(deployment);
  await prisma.deployment.delete({ where: { id: deploymentId } });
  return true;
}
