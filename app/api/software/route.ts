import { PricingModel } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createSoftwareRecord,
  listSoftware,
} from "@/lib/data/software";
import { assertCanUploadSoftware } from "@/lib/auth/governance";
import { getSession } from "@/lib/auth/session";
import { parseSoftwareCategory } from "@/lib/marketplace/categories";
import {
  parseOpenSourceLicense,
  parseProductLicenseTier,
} from "@/lib/trust/license-types";
import { parseDistributionType } from "@/lib/trust/distribution-types";

function parsePricingModel(v: unknown): PricingModel | undefined {
  if (v === "FREE" || v === "ONE_TIME" || v === "SUBSCRIPTION") {
    return v as PricingModel;
  }
  return undefined;
}

export async function GET() {
  try {
    const items = await listSoftware();
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load software" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const upload = assertCanUploadSoftware(session);
    if (!upload.ok) {
      return NextResponse.json({ error: upload.message }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const name = typeof b.name === "string" ? b.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const description =
      typeof b.description === "string" ? b.description : "";
    const price =
      typeof b.price === "string" && b.price.trim()
        ? b.price.trim()
        : "0";
    const assetUrlRaw =
      typeof b.assetUrl === "string" && b.assetUrl.trim()
        ? b.assetUrl.trim()
        : typeof b.downloadUrl === "string" && b.downloadUrl.trim()
          ? b.downloadUrl.trim()
          : "https://example.com/download";
    const pricingModel = parsePricingModel(b.pricingModel) ?? PricingModel.ONE_TIME;
    const priceCents =
      typeof b.priceCents === "number" && Number.isFinite(b.priceCents)
        ? Math.max(0, Math.floor(b.priceCents))
        : pricingModel === PricingModel.FREE
          ? 0
          : 0;
    const currency =
      typeof b.currency === "string" && b.currency.trim()
        ? b.currency.trim().toLowerCase()
        : "usd";
    const stripePriceId =
      typeof b.stripePriceId === "string" && b.stripePriceId.trim()
        ? b.stripePriceId.trim()
        : null;
    const thumbnailUrl =
      typeof b.thumbnailUrl === "string" && b.thumbnailUrl.trim()
        ? b.thumbnailUrl.trim()
        : null;
    const category = parseSoftwareCategory(b.category);
    const playStoreUrl =
      typeof b.playStoreUrl === "string" && b.playStoreUrl.trim()
        ? b.playStoreUrl.trim()
        : null;
    const appStoreUrl =
      typeof b.appStoreUrl === "string" && b.appStoreUrl.trim()
        ? b.appStoreUrl.trim()
        : null;
    const licenseTier = parseProductLicenseTier(b.licenseTier) ?? "PERSONAL";
    const openSourceLicense =
      licenseTier === "OPEN_SOURCE" ? parseOpenSourceLicense(b.openSourceLicense) ?? "MIT" : null;
    const distributionType = parseDistributionType(b.distributionType) ?? "COMPILED";

    const item = await createSoftwareRecord({
      name,
      description,
      price,
      pricingModel,
      priceCents,
      currency,
      assetUrl: assetUrlRaw,
      developerId: session.id,
      thumbnailUrl,
      stripePriceId,
      category,
      playStoreUrl,
      appStoreUrl,
      licenseTier,
      openSourceLicense,
      distributionType,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create software" },
      { status: 500 },
    );
  }
}
