"use client";

import type { PricingModel, ProductLicenseTier } from "@prisma/client";
import {
  DELIVERY_PACKAGES,
  getDeliveryPackage,
  inferDeliveryPackage,
  type DeliveryPackageId,
} from "@/lib/marketplace/delivery-packages";
import type { DistributionType } from "@prisma/client";

type Props = {
  deliveryPackageId: DeliveryPackageId;
  canUploadSource: boolean;
  onChange: (input: {
    packageId: DeliveryPackageId;
    distributionType: DistributionType;
    pricingModel?: PricingModel;
    licenseTier?: ProductLicenseTier;
  }) => void;
};

export function DeliveryPackageFields({ deliveryPackageId, canUploadSource, onChange }: Props) {
  return (
    <div className="space-y-4 sm:col-span-2">
      <div>
        <p className="text-xs font-medium text-[var(--muted)]">What buyers receive *</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          Choose exactly what customers get after purchase. Source-code options require Pro or Studio.
        </p>
        <div className="mt-3 grid gap-2">
          {DELIVERY_PACKAGES.map((pkg) => {
            const locked = pkg.requiresPro && !canUploadSource;
            const selected = deliveryPackageId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                disabled={locked}
                onClick={() =>
                  onChange({
                    packageId: pkg.id,
                    distributionType: pkg.distributionType,
                    pricingModel: pkg.pricingModel,
                    licenseTier: pkg.licenseTier,
                  })
                }
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30"
                    : locked
                      ? "cursor-not-allowed border-[var(--border)] bg-[var(--background)] opacity-60"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{pkg.label}</p>
                  {pkg.requiresPro ? (
                    <span className="rounded-md bg-[var(--accent-muted)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--accent)]">
                      Pro
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{pkg.summary}</p>
                {locked ? (
                  <p className="mt-1 text-[0.65rem] font-medium text-[var(--accent)]">
                    Upgrade to Pro to sell source code.
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function defaultDeliveryPackageId(input: {
  distributionType: DistributionType;
  pricingModel: PricingModel;
  licenseTier: ProductLicenseTier;
}): DeliveryPackageId {
  return inferDeliveryPackage(input);
}

export { getDeliveryPackage };
