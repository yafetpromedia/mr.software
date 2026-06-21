import { Suspense } from "react";
import { Plan, SubscriptionStatus } from "@prisma/client";
import { StartupFactoryWizard } from "@/components/factory/startup-factory-wizard";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { getActiveFactorySession } from "@/lib/factory/factory-session";
import { getFactoryProgress } from "@/lib/factory/progress";
import { prisma } from "@/lib/prisma";
import { countQuotaDeployments, getUserPlan } from "@/lib/subscription/limits";

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

  const proActive = sub?.status === SubscriptionStatus.ACTIVE && sub.plan === Plan.PRO;
  const freeBlocked = plan === Plan.FREE && !proActive && used >= 1;

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
