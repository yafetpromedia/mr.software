import { NextResponse } from "next/server";
import { assertCanUploadSoftware } from "@/lib/auth/governance";
import { getSession } from "@/lib/auth/session";
import { saveListingCoverFile } from "@/lib/uploads/listing-cover";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to upload a cover image" }, { status: 401 });
  }

  const upload = assertCanUploadSoftware(session);
  if (!upload.ok) {
    return NextResponse.json({ error: upload.message }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  try {
    const url = await saveListingCoverFile(session.id, file);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
