import { dirname, join, resolve, sep } from "node:path";

const HAS_DOTDOT = /(^|[\\/])\.\.([\\/]|$)/;

/**
 * `entryName` from ZIP / user input must be relative and must not use `..`.
 */
export function assertSafeRelativeEntryName(name: string): void {
  const n = name.replace(/\\/g, "/").replace(/^\uFEFF/, "");
  if (!n || n.length > 500) {
    throw new Error("Invalid path in archive");
  }
  if (n.startsWith("/") || /^[a-zA-Z]:/.test(n) || n.startsWith("\\\\")) {
    throw new Error("Absolute paths in archives are not allowed");
  }
  if (HAS_DOTDOT.test(n) || n.split("/").some((p) => p === "..")) {
    throw new Error("Path segments must not use ..");
  }
}

/**
 * After combining with a root, assert the resolved file stays under `root` (zip slip).
 */
export function assertPathInsideRoot(root: string, candidate: string): void {
  const r = resolve(root) + sep;
  const c = resolve(candidate);
  if (c === resolve(root) || c.startsWith(r)) return;
  throw new Error("Blocked path in archive (zip slip)");
}

export function safeJoinWithRoot(root: string, rel: string): string {
  assertSafeRelativeEntryName(rel);
  const full = join(root, rel);
  assertPathInsideRoot(root, full);
  return full;
}

export function safeMkdirParent(filePath: string, extractRoot: string) {
  const parent = dirname(filePath);
  assertPathInsideRoot(extractRoot, parent);
}
