import { createHash } from "node:crypto";

export function computeProductFingerprint(input: {
  developerId: string;
  name: string;
  description: string;
  assetUrl: string;
  publishedAt: string;
}): string {
  const payload = [
    input.developerId,
    input.name.trim(),
    input.description.trim(),
    input.assetUrl.trim(),
    input.publishedAt,
  ].join("|");
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

export function formatFingerprintShort(hex: string, chars = 12): string {
  if (hex.length <= chars) return hex;
  return `${hex.slice(0, chars)}…`;
}
