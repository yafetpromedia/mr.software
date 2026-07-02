import { Suspense } from "react";
import { SubscriptionStatus } from "@prisma/client";
import { StartupFactoryWizard } from "@/components/factory/startup-factory-wizard";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { getActiveFactorySession } from "@/lib/factory/factory-session";
import { getFactoryProgress } from "@/lib/factory/progress";
import { prisma } from "@/lib/prisma";
import { countQuotaDeployments, getUserPlan, isPaidWorkspacePlan } from "@/lib/subscription/limits";
import { getPlanCapabilities } from "@/lib/subscription/capabilities";

export const metadata = {
  title: "Startup Factory",
};

function FactoryFallback() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-[var(--border-subtle)]" />
      <div className="h-96 animate-pulse rounded-2xl bg-[var(--border-subtle)]" />
    </div>
  );
}

async function FactoryContent() {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);

  const [factorySession, progress, storefront, plan, used, sub] = await Promise.all([
    getActiveFactorySession(session.id),
    getFactoryProgress(session.id),
    prisma.developerStorefront.findUnique({
      where: { userId: session.id },
      select: { handle: true },
    }),
    getUserPlan(session.id),
    countQuotaDeployments(session.id),
    prisma.subscription.findUnique({
      where: { userId: session.id },
      select: { plan: true, status: true },
    }),
  ]);

  const paidActive =
    isPaidWorkspacePlan(plan) && sub?.status === SubscriptionStatus.ACTIVE;
  const caps = getPlanCapabilities(plan);
  const maxSlots =
    caps.maxDeployments === "unlimited" ? null : caps.maxDeployments;
  const freeBlocked = !paidActive && maxSlots !== null && used >= maxSlots;

  return (
    <StartupFactoryWizard
      initialSession={factorySession}
      initialProgress={progress}
      hasStorefront={Boolean(storefront?.handle)}
      existingHandle={storefront?.handle ?? null}
      freeBlocked={freeBlocked}
    />
  );
}

export default function FactoryPage() {
  return (
    <Suspense fallback={<FactoryFallback />}>
      <FactoryContent />
    </Suspense>
  );
}
