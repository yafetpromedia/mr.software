import type { Software, User } from "@prisma/client";
import { PricingModel, PurchaseStatus, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function userHasDownloadEntitlement(input: {
  user: Pick<User, "id" | "status"> | null;
  software: Software & { developerId: string };
}): Promise<boolean> {
  const { user, software } = input;

  if (user?.status === UserStatus.BANNED) {
    return false;
  }

  if (user && user.id === software.developerId) {
    return true;
  }

  if (software.pricingModel === PricingModel.FREE) {
    return !!user;
  }

  if (!user) {
    return false;
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_softwareId: { userId: user.id, softwareId: software.id },
    },
  });

  if (!purchase || purchase.status !== PurchaseStatus.ACTIVE) {
    return false;
  }

  if (purchase.validUntil === null) {
    return true;
  }

  return purchase.validUntil > new Date();
}
