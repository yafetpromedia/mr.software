import { DeploymentStatus } from "@prisma/client";
import { processDeploymentZip } from "@/lib/deploy/process-deployment";
import { stopRuntime } from "@/lib/deploy/runtime-manager";
import { downloadGithubRepoArchive } from "@/lib/github/api";
import { getGithubAccessToken } from "@/lib/github/connection";
import { MAX_ZIP_BYTES } from "@/lib/deploy/constants";
import { prisma } from "@/lib/prisma";

export async function redeployFromGithub(
  deploymentId: string,
  request: Request,
): Promise<void> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  if (!deployment?.githubOwner || !deployment.githubRepo || !deployment.githubBranch) {
    return;
  }

  const token = await getGithubAccessToken(deployment.userId);
  if (!token) {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: DeploymentStatus.FAILED,
        errorMessage: "GitHub disconnected — reconnect to auto-deploy.",
      },
    });
    return;
  }

  stopRuntime(deploymentId);
  await prisma.deployment.update({
    where: { id: deploymentId },
    data: { status: DeploymentStatus.PENDING, errorMessage: null },
  });

  try {
    const zipBuffer = await downloadGithubRepoArchive({
      accessToken: token,
      owner: deployment.githubOwner,
      repo: deployment.githubRepo,
      ref: deployment.githubBranch,
    });

    if (zipBuffer.length > MAX_ZIP_BYTES) {
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: DeploymentStatus.FAILED,
          errorMessage: `Repository archive exceeds ${MAX_ZIP_BYTES / (1024 * 1024)} MB limit.`,
        },
      });
      return;
    }

    await processDeploymentZip({ deploymentId, zipBuffer, request });
  } catch (e) {
    console.error("redeployFromGithub", deploymentId, e);
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: DeploymentStatus.FAILED,
        errorMessage: e instanceof Error ? e.message : "Auto-deploy failed",
      },
    });
  }
}
