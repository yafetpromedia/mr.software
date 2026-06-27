import path from "node:path";

export type SiteUploadScope = "logo" | "partner" | "team";

export function siteUploadRoot(): string {
  const configured = process.env.SITE_UPLOAD_ROOT?.trim();
  if (configured) return configured;
  return path.join(process.cwd(), "public/brand/uploads");
}

export function siteUploadFolder(scope: SiteUploadScope): string {
  if (scope === "logo") return "logo";
  if (scope === "partner") return "partners";
  return "team";
}

export function siteUploadAbsoluteDir(scope: SiteUploadScope): string {
  return path.join(siteUploadRoot(), siteUploadFolder(scope));
}

export function siteUploadPublicUrl(scope: SiteUploadScope, fileName: string): string {
  return `/brand/uploads/${siteUploadFolder(scope)}/${fileName}`;
}

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

export function mimeTypeForUpload(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}
