import { Prisma } from "@prisma/client";

/** Turn server/API failures into user-facing messages (never expose raw stack traces in prod). */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return "Server database schema is out of date. Run prisma db push on the host, then retry.";
    }
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (/does not exist|Unknown arg|Invalid `prisma\./i.test(msg)) {
      return "Server database schema is out of date. Run prisma db push on the host, then retry.";
    }
    if (process.env.NODE_ENV !== "production") return msg;
  }

  return fallback;
}
