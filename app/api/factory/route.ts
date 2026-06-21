import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import {
  createFactorySession,
  getActiveFactorySession,
} from "@/lib/factory/factory-session";
import { getFactoryProgress } from "@/lib/factory/progress";
import { createFactorySessionSchema } from "@/lib/validation/factory";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  assertDeveloperPortalUser(session);

  const [activeSession, progress] = await Promise.all([
    getActiveFactorySession(session.id),
    getFactoryProgress(session.id),
  ]);

  return NextResponse.json({ session: activeSession, progress });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  assertDeveloperPortalUser(session);

  const body = await req.json().catch(() => null);
  const parsed = createFactorySessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid idea" }, { status: 400 });
  }

  const factorySession = await createFactorySession(session.id, parsed.data.idea);
  const progress = await getFactoryProgress(session.id);

  return NextResponse.json({ session: factorySession, progress }, { status: 201 });
}
