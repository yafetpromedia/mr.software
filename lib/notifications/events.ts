import { createNotification } from "@/lib/notifications/service";

export async function notifyDeploymentResult(input: {
  userId: string;
  deploymentId: string;
  name: string;
  success: boolean;
  url?: string | null;
  errorMessage?: string | null;
}) {
  if (input.success) {
    await createNotification({
      userId: input.userId,
      kind: "DEPLOYMENT",
      title: "Deployment live",
      body: `${input.name} is now live on Mr.Software Cloud.`,
      href: input.url ? `/projects/${input.deploymentId}` : `/projects/${input.deploymentId}`,
    });
    return;
  }
  await createNotification({
    userId: input.userId,
    kind: "DEPLOYMENT",
    title: "Deployment failed",
    body: input.errorMessage ?? `${input.name} could not be deployed.`,
    href: `/projects/${input.deploymentId}`,
  });
}

export async function notifyGithubConnected(input: { userId: string; login: string }) {
  await createNotification({
    userId: input.userId,
    kind: "SYSTEM",
    title: "GitHub connected",
    body: `@${input.login} is linked. Pick a repo in Deployment Center to deploy.`,
    href: "/deploy?source=github",
  });
}

export async function notifyNewStorefrontFollower(input: {
  storefrontUserId: string;
  followerName: string;
  handle: string;
}) {
  await createNotification({
    userId: input.storefrontUserId,
    kind: "STOREFRONT",
    title: "New follower",
    body: `${input.followerName} followed your storefront.`,
    href: `/app/storefront`,
  });
}

export async function notifyAiSaved(input: {
  userId: string;
  title: string;
  productLabel: string;
  href: string;
}) {
  await createNotification({
    userId: input.userId,
    kind: "AI",
    title: `${input.productLabel} saved`,
    body: input.title,
    href: input.href,
  });
}
