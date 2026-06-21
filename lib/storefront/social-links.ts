import { z } from "zod";

export const SOCIAL_PLATFORM_IDS = [
  "twitter",
  "github",
  "linkedin",
  "instagram",
  "youtube",
  "tiktok",
  "threads",
  "facebook",
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORM_IDS)[number];

export type StorefrontSocialLinks = Partial<Record<SocialPlatformId, string>>;

export const SOCIAL_PLATFORM_META: Record<
  SocialPlatformId,
  { label: string; placeholder: string; hint: string }
> = {
  twitter: {
    label: "X (Twitter)",
    placeholder: "@username or https://x.com/username",
    hint: "Share updates and build in public",
  },
  github: {
    label: "GitHub",
    placeholder: "username or https://github.com/username",
    hint: "Open-source repos and code",
  },
  linkedin: {
    label: "LinkedIn",
    placeholder: "Profile URL or username",
    hint: "Professional profile",
  },
  instagram: {
    label: "Instagram",
    placeholder: "@username or profile URL",
    hint: "Visual brand and community",
  },
  youtube: {
    label: "YouTube",
    placeholder: "@channel or channel URL",
    hint: "Tutorials and demos",
  },
  tiktok: {
    label: "TikTok",
    placeholder: "@username or profile URL",
    hint: "Short-form content",
  },
  threads: {
    label: "Threads",
    placeholder: "@username or profile URL",
    hint: "Conversation and updates",
  },
  facebook: {
    label: "Facebook",
    placeholder: "Page URL or username",
    hint: "Community page or profile",
  },
};

const emptyLinks = (): StorefrontSocialLinks => ({});

function stripAt(value: string): string {
  return value.replace(/^@+/, "").trim();
}

function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeUsernamePlatform(
  platform: SocialPlatformId,
  input: string,
): string | null {
  const user = stripAt(input);
  if (!user) return null;

  switch (platform) {
    case "twitter":
      return `https://x.com/${user}`;
    case "github":
      return `https://github.com/${user}`;
    case "instagram":
      return `https://instagram.com/${user}`;
    case "youtube":
      return user.startsWith("channel/") || user.startsWith("c/")
        ? `https://youtube.com/${user}`
        : `https://youtube.com/@${user.replace(/^@/, "")}`;
    case "tiktok":
      return `https://tiktok.com/@${user}`;
    case "threads":
      return `https://threads.net/@${user}`;
    case "facebook":
      return `https://facebook.com/${user}`;
    case "linkedin":
      return user.includes("/") ? normalizeUrl(user) : `https://linkedin.com/in/${user}`;
    default:
      return null;
  }
}

export function normalizeSocialLink(
  platform: SocialPlatformId,
  input: string,
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed) || trimmed.includes(".") && trimmed.includes("/")) {
    return normalizeUrl(trimmed);
  }

  return normalizeUsernamePlatform(platform, trimmed);
}

export function parseStorefrontSocialLinks(raw: string | null | undefined): StorefrontSocialLinks {
  if (!raw?.trim()) return emptyLinks();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return emptyLinks();
    const result: StorefrontSocialLinks = {};
    for (const id of SOCIAL_PLATFORM_IDS) {
      const value = (parsed as Record<string, unknown>)[id];
      if (typeof value === "string" && value.trim()) {
        const normalized = normalizeSocialLink(id, value);
        if (normalized) result[id] = normalized;
      }
    }
    return result;
  } catch {
    return emptyLinks();
  }
}

export function serializeStorefrontSocialLinks(links: StorefrontSocialLinks): string {
  const cleaned: StorefrontSocialLinks = {};
  for (const id of SOCIAL_PLATFORM_IDS) {
    const value = links[id];
    if (value?.trim()) {
      const normalized = normalizeSocialLink(id, value);
      if (normalized) cleaned[id] = normalized;
    }
  }
  return JSON.stringify(cleaned);
}

export function sanitizeSocialLinksInput(input: unknown): StorefrontSocialLinks {
  if (!input || typeof input !== "object") return emptyLinks();
  const result: StorefrontSocialLinks = {};
  for (const id of SOCIAL_PLATFORM_IDS) {
    const value = (input as Record<string, unknown>)[id];
    if (typeof value === "string" && value.trim()) {
      const normalized = normalizeSocialLink(id, value);
      if (normalized) result[id] = normalized;
    }
  }
  return result;
}

export const storefrontSocialLinksSchema = z
  .record(z.string(), z.string().trim().max(300))
  .optional()
  .transform((value) => sanitizeSocialLinksInput(value ?? {}));

export function listPublicSocialLinks(links: StorefrontSocialLinks): Array<{
  id: SocialPlatformId;
  label: string;
  href: string;
}> {
  return SOCIAL_PLATFORM_IDS.filter((id) => Boolean(links[id])).map((id) => ({
    id,
    label: SOCIAL_PLATFORM_META[id].label,
    href: links[id]!,
  }));
}
