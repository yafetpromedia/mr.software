import { access } from "node:fs/promises";
import { join } from "node:path";
import type { DeployRuntime } from "@prisma/client";
import { readJsonFile } from "@/lib/deploy/find-project-root";

export type DetectedFramework =
  | "static"
  | "vite"
  | "nextjs"
  | "react-cra"
  | "nuxt"
  | "angular"
  | "express"
  | "php"
  | "python"
  | "python-flask"
  | "python-django";

export type FrameworkDetection = {
  framework: DetectedFramework;
  runtime: DeployRuntime;
  label: string;
  needsBuild: boolean;
  buildScript: string;
};

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function detectFramework(projectRoot: string): Promise<FrameworkDetection> {
  const pkg = await readJsonFile<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string>; scripts?: Record<string, string> }>(
    join(projectRoot, "package.json"),
  );

  if (pkg) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts ?? {};

    if (deps.next || (await exists(join(projectRoot, "next.config.js"))) || (await exists(join(projectRoot, "next.config.mjs"))) || (await exists(join(projectRoot, "next.config.ts")))) {
      return {
        framework: "nextjs",
        runtime: "NODE",
        label: "Next.js",
        needsBuild: Boolean(scripts.build),
        buildScript: "build",
      };
    }
    if (deps.vite || (await exists(join(projectRoot, "vite.config.ts"))) || (await exists(join(projectRoot, "vite.config.js")))) {
      return { framework: "vite", runtime: "STATIC", label: "Vite", needsBuild: Boolean(scripts.build), buildScript: "build" };
    }
    if (deps["react-scripts"]) {
      return { framework: "react-cra", runtime: "STATIC", label: "Create React App", needsBuild: Boolean(scripts.build), buildScript: "build" };
    }
    if (deps.nuxt || (await exists(join(projectRoot, "nuxt.config.ts")))) {
      return { framework: "nuxt", runtime: "STATIC", label: "Nuxt", needsBuild: Boolean(scripts.build), buildScript: "build" };
    }
    if (deps["@angular/core"]) {
      return { framework: "angular", runtime: "STATIC", label: "Angular", needsBuild: Boolean(scripts.build), buildScript: "build" };
    }
    if (deps.express || deps.fastify || deps["@nestjs/core"]) {
      return {
        framework: "express",
        runtime: "NODE",
        label: "Node.js API",
        needsBuild: Boolean(scripts.build),
        buildScript: scripts.build ? "build" : "start",
      };
    }

    if (scripts.build) {
      return { framework: "static", runtime: "STATIC", label: "Node.js (custom)", needsBuild: true, buildScript: "build" };
    }
  }

  if ((await exists(join(projectRoot, "manage.py"))) || (await exists(join(projectRoot, "django")))) {
    return { framework: "python-django", runtime: "PYTHON", label: "Django", needsBuild: false, buildScript: "" };
  }

  const reqTxt = await exists(join(projectRoot, "requirements.txt"));
  if (reqTxt) {
    try {
      const { readFile } = await import("node:fs/promises");
      const content = await readFile(join(projectRoot, "requirements.txt"), "utf8");
      if (/flask/i.test(content)) {
        return { framework: "python-flask", runtime: "PYTHON", label: "Flask", needsBuild: false, buildScript: "" };
      }
    } catch {
      /* ignore */
    }
    return { framework: "python", runtime: "PYTHON", label: "Python", needsBuild: false, buildScript: "" };
  }

  if ((await exists(join(projectRoot, "app.py"))) || (await exists(join(projectRoot, "main.py")))) {
    return { framework: "python-flask", runtime: "PYTHON", label: "Python app", needsBuild: false, buildScript: "" };
  }

  if ((await exists(join(projectRoot, "index.php"))) || (await exists(join(projectRoot, "composer.json")))) {
    return { framework: "php", runtime: "PHP", label: "PHP", needsBuild: false, buildScript: "" };
  }

  if (await exists(join(projectRoot, "index.html"))) {
    return { framework: "static", runtime: "STATIC", label: "Static HTML", needsBuild: false, buildScript: "" };
  }

  return { framework: "static", runtime: "STATIC", label: "Unknown", needsBuild: false, buildScript: "" };
}
