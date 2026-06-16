import { NextResponse } from "next/server";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { getSession } from "@/lib/auth/session";
import { getOwnStorefront, upsertStorefront } from "@/lib/storefront/storefront";
import { storefrontUpsertBodySchema } from "@/lib/validation/storefront";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userCanDeploy(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const storefront = await getOwnStorefront(session.id);
  return NextResponse.json({ storefront });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userCanDeploy(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = storefrontUpsertBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const storefront = await upsertStorefront(session.id, parsed.data);
    return NextResponse.json({ storefront });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save storefront";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
