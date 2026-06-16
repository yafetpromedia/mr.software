import Link from "next/link";
import { Plan, SubscriptionStatus } from "@prisma/client";
import { DeployUploadForm } from "@/components/app/deploy-upload-form";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { countQuotaDeployments, getUserPlan } from "@/lib/subscription/limits";

export const metadata = {
  title: "Deploy",
};

export default async function DeployPage() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  assertDeveloperPortalUser(session);

  const [plan, used, sub] = await Promise.all([
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
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Deploy static site</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Drag a ZIP or choose a file. We extract, validate <code className="text-[var(--foreground)]">index.html</code>,
        and host your build.
      </p>
      {freeBlocked ? (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium text-[var(--foreground)]">Free plan limit reached</p>
          <p className="mt-1 text-[var(--muted)]">
            You already have an active or processing deployment. Upgrade to Pro to add more, or wait until a slot
            opens.
          </p>
          <Link href="/payouts" className="mt-3 inline-block font-medium text-[var(--accent)] underline-offset-4 hover:underline">
            Payouts &amp; upgrade options
          </Link>
        </div>
      ) : null}
      <div className="mt-8">
        <div
          className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 ${freeBlocked ? "pointer-events-none opacity-50" : ""}`}
        >
          <DeployUploadForm />
        </div>
      </div>
    </div>
  );
}
