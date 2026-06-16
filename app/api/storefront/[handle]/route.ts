import { NextResponse } from "next/server";
import { getStorefrontByHandle } from "@/lib/storefront/storefront";

type RouteContext = { params: Promise<{ handle: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { handle } = await context.params;
  const storefront = await getStorefrontByHandle(handle);
  if (!storefront) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }
  return NextResponse.json({ storefront });
}
