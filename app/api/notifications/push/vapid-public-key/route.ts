import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "@/lib/notifications/push";

export async function GET() {
  const publicKey = getVapidPublicKey();
  return NextResponse.json({
    configured: isPushConfigured(),
    publicKey,
  });
}
