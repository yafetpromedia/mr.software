import { NextResponse } from "next/server";
import type { ProductLicenseTier } from "@prisma/client";
import { verifyLicenseKey } from "@/lib/trust/license-key";
import { licenseTierLabel } from "@/lib/trust/license-types";
import { verifyLicenseSchema } from "@/lib/validation/trust";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = verifyLicenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid license key" }, { status: 400 });
  }

  const result = await verifyLicenseKey(parsed.data.licenseKey, {
    domain: parsed.data.domain,
  });

  if (!result.valid) {
    return NextResponse.json({
      valid: false,
      reason: result.reason ?? "Invalid",
      product: result.product,
      status: result.status,
    });
  }

  return NextResponse.json({
    valid: true,
    product: result.product,
    tier: result.tier ? licenseTierLabel(result.tier as ProductLicenseTier) : undefined,
    owner: result.owner,
    expires: result.expires,
    status: result.status,
  });
}
