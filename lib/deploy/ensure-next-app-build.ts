import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { readJsonFile } from "@/lib/deploy/find-project-root";

const ENV_FILES = [".env", ".env.local", ".env.development", ".env.development.local"] as const;

const MINIMAL_NOT_FOUND = `export default function NotFound() {
  return (
    <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Page not found</h1>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>The page you requested does not exist.</p>
      <a href="/" style={{ marginTop: "1.5rem", color: "#2563eb" }}>Back to home</a>
    </div>
  );
}
`;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function parseNextMajorVersion(projectRoot: string): Promise<number | null> {
  return readJsonFile<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(
    join(projectRoot, "package.json"),
  ).then((pkg) => {
    if (!pkg) return null;
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const raw = deps.next?.trim();
    if (!raw) return null;
    const cleaned = raw.replace(/^[^\d]*/, "");
    const major = Number.parseInt(cleaned.split(".")[0] ?? "", 10);
    return Number.isFinite(major) ? major : null;
  });
}

/** Remove NODE_ENV overrides from user env files — breaks `next build` on App Router 15.x. */
export async function sanitizeDeployEnvFiles(projectRoot: string): Promise<number> {
  let changed = 0;
  for (const file of ENV_FILES) {
    const path = join(projectRoot, file);
    if (!(await exists(path))) continue;
    const src = await readFile(path, "utf8");
    const next = src
      .split(/\r?\n/)
      .filter((line) => !/^\s*NODE_ENV\s*=/.test(line))
      .join("\n");
    if (next !== src) {
      await writeFile(path, next.endsWith("\n") || next.length === 0 ? next : `${next}\n`, "utf8");
      changed += 1;
    }
  }
  return changed;
}

/** App Router projects without not-found.tsx can fail /404 prerender on Next 15.x. */
export async function ensureAppNotFoundPage(projectRoot: string): Promise<boolean> {
  const appDir = join(projectRoot, "app");
  if (!(await exists(appDir))) return false;
  if (await exists(join(projectRoot, "pages"))) return false;

  const candidates = [
    join(appDir, "not-found.tsx"),
    join(appDir, "not-found.jsx"),
    join(appDir, "not-found.js"),
  ];
  for (const path of candidates) {
    if (await exists(path)) return false;
  }

  await writeFile(join(appDir, "not-found.tsx"), MINIMAL_NOT_FOUND, "utf8");
  return true;
}

export async function prepareNextAppForDeployBuild(projectRoot: string): Promise<{
  nextMajor: number | null;
  injectedNotFound: boolean;
  sanitizedEnvFiles: number;
}> {
  const [nextMajor, injectedNotFound, sanitizedEnvFiles] = await Promise.all([
    parseNextMajorVersion(projectRoot),
    ensureAppNotFoundPage(projectRoot),
    sanitizeDeployEnvFiles(projectRoot),
  ]);

  return { nextMajor, injectedNotFound, sanitizedEnvFiles };
}
