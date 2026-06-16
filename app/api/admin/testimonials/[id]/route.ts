import { NextResponse } from "next/server";
import { TestimonialStatus } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { updateTestimonialStatus } from "@/lib/testimonials";
import { adminTestimonialStatusSchema } from "@/lib/validation/testimonials";

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

  const parsed = adminTestimonialStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid status" },
      { status: 400 },
    );
  }

  try {
    const updated = await updateTestimonialStatus(
      id,
      parsed.data.status as TestimonialStatus,
      session.id,
    );
    if (!updated) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    await logAdminAction({
      adminId: session.id,
      action: "testimonial.review",
      targetType: "testimonial",
      targetId: id,
      detail: { status: parsed.data.status },
    });

    return NextResponse.json({ testimonial: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 },
    );
  }
}
