import { NextResponse } from "next/server";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import {
  DeveloperAccessUnavailableError,
  listDeveloperAccessForAdmin,
} from "@/lib/developer-access/developer-access";
import type { DeveloperAccessRequestStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? "PENDING";
  const status =
    statusParam === "ALL" ||
    statusParam === "PENDING" ||
    statusParam === "APPROVED" ||
    statusParam === "REJECTED"
      ? (statusParam as DeveloperAccessRequestStatus | "ALL")
      : "PENDING";

  try {
    const data = await listDeveloperAccessForAdmin(status);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof DeveloperAccessUnavailableError
        ? error.message
        : "Failed to load developer requests";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
