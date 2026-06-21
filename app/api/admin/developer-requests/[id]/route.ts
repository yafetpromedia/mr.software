import { NextResponse } from "next/server";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import {
  DeveloperAccessUnavailableError,
  DeveloperAccessValidationError,
  reviewDeveloperAccessRequest,
} from "@/lib/developer-access/developer-access";
import { adminDeveloperAccessPatchSchema } from "@/lib/validation/developer-access";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminDeveloperAccessPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const updated = await reviewDeveloperAccessRequest({
      requestId: id,
      adminId: session.id,
      action: parsed.data.action,
      adminNote: parsed.data.adminNote,
    });
    return NextResponse.json({ request: updated });
  } catch (error) {
    if (error instanceof DeveloperAccessValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DeveloperAccessUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to review request" }, { status: 500 });
  }
}
