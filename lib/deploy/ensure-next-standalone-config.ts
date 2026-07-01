import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

/** Inject `output: "standalone"` when missing so deploy can run `.next/standalone/server.js`. */
export async function ensureNextStandaloneConfig(projectRoot: string): Promise<boolean> {
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
