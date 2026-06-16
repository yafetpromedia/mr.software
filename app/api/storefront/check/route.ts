import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isHandleAvailable } from "@/lib/storefront/storefront";
import { validateHandle } from "@/lib/storefront/handles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle") ?? "";
  const formatError = validateHandle(handle);
  if (formatError) {
    return NextResponse.json({ available: false, error: formatError });
  }

  const session = await getSession();
  const available = await isHandleAvailable(handle, session?.id);
  return NextResponse.json({ available });
}
