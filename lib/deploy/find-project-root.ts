import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** If the ZIP has a single top-level folder, use it as the project root. */
export async function findProjectRoot(extractRoot: string): Promise<string> {
  const entries = await readdir(extractRoot, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("__MACOSX"));
  const files = entries.filter((e) => e.isFile());

  const markers = ["package.json", "index.html", "index.php", "composer.json", "requirements.txt", "manage.py"];

  for (const name of markers) {
    if (files.some((f) => f.name === name)) return extractRoot;
  }

  if (dirs.length === 1 && files.length === 0) {
    const nested = join(extractRoot, dirs[0]!.name);
    for (const name of markers) {
      if (await exists(join(nested, name))) return nested;
    }
  }

  return extractRoot;
}

export async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function findIndexHtml(root: string): Promise<string | null> {
  async function walk(dir: string): Promise<string | null> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return null;
    }
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      const p = join(dir, e.name);
      if (e.isFile() && e.name.toLowerCase() === "index.html") return p;
      if (e.isDirectory()) {
        const found = await walk(p);
        if (found) return found;
      }
    }
    return null;
  }
  return walk(root);
}

export async function directoryHasIndexHtml(dir: string): Promise<boolean> {
  return Boolean(await findIndexHtml(dir));
}
