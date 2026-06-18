import { prisma } from "@/lib/prisma";
import { generatedStartupPayloadSchema } from "./schema";
import type { GeneratedStartupPayload, GeneratedStartupRecord } from "./types";

function parseRecord(row: {
  id: string;
  userId: string;
  idea: string;
  generatedJson: unknown;
  createdAt: Date;
}): GeneratedStartupRecord | null {
  const parsed = generatedStartupPayloadSchema.safeParse(row.generatedJson);
  if (!parsed.success) return null;
  return {
    id: row.id,
    userId: row.userId,
    idea: row.idea,
    payload: parsed.data,
    createdAt: row.createdAt,
  };
}

export async function saveGeneratedStartup(
  userId: string,
  idea: string,
  payload: GeneratedStartupPayload,
) {
  const row = await prisma.generatedStartup.create({
    data: {
      userId,
      idea,
      generatedJson: payload,
    },
  });
  return parseRecord(row)!;
}

export async function getGeneratedStartupById(
  id: string,
): Promise<GeneratedStartupRecord | null> {
  const row = await prisma.generatedStartup.findUnique({ where: { id } });
  if (!row) return null;
  return parseRecord(row);
}

export async function listGeneratedStartupsForUser(
  userId: string,
  limit = 20,
): Promise<GeneratedStartupRecord[]> {
  const rows = await prisma.generatedStartup.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => parseRecord(r)).filter((r): r is GeneratedStartupRecord => r !== null);
}

export async function deleteGeneratedStartup(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.generatedStartup.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.generatedStartup.delete({ where: { id } });
  return true;
}
