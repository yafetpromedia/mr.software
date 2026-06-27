import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  siteUploadAbsoluteDir,
  siteUploadPublicUrl,
  type SiteUploadScope,
} from "@/lib/branding/site-uploads";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);
const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);

function extensionFromType(type: string): string {
  switch (type) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

function extensionFromName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  if (allowedExtensions.has(ext)) {
    return ext === ".jpeg" ? ".jpg" : ext;
  }
  return "";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const scopeRaw = form.get("scope");
  const scope = typeof scopeRaw === "string" ? scopeRaw : "";
  if (scope !== "logo" && scope !== "partner" && scope !== "team") {
    return NextResponse.json(
      { error: "scope must be logo, partner, or team" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  const byMime = allowedMimeTypes.has(file.type);
  const byName = extensionFromName(file.name);
  if (!byMime && !byName) {
    return NextResponse.json(
      { error: "Only image files are allowed (png, jpg, webp, svg, gif)." },
      { status: 400 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_UPLOAD_BYTES} bytes)` },
      { status: 400 },
    );
  }

  const ext = extensionFromType(file.type) || byName;
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const uploadScope = scope as SiteUploadScope;
  const absoluteFolder = siteUploadAbsoluteDir(uploadScope);
  await mkdir(absoluteFolder, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const absoluteTarget = path.join(absoluteFolder, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    await writeFile(absoluteTarget, bytes);
  } catch (error) {
    console.error("site-assets upload write failed", error);
    return NextResponse.json(
      {
        error:
          "Could not save the uploaded file on the server. Check upload directory permissions.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: siteUploadPublicUrl(uploadScope, fileName) });
}
