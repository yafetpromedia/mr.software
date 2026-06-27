import { prisma } from "@/lib/prisma";
import { DEFAULT_LOGO_URL } from "@/lib/branding/constants";
import { defaultPartners, normalizePartnerHref, type Partner } from "@/lib/landing/partners";

const SINGLETON_ID = 1;

type SiteSettingsPayload = {
  logoUrl: string;
  partners: Partner[];
};

function normalizePartner(input: Partner): Partner | null {
  const name = input.name?.trim();
  if (!name) return null;
  const logo = input.logo?.trim();
  const href = input.href?.trim();
  const label = input.label?.trim();
  return {
    name,
    logo: logo || undefined,
    href: normalizePartnerHref(href),
    label: label || undefined,
  };
}

function normalizePartners(input: unknown): Partner[] {
  if (!Array.isArray(input)) return defaultPartners;
  const normalized = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return normalizePartner(item as Partner);
    })
    .filter((item): item is Partner => Boolean(item));
  return normalized;
}

function parsePartnersJson(partnersJson: string): Partner[] {
  const raw = partnersJson.trim();
  if (!raw) return defaultPartners;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizePartners(parsed);
  } catch {
    return defaultPartners;
  }
}

export async function getPublicSiteSettings(): Promise<SiteSettingsPayload> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { logoUrl: DEFAULT_LOGO_URL, partners: defaultPartners };
  }
  try {
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT "logoUrl", "partnersJson" FROM "SiteSettings" WHERE "id" = $1 LIMIT 1',
      SINGLETON_ID,
    )) as Array<{ logoUrl: string | null; partnersJson: string | null }>;
    const row = rows[0];
    if (!row) {
      return { logoUrl: DEFAULT_LOGO_URL, partners: defaultPartners };
    }
    const logoUrl = row.logoUrl?.trim() || DEFAULT_LOGO_URL;
    return {
      logoUrl,
      partners: parsePartnersJson(row.partnersJson ?? "[]"),
    };
  } catch {
    return { logoUrl: DEFAULT_LOGO_URL, partners: defaultPartners };
  }
}

export async function upsertSiteSettings(input: SiteSettingsPayload): Promise<SiteSettingsPayload> {
  const logoUrl = input.logoUrl.trim() || DEFAULT_LOGO_URL;
  const partners = normalizePartners(input.partners);
  await prisma.$executeRawUnsafe(
    'INSERT INTO "SiteSettings" ("id", "logoUrl", "partnersJson", "updatedAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT ("id") DO UPDATE SET "logoUrl" = EXCLUDED."logoUrl", "partnersJson" = EXCLUDED."partnersJson", "updatedAt" = NOW()',
    SINGLETON_ID,
    logoUrl,
    JSON.stringify(partners),
  );
  return { logoUrl, partners };
}
