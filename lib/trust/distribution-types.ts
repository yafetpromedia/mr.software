import type { DistributionType } from "@prisma/client";
import { BRAND_CLOUD_NAME } from "@/lib/branding/constants";

export const DISTRIBUTION_TYPES: DistributionType[] = [
  "DEMO",
  "COMPILED",
  "SOURCE_CODE",
  "HOSTED",
];

export const DISTRIBUTION_TYPE_META: Record<
  DistributionType,
  { label: string; summary: string; hint: string; protection: string }
> = {
  DEMO: {
    label: "Demo only",
    summary: "Preview in browser — no download",
    hint: "Great for lead generation. Buyers see a live demo or hosted preview without receiving files.",
    protection: "Highest — no files delivered",
  },
  SOURCE_CODE: {
    label: "Source download",
    summary: "Buyer downloads source code (.zip)",
    hint: "Templates, libraries, and full repos. Pro plan required. Include README, LICENSE, and install guide.",
    protection: "None — buyer receives full source",
  },
  COMPILED: {
    label: "Compiled download",
    summary: "Executable or package + license key",
    hint: "Desktop apps and installers. Buyers verify via POST /api/licenses/verify at startup.",
    protection: "License key verification",
  },
  HOSTED: {
    label: "Cloud hosted",
    summary: `Runs on ${BRAND_CLOUD_NAME} — no code download`,
    hint: "SaaS, school systems, CRM. Each customer gets a hosted URL. Best for recurring revenue.",
    protection: "Highest — customer never receives source or backend",
  },
};

export function parseDistributionType(value: unknown): DistributionType | undefined {
  if (typeof value !== "string") return undefined;
  return DISTRIBUTION_TYPES.includes(value as DistributionType)
    ? (value as DistributionType)
    : undefined;
}

export function distributionTypeLabel(type: DistributionType): string {
  return DISTRIBUTION_TYPE_META[type].label;
}

/** Normalize hostname for domain license checks. */
export function normalizeLicensedDomain(domain: string): string {
  let d = domain.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.split("/")[0] ?? d;
  d = d.split(":")[0] ?? d;
  if (d.startsWith("www.")) d = d.slice(4);
  return d;
}
