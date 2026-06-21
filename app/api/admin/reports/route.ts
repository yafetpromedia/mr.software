import { NextResponse } from "next/server";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { listReportsForAdmin, ReportsUnavailableError } from "@/lib/reports";
import type { UserReportStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? "OPEN";
  const status =
    statusParam === "ALL" ||
    statusParam === "OPEN" ||
    statusParam === "REVIEWING" ||
    statusParam === "RESOLVED" ||
    statusParam === "DISMISSED"
      ? (statusParam as UserReportStatus | "ALL")
      : "OPEN";

  try {
    const { reports, stats } = await listReportsForAdmin(status);
    return NextResponse.json({ reports, stats });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof ReportsUnavailableError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to load reports";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
