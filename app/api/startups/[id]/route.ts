import { NextResponse } from "next/server";
import { getGeneratedStartupById } from "@/lib/startup/db";

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
