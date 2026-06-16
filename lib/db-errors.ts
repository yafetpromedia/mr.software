/**
 * Map Prisma / driver errors to actionable messages for API responses.
 */
export function userFacingDbError(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === "string" ? e.code : "";
  const message = typeof e.message === "string" ? e.message : "";

  if (code === "P1001" || message.includes("ECONNREFUSED")) {
    return "Cannot reach the database. Check DATABASE_URL, the PostgreSQL password, and that the server is running.";
  }
  if (code === "P1000" || message.includes("authentication failed")) {
    return "Database authentication failed. Check the user and password in DATABASE_URL.";
  }
  if (
    code === "P2021" ||
    code === "P2022" ||
    code === "P2011" ||
    message.includes("does not exist") ||
    message.includes("Unknown column") ||
    (message.includes("column") && message.includes("not exist")) ||
    message.includes("Null constraint") ||
    message.includes("violates not-null constraint")
  ) {
    return "Database schema is out of sync. From the project folder run: npx prisma db push";
  }

  return null;
}
