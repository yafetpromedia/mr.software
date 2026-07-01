import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function loadEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const envPath = resolve(process.cwd(), ".env.production");
if (!existsSync(envPath)) {
  console.error("Missing .env.production");
  process.exit(1);
}

const env = loadEnv(envPath);
const user = env.POSTGRES_USER?.trim() || "postgres";
const password = env.POSTGRES_PASSWORD?.trim();
const db = env.POSTGRES_DB?.trim() || "mr_software";

if (!password) {
  console.error("POSTGRES_PASSWORD is not set in .env.production");
  process.exit(1);
}

const databaseUrl = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@db:5432/${encodeURIComponent(db)}?schema=public`;

const result = spawnSync(
  "docker",
  [
    "compose",
    "-f",
    "docker-compose.prod.yml",
    "--env-file",
    ".env.production",
    "exec",
    "-e",
    `DATABASE_URL=${databaseUrl}`,
    "app",
    "npx",
    "prisma",
    "db",
    "push",
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);

process.exit(result.status ?? 1);
