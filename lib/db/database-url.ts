import { existsSync } from "node:fs";

const DEFAULT_URL =
  "postgresql://postgres:postgres@localhost:5432/mr_software?schema=public";

function isBuildDatabaseUrl(url: string): boolean {
  return /\/build(\?|$)/.test(url);
}

/**
 * Postgres in Compose is service `db`. `.env.production` copied from dev often uses localhost.
 * Rewrite only inside running app containers (not during image build with `/build` DB).
 */
export function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string {
  const url = raw?.trim() || DEFAULT_URL;

  if (isBuildDatabaseUrl(url) || !existsSync("/.dockerenv")) {
    return url;
  }

  return url.replace("@localhost:", "@db:").replace("@127.0.0.1:", "@db:");
}
