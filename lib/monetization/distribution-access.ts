import type { DistributionType } from "@prisma/client";

export function allowsFileDownload(type: DistributionType): boolean {
  return type === "SOURCE_CODE" || type === "COMPILED";
}

export function requiresLicenseKeyAtRuntime(type: DistributionType): boolean {
  return type === "COMPILED";
}

export function isHostedOnly(type: DistributionType): boolean {
  return type === "HOSTED";
}

export function distributionAccessLabel(type: DistributionType, entitled: boolean): string {
  if (type === "HOSTED") {
    return entitled ? "Open your cloud instance" : "Purchase for a hosted URL";
  }
  if (type === "COMPILED") {
    return entitled ? "Download + license key required at startup" : "Purchase to download";
  }
  return entitled ? "Download source package" : "Purchase to download source";
}
