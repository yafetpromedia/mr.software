import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import AdmZip from "adm-zip";
import { MAX_ZIP_BYTES } from "./constants";
import { safeJoinWithRoot, safeMkdirParent } from "./path-safety";

/** Block obvious malware / script blobs in static deploy bundles. */
const BLOCKED_EXT = /\.(exe|dll|bat|cmd|sh|ps1|msi|scr|com|vbs)$/i;

const MAX_ENTRIES = 2000;
const MAX_SINGLE_UNCOMPRESSED = MAX_ZIP_BYTES;

/**
 * Extract zip entries only under `destRoot`, blocking zip-slip and risky extensions.
 * Replaces `extractAllTo` which can write outside the temp directory.
 */
export async function extractZipSafely(
  zipBuffer: Buffer,
  destRoot: string,
): Promise<void> {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  if (entries.length > MAX_ENTRIES) {
    throw new Error(`Too many files in archive (max ${MAX_ENTRIES})`);
  }

  let totalUncompressed = 0;
  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const { entryName: rawName = "" } = entry as { entryName: string };
    const name = String(rawName);

    const norm = name.replace(/\\/g, "/").replace(/^\uFEFF/, "");
    if (!norm.trim()) continue;

    const base = norm.split("/").pop() ?? "";
    if (base && BLOCKED_EXT.test(base)) {
      throw new Error(
        `Blocked file type in archive (${base}). Remove executables and shell scripts.`,
      );
    }

    let data: Buffer;
    try {
      data = entry.getData();
    } catch {
      throw new Error("Could not read an entry from the archive");
    }

    if (data.length > MAX_SINGLE_UNCOMPRESSED) {
      throw new Error("A single file in the archive is too large");
    }
    totalUncompressed += data.length;
    if (totalUncompressed > MAX_ZIP_BYTES) {
      throw new Error("Uncompressed size exceeds the allowed limit");
    }

    const target = safeJoinWithRoot(destRoot, norm);
    safeMkdirParent(target, destRoot);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, data);
  }
}
