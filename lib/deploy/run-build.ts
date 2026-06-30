import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { DEPLOY_BUILD_TIMEOUT_MS } from "@/lib/deploy/constants";

/** Writable HOME/cache for npm/pip when the app runs as a system user (e.g. HOME=/nonexistent in Docker). */
async function deployCommandEnv(cwd: string): Promise<NodeJS.ProcessEnv> {
  const home = join(cwd, ".deploy-home");
  const npmCache = join(cwd, ".npm-cache");
  const pipCache = join(cwd, ".pip-cache");
  await mkdir(home, { recursive: true });
  await mkdir(npmCache, { recursive: true });
  await mkdir(pipCache, { recursive: true });
  return {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    npm_config_cache: npmCache,
    PIP_CACHE_DIR: pipCache,
    npm_config_update_notifier: "false",
    NODE_ENV: "production",
    CI: "true",
    npm_config_audit: "false",
    npm_config_fund: "false",
  };
}

async function runCommand(
  cwd: string,
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<{ code: number; log: string }> {
  const env = await deployCommandEnv(cwd);
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === "win32",
      env,
    });

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Build timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    child.stdout.on("data", (d: Buffer) => chunks.push(d.toString()));
    child.stderr.on("data", (d: Buffer) => chunks.push(d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const log = chunks.join("").slice(-12_000);
      resolve({ code: code ?? 1, log });
    });
  });
}

export async function runNpmBuild(
  projectRoot: string,
  buildScript = "build",
): Promise<{ ok: boolean; log: string }> {
  const install = await runCommand(
    projectRoot,
    "npm",
    ["install", "--no-audit", "--no-fund"],
    DEPLOY_BUILD_TIMEOUT_MS,
  );
  if (install.code !== 0) {
    return { ok: false, log: `npm install failed:\n${install.log}` };
  }

  const build = await runCommand(
    projectRoot,
    "npm",
    ["run", buildScript],
    DEPLOY_BUILD_TIMEOUT_MS,
  );
  if (build.code !== 0) {
    return { ok: false, log: `npm run ${buildScript} failed:\n${build.log}` };
  }

  return { ok: true, log: `${install.log}\n${build.log}`.slice(-12_000) };
}

export async function runPipInstall(projectRoot: string): Promise<{ ok: boolean; log: string }> {
  const result = await runCommand(
    projectRoot,
    "pip",
    ["install", "-r", "requirements.txt"],
    DEPLOY_BUILD_TIMEOUT_MS,
  );
  return { ok: result.code === 0, log: result.log };
}
