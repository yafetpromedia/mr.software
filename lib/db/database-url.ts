import { existsSync } from "node:fs";

const DEFAULT_URL =
  "postgresql://postgres:postgres@localhost:5432/mr_software?schema=public";

function isBuildDatabaseUrl(url: string): boolean {
  return /\/build(\?|$)/.test(url);
}

function composeDatabaseUrl(): string | null {
  const password = process.env.POSTGRES_PASSWORD?.trim();
  if (!password || !existsSync("/.dockerenv")) return null;

  const user = process.env.POSTGRES_USER?.trim() || "postgres";
  const db = process.env.POSTGRES_DB?.trim() || "mr_software";
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@db:5432/${encodeURIComponent(db)}?schema=public`;
}

/**
 * Postgres in Compose is service `db`. Prefer POSTGRES_* in Docker so DATABASE_URL
 * cannot drift from the password the `db` container was initialized with.
 */
export function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string {
  const fromCompose = composeDatabaseUrl();
  if (fromCompose) return fromCompose;

  const url = raw?.trim() || DEFAULT_URL;
  if (isBuildDatabaseUrl(url) || !existsSync("/.dockerenv")) {
    return url;
  }

  return url.replace("@localhost:", "@db:").replace("@127.0.0.1:", "@db:");
}
