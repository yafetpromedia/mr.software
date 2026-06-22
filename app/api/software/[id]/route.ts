import { NextResponse } from "next/server";
import {
  deleteSoftwareListing,
  getSoftwareById,
  updateSoftwareListing,
} from "@/lib/data/software";
import { getSession } from "@/lib/auth/session";
import { canPublishSoftware } from "@/lib/auth/rbac";
import { listingUpdateSchema } from "@/lib/validation/listing";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await getSoftwareById(id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load software" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (!canPublishSoftware(session.role)) {
      return NextResponse.json({ error: "Developer access required" }, { status: 403 });
    }

    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = listingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const item = await updateSoftwareListing(id, session.id, {
      ...data,
      currency: data.currency?.toLowerCase(),
    });

    if (!item) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (e) {
    console.error("PATCH /api/software/[id]", e);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (!canPublishSoftware(session.role)) {
      return NextResponse.json({ error: "Developer access required" }, { status: 403 });
    }

    const { id } = await context.params;
    const result = await deleteSoftwareListing(id, session.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/software/[id]", e);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
