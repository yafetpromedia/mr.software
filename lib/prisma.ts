import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/** Bump when Prisma schema changes so dev HMR picks up a fresh client. */
const PRISMA_CLIENT_GENERATION = "2026-06-21-distribution-type";

const REQUIRED_DELEGATES = [
  "userReport",
  "academySectionSettings",
  "academyCourse",
  "developerAccessRequest",
  "factorySession",
  "ownershipRecord",
  "softwareLicenseKey",
] as const;

function clientHasRequiredModels(client: PrismaClient): boolean {
  const record = client as unknown as Record<string, unknown>;
  return REQUIRED_DELEGATES.every((key) => {
    const delegate = record[key];
    return typeof delegate === "object" && delegate !== null;
  });
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaGeneration?: string;
};

function getPrismaClient(): PrismaClient {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaGeneration === PRISMA_CLIENT_GENERATION &&
    clientHasRequiredModels(globalForPrisma.prisma)
  ) {
    return globalForPrisma.prisma;
  }
  const client = createPrismaClient();
  if (!clientHasRequiredModels(client)) {
    console.warn(
      "[prisma] Client is missing schema models. Run `npx prisma generate` and restart the dev server.",
    );
  }
  globalForPrisma.prisma = client;
  globalForPrisma.prismaGeneration = PRISMA_CLIENT_GENERATION;
  return client;
}

export const prisma = getPrismaClient();
