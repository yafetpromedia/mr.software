import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { mimeTypeForUpload, siteUploadRoot } from "@/lib/branding/site-uploads";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, { params }: Props) {
  const segments = (await params).path;
  if (!segments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const root = path.resolve(siteUploadRoot());
  const relative = path.normalize(path.join(...segments));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(root, relative);
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeTypeForUpload(filePath),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
