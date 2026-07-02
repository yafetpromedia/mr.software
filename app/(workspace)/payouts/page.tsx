import Link from "next/link";
import { Suspense } from "react";
import { Plan, PurchaseStatus, SubscriptionStatus } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { countQuotaDeployments, getUserPlan, isPaidWorkspacePlan } from "@/lib/subscription/limits";
import { getPlanCapabilities } from "@/lib/subscription/capabilities";
import { WORKSPACE_PLANS, workspacePlanIdFromDb } from "@/lib/subscription/plans";
import { formatMoneyAmount } from "@/lib/portal/format-amount";
import { isStripeConfigured } from "@/lib/monetization/stripe-server";
import { isChapaConfigured, isTelebirrEnabled } from "@/lib/payments/chapa";
import { PlanUpgradePanel } from "@/components/app/plan-upgrade-panel";

export const metadata = { title: "Billing & payouts" };

function devUpgradeEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_CHECKOUT === "true"
  );
}

export default async function PayoutsPage() {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);

  const [gross, plan, sub, usedSlots] = await Promise.all([
    prisma.purchase.aggregate({
      where: {
        status: PurchaseStatus.ACTIVE,
        software: { developerId: session.id },
      },
      _sum: { amountCents: true },
    }),
    getUserPlan(session.id),
    prisma.subscription.findUnique({
      where: { userId: session.id },
      select: { plan: true, status: true, expiresAt: true, billingCurrency: true, amountCents: true },
    }),
    countQuotaDeployments(session.id),
  ]);

  const grossCents = gross._sum.amountCents ?? 0;
  const currency = "ETB";
  const paidActive =
    isPaidWorkspacePlan(plan) &&
    sub?.status === SubscriptionStatus.ACTIVE &&
    (!sub.expiresAt || sub.expiresAt > new Date());
  const currentPlanId = paidActive ? workspacePlanIdFromDb(plan) : "free";
  const caps = getPlanCapabilities(plan);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-3xl">
          Billing &amp; payouts
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-[var(--muted)]">
          Upgrade your workspace in USD or ETB, and withdraw seller earnings when Chapa payouts are
          connected.
        </p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-[var(--border)] dark:bg-[var(--surface)]">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
          Workspace plans
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-[var(--muted)]">
          Free: 5 products, no source ZIP. Pro from $9.99/mo or $99/yr. Studio for teams.
        </p>
        <div className="mt-5">
          <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading plans…</p>}>
            <PlanUpgradePanel
              currentPlanId={currentPlanId}
              plans={WORKSPACE_PLANS}
              stripeConfigured={isStripeConfigured()}
              chapaConfigured={isChapaConfigured()}
              telebirrEnabled={isTelebirrEnabled()}
              devUpgradeEnabled={devUpgradeEnabled()}
              expiresAt={sub?.expiresAt?.toISOString() ?? null}
              usedSlots={usedSlots}
              maxSlots={caps.maxPublishedProducts}
            />
          </Suspense>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Available to withdraw
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">—</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Connects after Chapa seller onboarding.</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Gross license revenue
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {formatMoneyAmount(grossCents, currency)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Sum of active sales from your listings (before platform fees).
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Current hosting plan
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            {paidActive ? (currentPlanId === "studio" ? "Studio" : "Pro") : "Free"}
          </p>
          {sub?.billingCurrency && sub.amountCents ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Billed at {formatMoneyAmount(sub.amountCents, sub.billingCurrency.toUpperCase())}/mo
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Withdraw via Chapa</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted)]">
          <li>Complete seller KYC in the Chapa dashboard.</li>
          <li>Map a bank account or mobile money destination for ETB settlement.</li>
          <li>Trigger withdrawals from this screen once the payout API is integrated.</li>
        </ol>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/earnings" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
          Earnings by product
        </Link>
        <span className="text-[var(--muted)]" aria-hidden>
          ·
        </span>
        <Link href="/listings" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
          My listings
        </Link>
        <span className="text-[var(--muted)]" aria-hidden>
          ·
        </span>
        <Link href="/settings" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
          Account settings
        </Link>
      </div>
    </div>
  );
}
