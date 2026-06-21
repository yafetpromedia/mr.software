import type { OpenSourceLicense, ProductLicenseTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeProductFingerprint } from "@/lib/trust/fingerprint";
import { createOwnershipRecord } from "@/lib/trust/ownership-record";

export async function applyTrustOnSoftwarePublish(input: {
  softwareId: string;
  developerId: string;
  developerName: string;
  name: string;
  description: string;
  assetUrl: string;
  licenseTier: ProductLicenseTier;
  openSourceLicense?: OpenSourceLicense | null;
}): Promise<{
  contentFingerprint: string;
  ownershipRecordNumber: string;
}> {
  const publishedAt = new Date();
  const fingerprint = computeProductFingerprint({
    developerId: input.developerId,
    name: input.name,
    description: input.description,
    assetUrl: input.assetUrl,
    publishedAt: publishedAt.toISOString(),
  });

  await prisma.software.update({
    where: { id: input.softwareId },
    data: {
      licenseTier: input.licenseTier,
      openSourceLicense: input.openSourceLicense ?? null,
      contentFingerprint: fingerprint,
      contentSignedAt: publishedAt,
    },
  });

  const { recordNumber } = await createOwnershipRecord({
    softwareId: input.softwareId,
    developerId: input.developerId,
    developerName: input.developerName,
    productName: input.name,
    publishedAt,
  });

  return { contentFingerprint: fingerprint, ownershipRecordNumber: recordNumber };
}
