import { mkdtemp, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { DeploymentStatus } from "@prisma/client";
import { notifyDeploymentResult } from "@/lib/notifications/events";
import { logSecurityEvent } from "@/lib/security/log";
import { prisma } from "@/lib/prisma";
import { MAX_ZIP_BYTES } from "./constants";
import { detectFramework } from "./detect-framework";
import { findProjectRoot } from "./find-project-root";
import { prepareDeployArtifacts } from "./prepare-artifacts";
import { appBaseUrlFromRequest, buildDeploymentPublicUrl } from "./public-url";
import {
  ensureNodeRuntime,
  ensurePhpRuntime,
  ensurePythonRuntime,
} from "./runtime-manager";
import { extractZipSafely } from "./safe-unzip";
import { localDeployRoot, uploadExtractedSite } from "./storage";

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
        logSecurityEvent("SUSPICIOUS_ZIP", e.message, { deploymentId });
      }
      throw e;
    }

    const projectRoot = await findProjectRoot(tmpRoot);
    const detection = await detectFramework(projectRoot);
    const prepared = await prepareDeployArtifacts(projectRoot, detection);

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
    });
    if (!deployment) return;

    await uploadExtractedSite({
      deployment,
      extractRoot: prepared.serveRoot,
    });

    const deployDir = join(localDeployRoot(), deployment.userId, deployment.id);
    let runtimePort: number | null = null;

    if (prepared.runtime === "NODE" && (prepared.nodeEntry || prepared.nodeStartMode === "next-start")) {
      const entryRel =
        prepared.nodeStartMode === "next-start"
          ? "server.js"
          : relative(prepared.serveRoot, prepared.nodeEntry!).replace(/\\/g, "/");
      runtimePort = await ensureNodeRuntime({
        deploymentId: deployment.id,
        cwd: deployDir,
        entry: entryRel || "server.js",
        startMode: prepared.nodeStartMode ?? "file",
      });
    } else if (prepared.runtime === "PHP") {
      runtimePort = await ensurePhpRuntime({
        deploymentId: deployment.id,
        cwd: deployDir,
      });
    } else if (prepared.runtime === "PYTHON") {
      runtimePort = await ensurePythonRuntime({
        deploymentId: deployment.id,
        cwd: deployDir,
        pythonModule: prepared.pythonModule,
      });
    }

    const base = appBaseUrlFromRequest(request);
    const url = buildDeploymentPublicUrl(
      { ...deployment, runtime: prepared.runtime },
      base,
    );

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: DeploymentStatus.ACTIVE,
        runtime: prepared.runtime,
        framework: prepared.frameworkLabel,
        runtimePort,
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
        errorMessage: e instanceof Error ? e.message : "Deployment processing failed",
      },
    });
    await notifyDeployOutcome(deploymentId);
  } finally {
    await rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
  }
}
