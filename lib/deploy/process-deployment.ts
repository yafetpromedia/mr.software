import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DeploymentStatus } from "@prisma/client";
import { notifyDeploymentResult } from "@/lib/notifications/events";
import { logSecurityEvent } from "@/lib/security/log";
import { prisma } from "@/lib/prisma";
import { MAX_ZIP_BYTES } from "./constants";
import { appBaseUrlFromRequest, buildDeploymentPublicUrl } from "./public-url";
import { extractZipSafely } from "./safe-unzip";
import { uploadExtractedSite } from "./storage";

async function findIndexHtml(root: string): Promise<string | null> {
  const { readdir } = await import("node:fs/promises");
  const { join: j } = await import("node:path");

  async function walk(dir: string): Promise<string | null> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = j(dir, e.name);
      if (e.isFile() && e.name.toLowerCase() === "index.html") {
        return p;
      }
      if (e.isDirectory()) {
        const found = await walk(p);
        if (found) return found;
      }
    }
    return null;
  }

  return walk(root);
}

async function notifyDeployOutcome(deploymentId: string) {
  const row = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    select: { id: true, userId: true, name: true, status: true, url: true, errorMessage: true },
  });
  if (!row) return;
  if (row.status === DeploymentStatus.ACTIVE) {
    await notifyDeploymentResult({
      userId: row.userId,
      deploymentId: row.id,
      name: row.name,
      success: true,
      url: row.url,
    }).catch((e) => console.error("deploy notification", e));
  } else if (row.status === DeploymentStatus.FAILED) {
    await notifyDeploymentResult({
      userId: row.userId,
      deploymentId: row.id,
      name: row.name,
      success: false,
      errorMessage: row.errorMessage,
    }).catch((e) => console.error("deploy notification", e));
  }
}

export async function processDeploymentZip(input: {
  deploymentId: string;
  zipBuffer: Buffer;
  request: Request;
}): Promise<void> {
  const { deploymentId, zipBuffer, request } = input;

  if (zipBuffer.length > MAX_ZIP_BYTES) {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: DeploymentStatus.FAILED,
        errorMessage: `ZIP exceeds ${MAX_ZIP_BYTES} bytes`,
      },
    });
    await notifyDeployOutcome(deploymentId);
    return;
  }

  const tmpRoot = await mkdtemp(join(tmpdir(), "mr-deploy-"));

  try {
    try {
      await extractZipSafely(zipBuffer, tmpRoot);
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.includes("zip slip") ||
          e.message.includes("Too many") ||
          e.message.includes("Blocked file"))
      ) {
        logSecurityEvent("SUSPICIOUS_ZIP", e.message, {
          deploymentId,
        });
      }
      throw e;
    }

    const indexPath = await findIndexHtml(tmpRoot);
    if (!indexPath) {
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: DeploymentStatus.FAILED,
          errorMessage:
            "No index.html found in the archive (static sites must include index.html).",
        },
      });
      await notifyDeployOutcome(deploymentId);
      return;
    }

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
    });
    if (!deployment) return;

    await uploadExtractedSite({
      deployment,
      extractRoot: tmpRoot,
    });

    const base = appBaseUrlFromRequest(request);
    const url = buildDeploymentPublicUrl(deployment, base);

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: DeploymentStatus.ACTIVE,
        url,
        errorMessage: null,
      },
    });
    await notifyDeployOutcome(deploymentId);
  } catch (e) {
    console.error("processDeploymentZip", e);
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: DeploymentStatus.FAILED,
        errorMessage:
          e instanceof Error ? e.message : "Deployment processing failed",
      },
    });
    await notifyDeployOutcome(deploymentId);
  } finally {
    await rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
  }
}
