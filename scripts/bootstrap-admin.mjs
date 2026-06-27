import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import pg from "pg";

const email = process.env.ADMIN_EMAIL?.trim() || "admin@mrsoftware.local";
const password = process.env.ADMIN_PASSWORD?.trim() || "password123";
const name = process.env.ADMIN_NAME?.trim() || "Platform Admin";
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const hash = await bcrypt.hash(password, 12);

await pool.query(
  `INSERT INTO "User" (
     id, name, email, password, role, status,
     "canUpload", "canPublish", "canWithdraw", "sessionVersion"
   )
   VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE', true, true, true, 1)
   ON CONFLICT (email) DO UPDATE SET
     name = EXCLUDED.name,
     password = EXCLUDED.password,
     role = 'ADMIN',
     status = 'ACTIVE',
     "sessionVersion" = "User"."sessionVersion" + 1`,
  [randomUUID(), name, email, hash],
);

await pool.end();

console.log(`Admin ready: ${email}`);
if (password === "password123") {
  console.warn("Default password in use — change it after first login.");
}
