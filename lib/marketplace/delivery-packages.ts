import type { DistributionType, PricingModel, ProductLicenseTier } from "@prisma/client";

export type DeliveryPackageId =
  | "demo"
  | "compiled"
  | "source"
  | "source_commercial"
  | "source_lifetime"
  | "subscription";

export type DeliveryPackage = {
  id: DeliveryPackageId;
  label: string;
  summary: string;
  requiresPro?: boolean;
  distributionType: DistributionType;
  pricingModel?: PricingModel;
  licenseTier?: ProductLicenseTier;
};

export const DELIVERY_PACKAGES: DeliveryPackage[] = [
  {
    id: "demo",
    label: "Demo only",
    summary: "Live preview — no download for buyers",
    distributionType: "DEMO",
  },
  {
    id: "compiled",
    label: "Compiled application",
    summary: "Executable or binary + license key verification",
    distributionType: "COMPILED",
  },
  {
    id: "source",
    label: "Full source code (.zip)",
    summary: "Buyers download your source package after purchase",
    requiresPro: true,
    distributionType: "SOURCE_CODE",
  },
  {
    id: "source_commercial",
    label: "Source + commercial license",
    summary: "Source download with commercial usage rights",
    requiresPro: true,
    distributionType: "SOURCE_CODE",
    licenseTier: "COMMERCIAL",
  },
  {
    id: "source_lifetime",
    label: "Source + lifetime updates",
    summary: "One-time purchase with ongoing update access",
    requiresPro: true,
    distributionType: "SOURCE_CODE",
    pricingModel: "ONE_TIME",
    licenseTier: "COMMERCIAL",
  },
  {
    id: "subscription",
    label: "Subscription access",
    summary: "Recurring billing for hosted or downloadable access",
    distributionType: "HOSTED",
    pricingModel: "SUBSCRIPTION",
  },
];

export function getDeliveryPackage(id: DeliveryPackageId): DeliveryPackage {
  const pkg = DELIVERY_PACKAGES.find((p) => p.id === id);
  if (!pkg) throw new Error(`Unknown delivery package: ${id}`);
  return pkg;
}

export function inferDeliveryPackage(input: {
  distributionType: DistributionType;
  pricingModel: PricingModel;
  licenseTier: ProductLicenseTier;
}): DeliveryPackageId {
  if (input.distributionType === "DEMO") return "demo";
  if (input.distributionType === "COMPILED") return "compiled";
  if (input.distributionType === "HOSTED" && input.pricingModel === "SUBSCRIPTION") {
    return "subscription";
  }
  if (input.distributionType === "SOURCE_CODE") {
    if (input.licenseTier === "COMMERCIAL" && input.pricingModel === "ONE_TIME") {
      return "source_lifetime";
    }
    if (input.licenseTier === "COMMERCIAL") return "source_commercial";
    return "source";
  }
  if (input.distributionType === "HOSTED") return "subscription";
  return "compiled";
}
