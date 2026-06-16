import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Deployment } from "@prisma/client";

function getS3(): S3Client | null {
  const region = process.env.S3_REGION?.trim();
  const accessKey = process.env.S3_ACCESS_KEY_ID?.trim();
  const secret = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!region || !accessKey || !secret) return null;
  return new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: { accessKeyId: accessKey, secretAccessKey: secret },
  });
}

export function useS3Storage(): boolean {
  return (
    process.env.DEPLOY_STORAGE === "s3" &&
    !!process.env.S3_BUCKET?.trim() &&
    !!getS3()
  );
}

export function localDeployRoot(): string {
  return (
    process.env.LOCAL_DEPLOY_ROOT?.trim() ||
    join(process.cwd(), "data", "deployments")
  );
}

function keyPrefix(deployment: Pick<Deployment, "userId" | "id">): string {
  return `deployments/${deployment.userId}/${deployment.id}`;
}

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkFiles(p)));
    } else {
      out.push(p);
    }
  }
  return out;
}

function guessContentType(rel: string): string {
  const lower = rel.toLowerCase();
  if (lower.endsWith(".html")) return "text/html; charset=utf-8";
  if (lower.endsWith(".css")) return "text/css; charset=utf-8";
  if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (lower.endsWith(".json")) return "application/json; charset=utf-8";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".ico")) return "image/x-icon";
  if (lower.endsWith(".woff2")) return "font/woff2";
  if (lower.endsWith(".woff")) return "font/woff";
  return "application/octet-stream";
}

export async function uploadExtractedSite(input: {
  deployment: Pick<Deployment, "userId" | "id">;
  extractRoot: string;
}): Promise<void> {
  const { deployment, extractRoot } = input;
  const files = await walkFiles(extractRoot);

  if (useS3Storage()) {
    const bucket = process.env.S3_BUCKET!.trim();
    const client = getS3()!;
    const prefix = keyPrefix(deployment);
    for (const abs of files) {
      const rel = relative(extractRoot, abs).replace(/\\/g, "/");
      const key = `${prefix}/${rel}`;
      const body = await readFile(abs);
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: guessContentType(rel),
        }),
      );
    }
    return;
  }

  const dest = join(localDeployRoot(), deployment.userId, deployment.id);
  await mkdir(dest, { recursive: true });
  for (const abs of files) {
    const rel = relative(extractRoot, abs);
    const target = resolve(dest, rel);
    const targetDir = resolve(target, "..");
    await mkdir(targetDir, { recursive: true });
    const buf = await readFile(abs);
    await writeFile(target, buf);
  }
}

export async function readLocalDeployFile(
  deployment: Pick<Deployment, "userId" | "id">,
  relativePath: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const root = resolve(join(localDeployRoot(), deployment.userId, deployment.id));
  const cleaned = relativePath.replace(/^\/+/, "").replace(/\.\./g, "");
  const safe = resolve(root, cleaned);
  if (!safe.startsWith(root)) return null;
  try {
    const buf = await readFile(safe);
    const relFromRoot = relative(root, safe);
    return { buffer: buf, contentType: guessContentType(relFromRoot) };
  } catch {
    return null;
  }
}

export async function readS3DeployFile(
  deployment: Pick<Deployment, "userId" | "id">,
  relativePath: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const client = getS3();
  const bucket = process.env.S3_BUCKET?.trim();
  if (!client || !bucket) return null;
  const key = `${keyPrefix(deployment)}/${relativePath.replace(/^\/+/, "")}`;
  try {
    const out = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = out.Body;
    if (!body) return null;
    const bytes = await body.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      contentType: guessContentType(relativePath),
    };
  } catch {
    return null;
  }
}
