import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = process.argv[2] ?? resolve(process.cwd(), ".env.production");
const required = ["JWT_SECRET", "NEXT_PUBLIC_APP_URL", "AUTH_PUBLIC_ORIGIN"];
const recommended = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_WEBHOOK_SECRET",
  "DATABASE_URL",
];
const optional = ["STRIPE_SECRET_KEY", "AI_API_KEY", "DEPLOY_STORAGE", "S3_BUCKET"];

function loadEnv(file) {
  if (!existsSync(file)) return null;
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

const env = loadEnv(envPath);
if (!env) {
  console.error(`FAIL: ${envPath} not found. Copy .env.production.example → .env.production`);
  process.exit(1);
}

let failed = false;
const missing = [];
const weak = [];

for (const key of required) {
  const val = env[key]?.trim();
  if (!val) {
    missing.push(key);
    failed = true;
  } else if (key === "JWT_SECRET" && val.length < 32) {
    weak.push(`${key} should be at least 32 characters`);
    failed = true;
  } else if (key.includes("URL") && val.startsWith("http://") && !val.includes("localhost")) {
    weak.push(`${key} should use https:// in production`);
  }
}

console.log(`Checking ${envPath}\n`);

if (missing.length) {
  console.error("Missing required:");
  for (const k of missing) console.error(`  - ${k}`);
}

if (weak.length) {
  console.error("\nWarnings:");
  for (const w of weak) console.error(`  - ${w}`);
}

const recMissing = recommended.filter((k) => !env[k]?.trim());
if (recMissing.length) {
  console.warn("\nRecommended (GitHub deploy / DB):");
  for (const k of recMissing) console.warn(`  - ${k}`);
}

if (env.DEPLOY_STORAGE === "s3") {
  const s3Keys = ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
  const s3Missing = s3Keys.filter((k) => !env[k]?.trim());
  if (s3Missing.length) {
    console.error("\nS3 enabled but missing:");
    for (const k of s3Missing) console.error(`  - ${k}`);
    failed = true;
  }
} else if (!env.LOCAL_DEPLOY_ROOT?.trim()) {
  console.warn("\nLOCAL_DEPLOY_ROOT unset — deploy files may not persist across restarts.");
}

const url = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
if (url) {
  console.log("\nOAuth / webhook URLs to register:");
  console.log(`  GitHub callback:     ${url}/api/github/callback`);
  console.log(`  Stripe webhook:      ${url}/api/webhooks/stripe`);
  console.log(`  GitHub push hook:    ${url}/api/webhooks/github/{deploymentId}`);
}

if (failed) {
  console.error("\nFAIL: fix required variables before going live.");
  process.exit(1);
}

console.log("\nOK: required production variables look good.");
void optional;
