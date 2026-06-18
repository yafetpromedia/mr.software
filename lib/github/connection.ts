import { prisma } from "@/lib/prisma";

export async function getGithubConnection(userId: string) {
  return prisma.gitHubConnection.findUnique({
    where: { userId },
    select: {
      userId: true,
      githubId: true,
      login: true,
      scope: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getGithubAccessToken(userId: string): Promise<string | null> {
  const row = await prisma.gitHubConnection.findUnique({
    where: { userId },
    select: { accessToken: true },
  });
  return row?.accessToken ?? null;
}

export async function upsertGithubConnection(input: {
  userId: string;
  githubId: number;
  login: string;
  accessToken: string;
  scope?: string;
}) {
  return prisma.gitHubConnection.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      githubId: input.githubId,
      login: input.login,
      accessToken: input.accessToken,
      scope: input.scope,
    },
    update: {
      githubId: input.githubId,
      login: input.login,
      accessToken: input.accessToken,
      scope: input.scope,
    },
  });
}

export async function deleteGithubConnection(userId: string): Promise<boolean> {
  const existing = await prisma.gitHubConnection.findUnique({
    where: { userId },
    select: { userId: true },
  });
  if (!existing) return false;
  await prisma.gitHubConnection.delete({ where: { userId } });
  return true;
}
