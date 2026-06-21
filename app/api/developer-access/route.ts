import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import {
  DeveloperAccessUnavailableError,
  DeveloperAccessValidationError,
  getDeveloperAccessForUser,
  submitDeveloperAccessRequest,
} from "@/lib/developer-access/developer-access";
import { developerAccessRequestBodySchema } from "@/lib/validation/developer-access";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getDeveloperAccessForUser(session.id, session.role);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    const message =
      error instanceof DeveloperAccessUnavailableError
        ? error.message
        : "Failed to load developer access status";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== Role.USER) {
    return NextResponse.json(
      { error: "Only member accounts need to request developer access." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = developerAccessRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const requestRow = await submitDeveloperAccessRequest(session.id, session.role, {
      pitch: parsed.data.pitch,
      website: parsed.data.website,
    });
    return NextResponse.json({ request: requestRow, canRequest: false });
  } catch (error) {
    if (error instanceof DeveloperAccessValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DeveloperAccessUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
