import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { readJsonFile } from "@/lib/deploy/find-project-root";

async function exists(path: string): Promise<boolean> {
  try {
    const { access } = await import("node:fs/promises");
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const CONFIG_FILES = ["next.config.ts", "next.config.mjs", "next.config.js"] as const;

function alreadyHasOutput(src: string): boolean {
  return /output\s*:\s*['"](standalone|export)['"]/.test(src);
}

async function nextMajorVersion(projectRoot: string): Promise<number | null> {
  const pkg = await readJsonFile<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(
    join(projectRoot, "package.json"),
  );
  if (!pkg) return null;
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const raw = deps.next?.trim();
  if (!raw) return null;
  const cleaned = raw.replace(/^[^\d]*/, "");
  const major = Number.parseInt(cleaned.split(".")[0] ?? "", 10);
  return Number.isFinite(major) ? major : null;
}

/**
 * Inject `output: "standalone"` when missing so deploy can run `.next/standalone/server.js`.
 * Skipped on Next.js 15.x — standalone + App Router can fail /404 prerender on hosted builds.
 */
export async function ensureNextStandaloneConfig(projectRoot: string): Promise<boolean> {
  const major = await nextMajorVersion(projectRoot);
  if (major !== null && major < 16) {
    return false;
  }

  for (const file of CONFIG_FILES) {
    const path = join(projectRoot, file);
    if (!(await exists(path))) continue;

    const src = await readFile(path, "utf8");
    if (alreadyHasOutput(src)) return false;

    const patched = src.replace(
      /((?:export\s+default\s+|const\s+\w+(?:\s*:\s*[\w.]+)?\s*=\s*|module\.exports\s*=\s*)[\s\S]*?\{)/,
      `$1\n  output: "standalone",`,
    );

    if (patched === src) continue;

    await writeFile(path, patched, "utf8");
    return true;
  }

  return false;
}
