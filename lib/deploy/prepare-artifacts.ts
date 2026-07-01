import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { DeployRuntime } from "@prisma/client";
import type { FrameworkDetection } from "@/lib/deploy/detect-framework";
import { ensureNextStandaloneConfig } from "@/lib/deploy/ensure-next-standalone-config";
import { directoryHasIndexHtml, findIndexHtml } from "@/lib/deploy/find-project-root";
import { runNpmBuild, runPipInstall } from "@/lib/deploy/run-build";

export type PreparedDeploy = {
  serveRoot: string;
  runtime: DeployRuntime;
  framework: string;
  frameworkLabel: string;
  nodeEntry?: string;
  nodeStartMode?: "file" | "next-start";
  pythonModule?: string;
  buildLog?: string;
};

async function exists(path: string): Promise<boolean> {
  try {
    const { access } = await import("node:fs/promises");
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveStaticOutput(projectRoot: string): Promise<string | null> {
  const candidates = [
    "out",
    "dist",
    "build",
    join(".output", "public"),
    "public",
    join("dist", "browser"),
  ];
  for (const rel of candidates) {
    const dir = join(projectRoot, rel);
    if (!(await exists(dir))) continue;
    if (await directoryHasIndexHtml(dir)) return dir;
  }
  if (await directoryHasIndexHtml(projectRoot)) return projectRoot;
  return null;
}

async function prepareNextStandalone(projectRoot: string): Promise<PreparedDeploy | null> {
  const standaloneDir = join(projectRoot, ".next", "standalone");
  const serverJs = join(standaloneDir, "server.js");
  if (!(await exists(serverJs))) return null;

  const staticSrc = join(projectRoot, ".next", "static");
  const staticDest = join(standaloneDir, ".next", "static");
  const publicSrc = join(projectRoot, "public");
  const publicDest = join(standaloneDir, "public");

  if (await exists(staticSrc)) {
    await mkdir(join(standaloneDir, ".next"), { recursive: true });
    await cp(staticSrc, staticDest, { recursive: true });
  }
  if (await exists(publicSrc)) {
    await cp(publicSrc, publicDest, { recursive: true });
  }

  return {
    serveRoot: standaloneDir,
    runtime: "NODE",
    framework: "nextjs",
    frameworkLabel: "Next.js (server)",
    nodeEntry: serverJs,
    nodeStartMode: "file",
  };
}

async function prepareNextProjectStart(
  projectRoot: string,
  buildLog?: string,
): Promise<PreparedDeploy | null> {
  if (!(await exists(join(projectRoot, ".next")))) return null;
  const hasNext =
    (await exists(join(projectRoot, "node_modules", "next"))) ||
    (await exists(join(projectRoot, "node_modules", ".bin", "next")));
  if (!hasNext) return null;

  return {
    serveRoot: projectRoot,
    runtime: "NODE",
    framework: "nextjs",
    frameworkLabel: "Next.js (server)",
    nodeStartMode: "next-start",
    buildLog,
  };
}

export async function prepareDeployArtifacts(
  extractRoot: string,
  detection: FrameworkDetection,
): Promise<PreparedDeploy> {
  let buildLog: string | undefined;

  if (detection.framework === "nextjs" && detection.needsBuild) {
    await ensureNextStandaloneConfig(extractRoot);
  }

  if (detection.needsBuild && detection.buildScript) {
    const built = await runNpmBuild(extractRoot, detection.buildScript);
    buildLog = built.log;
    if (!built.ok) {
      throw new Error(built.log || "Build failed");
    }
  }

  if (detection.framework === "nextjs") {
    const standalone = await prepareNextStandalone(extractRoot);
    if (standalone) {
      return { ...standalone, buildLog };
    }
    const staticOut = await resolveStaticOutput(extractRoot);
    if (staticOut) {
      return {
        serveRoot: staticOut,
        runtime: "STATIC",
        framework: "nextjs",
        frameworkLabel: "Next.js (static export)",
        buildLog,
      };
    }
    const nextStart = await prepareNextProjectStart(extractRoot, buildLog);
    if (nextStart) {
      return nextStart;
    }
    throw new Error(
      "Next.js build did not produce deployable output. Ensure `npm run build` succeeds and add output: 'standalone' in next.config, or use output: 'export' for static sites.",
    );
  }

  if (detection.runtime === "STATIC") {
    const staticOut = await resolveStaticOutput(extractRoot);
    if (staticOut) {
      return {
        serveRoot: staticOut,
        runtime: "STATIC",
        framework: detection.framework,
        frameworkLabel: detection.label,
        buildLog,
      };
    }
    const index = await findIndexHtml(extractRoot);
    if (index) {
      return {
        serveRoot: extractRoot,
        runtime: "STATIC",
        framework: detection.framework,
        frameworkLabel: detection.label,
        buildLog,
      };
    }
    throw new Error("No index.html found after build. Upload dist/ or a static site.");
  }

  if (detection.runtime === "PHP") {
    if (!(await exists(join(extractRoot, "index.php"))) && !(await findIndexHtml(extractRoot))) {
      throw new Error("PHP project must include index.php");
    }
    return {
      serveRoot: extractRoot,
      runtime: "PHP",
      framework: "php",
      frameworkLabel: "PHP",
      buildLog,
    };
  }

  if (detection.runtime === "PYTHON") {
    if (await exists(join(extractRoot, "requirements.txt"))) {
      const pip = await runPipInstall(extractRoot);
      buildLog = [buildLog, pip.log].filter(Boolean).join("\n");
      if (!pip.ok) {
        throw new Error(`pip install failed:\n${pip.log}`);
      }
    }

    const staticOut = await resolveStaticOutput(extractRoot);
    if (staticOut) {
      return {
        serveRoot: staticOut,
        runtime: "STATIC",
        framework: detection.framework,
        frameworkLabel: `${detection.label} (static)`,
        buildLog,
      };
    }

    if (detection.framework === "python-django" && (await exists(join(extractRoot, "manage.py")))) {
      return {
        serveRoot: extractRoot,
        runtime: "PYTHON",
        framework: "python-django",
        frameworkLabel: "Django",
        pythonModule: "manage.py runserver 127.0.0.1:{port}",
        buildLog,
      };
    }

    if ((await exists(join(extractRoot, "app.py"))) || (await exists(join(extractRoot, "main.py")))) {
      const entry = (await exists(join(extractRoot, "app.py"))) ? "app.py" : "main.py";
      return {
        serveRoot: extractRoot,
        runtime: "PYTHON",
        framework: "python-flask",
        frameworkLabel: "Flask / Python",
        pythonModule: entry,
        buildLog,
      };
    }

    throw new Error(
      "Python project needs app.py, manage.py, or a static build folder. Connect databases via DATABASE_URL in .env.",
    );
  }

  if (detection.runtime === "NODE" && detection.framework === "express") {
    const entryCandidates = ["dist/server.js", "dist/index.js", "server.js", "index.js", "dist/main.js"];
    for (const rel of entryCandidates) {
      const p = join(extractRoot, rel);
      if (await exists(p)) {
        return {
          serveRoot: extractRoot,
          runtime: "NODE",
          framework: "express",
          frameworkLabel: detection.label,
          nodeEntry: p,
          buildLog,
        };
      }
    }
    throw new Error("Node API project needs server.js or dist/server.js after build.");
  }

  throw new Error("Could not prepare deploy artifacts for this project.");
}
