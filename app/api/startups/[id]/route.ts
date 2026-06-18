import { NextResponse } from "next/server";
import { deleteGeneratedStartup, getGeneratedStartupById } from "@/lib/startup/db";
import { getSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const record = await getGeneratedStartupById(id);
  if (!record) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  return NextResponse.json({
    startup: {
      id: record.id,
      idea: record.idea,
      payload: record.payload,
      createdAt: record.createdAt.toISOString(),
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to delete creations" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteGeneratedStartup(session.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
