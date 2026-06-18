import { Suspense } from "react";
import { Plan, SubscriptionStatus } from "@prisma/client";
import { DeploymentCenter } from "@/components/deploy/deployment-center";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { countQuotaDeployments, getUserPlan } from "@/lib/subscription/limits";

export const metadata = {
  title: "Deployment Center",
};

function DeployFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="h-40 animate-pulse rounded-2xl bg-[var(--border-subtle)]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--border-subtle)]" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-[var(--border-subtle)]" />
      </div>
    </div>
  );
}

async function DeployContent() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  assertDeveloperPortalUser(session);

  const [plan, used, sub, recentDeployments, softwareListings] = await Promise.all([
    getUserPlan(session.id),
    countQuotaDeployments(session.id),
    prisma.subscription.findUnique({
      where: { userId: session.id },
      select: { plan: true, status: true },
    }),
    prisma.deployment.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        status: true,
        url: true,
        createdAt: true,
        errorMessage: true,
      },
    }),
    prisma.software.findMany({
      where: { developerId: session.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  const proActive = sub?.status === SubscriptionStatus.ACTIVE && sub.plan === Plan.PRO;
  const freeBlocked = plan === Plan.FREE && !proActive && used >= 1;
  const planLabel = proActive || plan === Plan.PRO ? "Pro" : "Starter";
  const maxSlots = proActive || plan === Plan.PRO ? null : 1;

  return (
    <DeploymentCenter
      freeBlocked={freeBlocked}
      planLabel={planLabel}
      usedSlots={used}
      maxSlots={maxSlots}
      recentDeployments={recentDeployments}
      softwareListings={softwareListings}
    />
  );
}

export default function DeployPage() {
  return (
    <Suspense fallback={<DeployFallback />}>
      <DeployContent />
    </Suspense>
  );
}
