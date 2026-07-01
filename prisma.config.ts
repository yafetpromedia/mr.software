import "dotenv/config";
import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

const DEFAULT_URL =
  "postgresql://postgres:postgres@localhost:5432/mr_software?schema=public";

function composeDatabaseUrl(): string | null {
  const password = process.env.POSTGRES_PASSWORD?.trim();
  if (!password || !existsSync("/.dockerenv")) return null;

  const user = process.env.POSTGRES_USER?.trim() || "postgres";
  const db = process.env.POSTGRES_DB?.trim() || "mr_software";
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@db:5432/${encodeURIComponent(db)}?schema=public`;
}

/** Self-contained for Docker `prisma generate` / `db push` (no extra lib imports). */
function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string {
  const fromCompose = composeDatabaseUrl();
  if (fromCompose) return fromCompose;

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
