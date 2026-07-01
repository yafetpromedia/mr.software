import "dotenv/config";
import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

const DEFAULT_URL =
  "postgresql://postgres:postgres@localhost:5432/mr_software?schema=public";

/** Self-contained for Docker `prisma generate` / `db push` (no extra lib imports). */
function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string {
  const url = raw?.trim() || DEFAULT_URL;
  if (/\/build(\?|$)/.test(url) || !existsSync("/.dockerenv")) {
    return url;
  }
  return url.replace("@localhost:", "@db:").replace("@127.0.0.1:", "@db:");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
