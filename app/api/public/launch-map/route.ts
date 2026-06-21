import { NextResponse } from "next/server";
import { getLaunchMapPayload } from "@/lib/launch-map/launch-map";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getLaunchMapPayload();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
    },
  });
}
