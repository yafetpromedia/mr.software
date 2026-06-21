import type { DistributionType } from "@prisma/client";

export const DISTRIBUTION_TYPES: DistributionType[] = ["SOURCE_CODE", "COMPILED", "HOSTED"];

export const DISTRIBUTION_TYPE_META: Record<
  DistributionType,
  { label: string; summary: string; hint: string; protection: string }
> = {
  SOURCE_CODE: {
    label: "Source download",
    summary: "Buyer downloads source code",
    hint: "Templates, libraries, and open tooling. Ownership stays with you — no piracy protection.",
    protection: "None — buyer receives full source",
  },
  COMPILED: {
    label: "Compiled download",
    summary: "Executable or package + license key",
    hint: "Desktop apps and installers. Buyers verify via POST /api/licenses/verify at startup.",
    protection: "License key verification",
  },
  HOSTED: {
    label: "Cloud hosted only",
    summary: "Runs on Mr.Software — no code download",
    hint: "SaaS, school systems, CRM. Each customer gets a URL (e.g. school1.mr.software). Best protection.",
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
