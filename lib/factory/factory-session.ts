import type { FactoryStep, Prisma } from "@prisma/client";
import type { StartupAdvisorAnalysis } from "@/lib/ai/schema";
import { startupAdvisorAnalysisSchema } from "@/lib/ai/schema";
import { prisma } from "@/lib/prisma";
import type { FactorySessionView } from "@/lib/factory/types";

function parseAnalysis(json: Prisma.JsonValue | null): StartupAdvisorAnalysis | null {
  if (!json || typeof json !== "object") return null;
  const parsed = startupAdvisorAnalysisSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

function toView(row: {
  id: string;
  idea: string;
  currentStep: FactoryStep;
  analysisJson: Prisma.JsonValue | null;
  conversationId: string | null;
  startupId: string | null;
  deploymentId: string | null;
  softwareId: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): FactorySessionView {
  return {
    id: row.id,
    idea: row.idea,
    currentStep: row.currentStep,
    analysis: parseAnalysis(row.analysisJson),
    conversationId: row.conversationId,
    startupId: row.startupId,
    deploymentId: row.deploymentId,
    softwareId: row.softwareId,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getActiveFactorySession(userId: string): Promise<FactorySessionView | null> {
  const row = await prisma.factorySession.findFirst({
    where: { userId, completedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  return row ? toView(row) : null;
}

export async function getFactorySessionById(
  userId: string,
  id: string,
): Promise<FactorySessionView | null> {
  const row = await prisma.factorySession.findFirst({
    where: { id, userId },
  });
  return row ? toView(row) : null;
}

export async function createFactorySession(userId: string, idea: string): Promise<FactorySessionView> {
  const row = await prisma.factorySession.create({
    data: {
      userId,
      idea: idea.trim(),
      currentStep: "IDEA",
    },
  });
  return toView(row);
}

export type FactorySessionPatch = {
  currentStep?: FactoryStep;
  idea?: string;
  analysis?: StartupAdvisorAnalysis;
  conversationId?: string | null;
  startupId?: string | null;
  deploymentId?: string | null;
  softwareId?: string | null;
  completedAt?: Date | null;
};

export async function updateFactorySession(
  userId: string,
  id: string,
  patch: FactorySessionPatch,
): Promise<FactorySessionView | null> {
  const existing = await prisma.factorySession.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: Prisma.FactorySessionUpdateInput = {};
  if (patch.currentStep !== undefined) data.currentStep = patch.currentStep;
  if (patch.idea !== undefined) data.idea = patch.idea.trim();
  if (patch.analysis !== undefined) data.analysisJson = patch.analysis as Prisma.InputJsonValue;
  if (patch.conversationId !== undefined) data.conversationId = patch.conversationId;
  if (patch.startupId !== undefined) data.startupId = patch.startupId;
  if (patch.deploymentId !== undefined) data.deploymentId = patch.deploymentId;
  if (patch.softwareId !== undefined) data.softwareId = patch.softwareId;
  if (patch.completedAt !== undefined) data.completedAt = patch.completedAt;

  const row = await prisma.factorySession.update({
    where: { id },
    data,
  });
  return toView(row);
}
