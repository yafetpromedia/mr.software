import { randomBytes } from "node:crypto";

function secret(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

console.log("# Paste into .env.production (generate fresh values per environment)\n");
console.log(`JWT_SECRET=${secret()}`);
console.log(`GITHUB_WEBHOOK_SECRET=${secret()}`);
console.log(`CRON_SECRET=${secret()}`);
console.log(`POSTGRES_PASSWORD=${secret(16)}`);
console.log("\n# VAPID keys: npx web-push generate-vapid-keys");
