import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { updateFactorySession } from "@/lib/factory/factory-session";
import { getFactoryProgress } from "@/lib/factory/progress";
import { startupAdvisorAnalysisSchema } from "@/lib/ai/schema";
import { patchFactorySessionSchema } from "@/lib/validation/factory";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  assertDeveloperPortalUser(session);

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = patchFactorySessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let analysis: ReturnType<typeof startupAdvisorAnalysisSchema.parse> | undefined;
  if (body && typeof body === "object" && "analysis" in body) {
    const analysisParsed = startupAdvisorAnalysisSchema.safeParse(
      (body as { analysis: unknown }).analysis,
    );
    if (!analysisParsed.success) {
      return NextResponse.json({ error: "Invalid analysis" }, { status: 400 });
    }
    analysis = analysisParsed.data;
  }

  const { markComplete, ...rest } = parsed.data;
  const updated = await updateFactorySession(session.id, id, {
    ...rest,
    analysis,
    completedAt: markComplete ? new Date() : undefined,
    currentStep: markComplete ? "COMPLETE" : rest.currentStep,
  });

  if (!updated) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const progress = await getFactoryProgress(session.id);
  return NextResponse.json({ session: updated, progress });
}
