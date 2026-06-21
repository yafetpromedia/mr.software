import { NextResponse } from "next/server";
import { UserReportReason, UserReportTargetType } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { createUserReport, ReportValidationError, ReportsUnavailableError } from "@/lib/reports";
import { createUserReportSchema } from "@/lib/validation/reports";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to submit a report" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createUserReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const report = await createUserReport({
      reporterId: session.id,
      targetType: parsed.data.targetType as UserReportTargetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason as UserReportReason,
      details: parsed.data.details,
      resolveTarget: parsed.data.resolveTarget ?? false,
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof ReportValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ReportsUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
