import { prisma } from "@/lib/prisma";

async function nextRecordNumber(publishedAt: Date): Promise<string> {
  const year = publishedAt.getFullYear();
  const prefix = `MS-OWN-${year}-`;
  const count = await prisma.ownershipRecord.count({
    where: {
      recordNumber: { startsWith: prefix },
    },
  });
  const seq = String(count + 1).padStart(5, "0");
  return `${prefix}${seq}`;
}

export async function createOwnershipRecord(input: {
  softwareId: string;
  developerId: string;
  developerName: string;
  productName: string;
  publishedAt?: Date;
}): Promise<{ recordNumber: string; id: string }> {
  const publishedAt = input.publishedAt ?? new Date();
  const recordNumber = await nextRecordNumber(publishedAt);

  const row = await prisma.ownershipRecord.create({
    data: {
      recordNumber,
      softwareId: input.softwareId,
      developerId: input.developerId,
      developerName: input.developerName.trim(),
      productName: input.productName.trim(),
      publishedAt,
    },
  });

  return { recordNumber: row.recordNumber, id: row.id };
}

export async function getOwnershipRecordByNumber(recordNumber: string) {
  return prisma.ownershipRecord.findUnique({
    where: { recordNumber: recordNumber.trim().toUpperCase() },
    include: {
      software: {
        select: {
          contentFingerprint: true,
          licenseTier: true,
          openSourceLicense: true,
          createdAt: true,
        },
      },
    },
  });
}
