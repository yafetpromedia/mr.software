import { createHmac, timingSafeEqual } from "node:crypto";

export function getGithubWebhookSecret(): string | null {
  return process.env.GITHUB_WEBHOOK_SECRET?.trim() || null;
}

export function githubWebhookCallbackUrl(deploymentId: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_PUBLIC_ORIGIN?.trim() ||
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/webhooks/github/${deploymentId}`;
}

export function verifyGithubWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

export async function createGithubRepoWebhook(input: {
  accessToken: string;
  owner: string;
  repo: string;
  callbackUrl: string;
  secret: string;
}): Promise<number> {
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/hooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: ["push"],
        config: {
          url: input.callbackUrl,
          content_type: "json",
          insecure_ssl: "0",
          secret: input.secret,
        },
      }),
    },
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("GitHub create webhook failed", res.status, data);
    throw new Error("webhook_create_failed");
  }
  const id = (data as { id?: unknown }).id;
  if (typeof id !== "number") throw new Error("webhook_create_failed");
  return id;
}

export async function deleteGithubRepoWebhook(input: {
  accessToken: string;
  owner: string;
  repo: string;
  hookId: number;
}): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/hooks/${input.hookId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  if (res.status === 404) return;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("GitHub delete webhook failed", res.status, body);
  }
}
