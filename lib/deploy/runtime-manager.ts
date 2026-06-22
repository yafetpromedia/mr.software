import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import type { Deployment } from "@prisma/client";
import { localDeployRoot } from "@/lib/deploy/storage";

type RuntimeRecord = {
  port: number;
  process: ChildProcess;
  runtime: "NODE" | "PHP" | "PYTHON";
};

declare global {
  // eslint-disable-next-line no-var
  var __mrDeployRuntimes: Map<string, RuntimeRecord> | undefined;
}

function registry(): Map<string, RuntimeRecord> {
  if (!global.__mrDeployRuntimes) {
    global.__mrDeployRuntimes = new Map();
  }
  return global.__mrDeployRuntimes;
}

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        server.close();
        reject(new Error("Could not allocate port"));
        return;
      }
      const port = addr.port;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function loadDotEnv(cwd: string): Promise<Record<string, string>> {
  const env: Record<string, string> = {};
  try {
    const raw = await readFile(join(cwd, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch {
    /* no .env */
  }
  return env;
}

function trackProcess(deploymentId: string, port: number, runtime: RuntimeRecord["runtime"], child: ChildProcess) {
  const reg = registry();
  const existing = reg.get(deploymentId);
  if (existing) {
    try {
      existing.process.kill();
    } catch {
      /* ignore */
    }
  }
  reg.set(deploymentId, { port, process: child, runtime });
  child.on("exit", () => {
    if (reg.get(deploymentId)?.process === child) reg.delete(deploymentId);
  });
}

export async function ensureNodeRuntime(input: {
  deploymentId: string;
  cwd: string;
  entry: string;
}): Promise<number> {
  const existing = registry().get(input.deploymentId);
  if (existing?.runtime === "NODE") return existing.port;

  const port = await getFreePort();
  const dotenv = await loadDotEnv(input.cwd);
  const child = spawn(process.execPath, [input.entry], {
    cwd: input.cwd,
    env: {
      ...process.env,
      ...dotenv,
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
    },
    stdio: "ignore",
  });

  trackProcess(input.deploymentId, port, "NODE", child);
  await new Promise((r) => setTimeout(r, 1500));
  return port;
}

export async function ensurePhpRuntime(input: {
  deploymentId: string;
  cwd: string;
}): Promise<number> {
  const existing = registry().get(input.deploymentId);
  if (existing?.runtime === "PHP") return existing.port;

  const port = await getFreePort();
  const child = spawn("php", ["-S", `127.0.0.1:${port}`, "-t", input.cwd], {
    cwd: input.cwd,
    stdio: "ignore",
  });

  trackProcess(input.deploymentId, port, "PHP", child);
  await new Promise((r) => setTimeout(r, 800));
  return port;
}

export async function ensurePythonRuntime(input: {
  deploymentId: string;
  cwd: string;
  pythonModule?: string;
}): Promise<number> {
  const existing = registry().get(input.deploymentId);
  if (existing?.runtime === "PYTHON") return existing.port;

  const port = await getFreePort();
  const dotenv = await loadDotEnv(input.cwd);

  let child: ChildProcess;
  if (input.pythonModule?.includes("manage.py")) {
    child = spawn("python", ["manage.py", "runserver", `127.0.0.1:${port}`, "--noreload"], {
      cwd: input.cwd,
      env: { ...process.env, ...dotenv },
      stdio: "ignore",
    });
  } else if (input.pythonModule) {
    child = spawn("python", [input.pythonModule], {
      cwd: input.cwd,
      env: { ...process.env, ...dotenv, PORT: String(port), FLASK_RUN_PORT: String(port) },
      stdio: "ignore",
    });
  } else {
    child = spawn("python", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
      cwd: input.cwd,
      stdio: "ignore",
    });
  }

  trackProcess(input.deploymentId, port, "PYTHON", child);
  await new Promise((r) => setTimeout(r, 1500));
  return port;
}

export function getRuntimePort(deploymentId: string): number | null {
  return registry().get(deploymentId)?.port ?? null;
}

export function stopRuntime(deploymentId: string): void {
  const reg = registry();
  const existing = reg.get(deploymentId);
  if (!existing) return;
  try {
    existing.process.kill();
  } catch {
    /* ignore */
  }
  reg.delete(deploymentId);
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveNodeEntry(cwd: string, framework: string | null): Promise<string> {
  if (framework === "nextjs") return "server.js";
  const candidates = ["dist/server.js", "dist/index.js", "server.js", "index.js", "dist/main.js"];
  for (const rel of candidates) {
    if (await pathExists(join(cwd, rel))) return rel;
  }
  return "server.js";
}

async function resolvePythonModule(cwd: string, framework: string | null): Promise<string | undefined> {
  if (framework === "python-django" && (await pathExists(join(cwd, "manage.py")))) {
    return "manage.py";
  }
  if (await pathExists(join(cwd, "app.py"))) return "app.py";
  if (await pathExists(join(cwd, "main.py"))) return "main.py";
  return undefined;
}

export async function ensureRuntimeForDeployment(
  deployment: Pick<Deployment, "id" | "runtime" | "framework" | "userId">,
): Promise<number> {
  const deployDir = join(localDeployRoot(), deployment.userId, deployment.id);

  if (deployment.runtime === "NODE") {
    const entry = await resolveNodeEntry(deployDir, deployment.framework);
    return ensureNodeRuntime({ deploymentId: deployment.id, cwd: deployDir, entry });
  }
  if (deployment.runtime === "PHP") {
    return ensurePhpRuntime({ deploymentId: deployment.id, cwd: deployDir });
  }
  if (deployment.runtime === "PYTHON") {
    const pythonModule = await resolvePythonModule(deployDir, deployment.framework);
    return ensurePythonRuntime({ deploymentId: deployment.id, cwd: deployDir, pythonModule });
  }

  throw new Error("Not a runtime deployment");
}

export async function proxyToRuntime(port: number, path: string, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const target = `http://127.0.0.1:${port}${path}${url.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  return fetch(target, init);
}
