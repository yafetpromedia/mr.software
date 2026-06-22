import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { LISTING_COVER_MAX_BYTES } from "@/lib/uploads/listing-cover-constants";

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export function extensionFromImageType(type: string): string {
  switch (type) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

export function extensionFromImageName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return "";
  return ext === ".jpeg" ? ".jpg" : ext;
}

export function validateListingCoverFile(file: File): { ok: true } | { ok: false; error: string } {
  const byMime = ALLOWED_MIME.has(file.type);
  const byName = extensionFromImageName(file.name);
  if (!byMime && !byName) {
    return {
      ok: false,
      error: "Only image files are allowed (PNG, JPG, WebP, or GIF).",
    };
  }
  if (file.size > LISTING_COVER_MAX_BYTES) {
    return {
      ok: false,
      error: `Image too large (max ${Math.round(LISTING_COVER_MAX_BYTES / (1024 * 1024))} MB).`,
    };
  }
  return { ok: true };
}

/** Saves under `public/uploads/listings/{userId}/` and returns a site-relative URL. */
export async function saveListingCoverFile(userId: string, file: File): Promise<string> {
  const check = validateListingCoverFile(file);
  if (!check.ok) throw new Error(check.error);

  const ext = extensionFromImageType(file.type) || extensionFromImageName(file.name);
  if (!ext) throw new Error("Unsupported image type");

  const folder = path.join(process.cwd(), "public", "uploads", "listings", userId);
  await mkdir(folder, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const absoluteTarget = path.join(folder, fileName);
  await writeFile(absoluteTarget, Buffer.from(await file.arrayBuffer()));

  return `/uploads/listings/${userId}/${fileName}`;
}
