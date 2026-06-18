import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { followStorefront, unfollowStorefront } from "@/lib/storefront/storefront";

type RouteContext = { params: Promise<{ handle: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { handle } = await context.params;
  try {
    const result = await followStorefront(handle, session.id);
    revalidatePath(`/@${handle}`);
    revalidatePath("/app/storefront");
    revalidatePath("/app");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Follow failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { handle } = await context.params;
  try {
    const result = await unfollowStorefront(handle, session.id);
    revalidatePath(`/@${handle}`);
    revalidatePath("/app/storefront");
    revalidatePath("/app");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unfollow failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
