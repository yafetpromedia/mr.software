import { DeploymentStatus, type FactoryStep } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  FACTORY_STEP_LABELS,
  FACTORY_STEP_ORDER,
  type FactoryProgress,
  type FactoryProgressItem,
} from "@/lib/factory/types";

function stepHref(step: FactoryStep, sessionId: string | null): string {
  const base = sessionId ? `/app/factory?session=${sessionId}` : "/app/factory";
  const map: Record<FactoryStep, string> = {
    IDEA: base,
    VALIDATION: `${base}&step=validation`,
    PACKAGE: `${base}&step=package`,
    DEPLOY: `${base}&step=deploy`,
    STOREFRONT: `${base}&step=storefront`,
    LISTING: `${base}&step=listing`,
    COMPLETE: `${base}&step=complete`,
  };
  return map[step];
}

export async function getFactoryProgress(userId: string): Promise<FactoryProgress> {
  const [session, storefront, startupCount, activeDeploy, listingCount] = await Promise.all([
    prisma.factorySession.findFirst({
      where: { userId, completedAt: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        currentStep: true,
        analysisJson: true,
        startupId: true,
        deploymentId: true,
        softwareId: true,
      },
    }),
    prisma.developerStorefront.findUnique({
      where: { userId },
      select: { handle: true },
    }),
    prisma.generatedStartup.count({ where: { userId } }),
    prisma.deployment.findFirst({
      where: { userId, status: DeploymentStatus.ACTIVE },
      select: { id: true },
    }),
    prisma.software.count({ where: { developerId: userId } }),
  ]);

  const hasAnalysis = Boolean(session?.analysisJson);
  const hasPackage = Boolean(session?.startupId) || startupCount > 0;
  const hasDeploy = Boolean(session?.deploymentId) || Boolean(activeDeploy);
  const hasStorefront = Boolean(storefront?.handle);
  const hasListing = Boolean(session?.softwareId) || listingCount > 0;

  const doneByStep: Record<FactoryStep, boolean> = {
    IDEA: Boolean(session?.id),
    VALIDATION: hasAnalysis,
    PACKAGE: hasPackage,
    DEPLOY: hasDeploy,
    STOREFRONT: hasStorefront,
    LISTING: hasListing,
    COMPLETE: hasListing && hasStorefront && hasPackage,
  };

  const sessionId = session?.id ?? null;
  const items: FactoryProgressItem[] = FACTORY_STEP_ORDER.filter((s) => s !== "COMPLETE").map(
    (step) => ({
      step,
      label: FACTORY_STEP_LABELS[step],
      done: doneByStep[step],
      href: stepHref(step, sessionId),
    }),
  );

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  return {
    items,
    completedCount,
    totalCount,
    percent: totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    activeSessionId: sessionId,
  };
}
