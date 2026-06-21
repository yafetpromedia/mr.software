import { randomBytes } from "node:crypto";
import {
  PurchaseStatus,
  SoftwareLicenseKeyStatus,
  type LicenseKind,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeLicensedDomain } from "@/lib/trust/distribution-types";

const KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(length = 4): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => KEY_CHARS[b % KEY_CHARS.length]).join("");
}

export function generateLicenseKey(): string {
  return `MRS-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
}

async function uniqueLicenseKey(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const key = generateLicenseKey();
    const existing = await prisma.softwareLicenseKey.findUnique({
      where: { licenseKey: key },
      select: { id: true },
    });
    if (!existing) return key;
  }
  throw new Error("Could not generate unique license key");
}

export async function ensureLicenseKeyForPurchase(purchaseId: string): Promise<{
  licenseKey: string;
  id: string;
}> {
  const existing = await prisma.softwareLicenseKey.findUnique({
    where: { purchaseId },
    select: { id: true, licenseKey: true, status: true },
  });
  if (existing) {
    return { id: existing.id, licenseKey: existing.licenseKey };
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { software: { select: { name: true } } },
  });
  if (!purchase) {
    throw new Error("Purchase not found");
  }
  if (purchase.status !== PurchaseStatus.ACTIVE) {
    throw new Error("Purchase is not active");
  }

  const licenseKey = await uniqueLicenseKey();
  const row = await prisma.softwareLicenseKey.create({
    data: {
      purchaseId: purchase.id,
      softwareId: purchase.softwareId,
      userId: purchase.userId,
      licenseKey,
      expiresAt: purchase.validUntil,
      status:
        purchase.validUntil && purchase.validUntil < new Date()
          ? SoftwareLicenseKeyStatus.EXPIRED
          : SoftwareLicenseKeyStatus.ACTIVE,
    },
  });

  return { id: row.id, licenseKey: row.licenseKey };
}

export type VerifyLicenseResult = {
  valid: boolean;
  product?: string;
  tier?: string;
  owner?: string;
  expires?: string | null;
  status?: SoftwareLicenseKeyStatus;
  reason?: string;
};

export async function verifyLicenseKey(
  licenseKey: string,
  options?: { domain?: string },
): Promise<VerifyLicenseResult> {
  const normalized = licenseKey.trim().toUpperCase();
  const row = await prisma.softwareLicenseKey.findUnique({
    where: { licenseKey: normalized },
    include: {
      software: {
        select: {
          name: true,
          licenseTier: true,
          distributionType: true,
          ownershipRecord: { select: { recordNumber: true } },
        },
      },
      user: { select: { name: true } },
      purchase: { select: { status: true, validUntil: true } },
    },
  });

  if (!row) {
    return { valid: false, reason: "License key not found" };
  }

  if (row.licensedDomain) {
    if (!options?.domain?.trim()) {
      return { valid: false, product: row.software.name, reason: "Domain required" };
    }
    const expected = normalizeLicensedDomain(row.licensedDomain);
    const actual = normalizeLicensedDomain(options.domain);
    if (expected !== actual) {
      return { valid: false, product: row.software.name, reason: "Domain mismatch" };
    }
  }

  if (row.status === SoftwareLicenseKeyStatus.REVOKED) {
    return { valid: false, product: row.software.name, status: row.status, reason: "Revoked" };
  }

  const expiredByDate =
    row.expiresAt && row.expiresAt < new Date()
      ? true
      : row.purchase.validUntil && row.purchase.validUntil < new Date();

  if (row.status === SoftwareLicenseKeyStatus.EXPIRED || expiredByDate) {
    return {
      valid: false,
      product: row.software.name,
      status: SoftwareLicenseKeyStatus.EXPIRED,
      reason: "Expired",
    };
  }

  if (row.purchase.status !== PurchaseStatus.ACTIVE) {
    return { valid: false, product: row.software.name, reason: "Purchase inactive" };
  }

  return {
    valid: true,
    product: row.software.name,
    tier: row.software.licenseTier,
    owner: row.user.name,
    expires: row.expiresAt?.toISOString().slice(0, 10) ?? null,
    status: row.status,
  };
}

export function syncLicenseKeyExpiry(
  licenseKind: LicenseKind,
  validUntil: Date | null,
): Date | null {
  if (licenseKind === "SUBSCRIPTION" && validUntil) return validUntil;
  return null;
}
