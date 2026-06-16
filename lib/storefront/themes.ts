import type { StorefrontTheme } from "@prisma/client";

export type StorefrontThemeConfig = {
  id: StorefrontTheme;
  label: string;
  description: string;
  page: string;
  header: string;
  bannerBadge: string;
  avatar: string;
  badge: string;
  stat: string;
};

export const STOREFRONT_THEMES: StorefrontThemeConfig[] = [
  {
    id: "CLASSIC",
    label: "Classic",
    description: "Warm brand gradient — default Mr.Software look",
    page: "bg-mesh",
    header: "storefront-header-classic",
    bannerBadge: "border-white/40 bg-white/25 text-white shadow-sm",
    avatar: "border-orange-200 bg-white text-orange-600 shadow-lg",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    stat: "border-stone-200 bg-white/80 text-stone-900",
  },
  {
    id: "MINIMAL",
    label: "Minimal",
    description: "Clean white space, subtle borders",
    page: "bg-[var(--background)]",
    header: "storefront-header-minimal",
    bannerBadge: "border-stone-300 bg-white text-stone-900 shadow-sm",
    avatar: "border-stone-200 bg-white text-stone-900 shadow-md",
    badge: "border-stone-200 bg-white text-stone-900",
    stat: "border-stone-200 bg-white text-stone-900",
  },
  {
    id: "BOLD",
    label: "Bold",
    description: "High-contrast accent hero",
    page: "bg-[var(--background)]",
    header: "storefront-header-bold",
    bannerBadge: "border-white/40 bg-white/25 text-white shadow-sm",
    avatar: "border-orange-200 bg-white text-orange-600 shadow-lg",
    badge: "border-white/30 bg-white/20 text-white",
    stat: "border-white/30 bg-white/15 text-white",
  },
  {
    id: "MIDNIGHT",
    label: "Midnight",
    description: "Dark developer aesthetic",
    page: "bg-zinc-950 text-zinc-100",
    header: "storefront-header-midnight",
    bannerBadge: "border-violet-400/35 bg-violet-500/25 text-violet-50 shadow-sm",
    avatar: "border-zinc-600 bg-zinc-800 text-violet-300 shadow-md",
    badge: "border-violet-500/40 bg-violet-500/15 text-violet-200",
    stat: "border-zinc-700 bg-zinc-800/80 text-zinc-200",
  },
];

export function getStorefrontTheme(theme: StorefrontTheme): StorefrontThemeConfig {
  return STOREFRONT_THEMES.find((t) => t.id === theme) ?? STOREFRONT_THEMES[0];
}

export function parseStorefrontTheme(value: unknown): StorefrontTheme | undefined {
  if (typeof value !== "string") return undefined;
  const key = value.trim().toUpperCase();
  if (STOREFRONT_THEMES.some((t) => t.id === key)) {
    return key as StorefrontTheme;
  }
  return undefined;
}

export function storefrontHasDarkBanner(theme: StorefrontTheme): boolean {
  return theme === "BOLD" || theme === "CLASSIC" || theme === "MIDNIGHT";
}

export function storefrontBannerUsesLightText(theme: StorefrontTheme): boolean {
  return storefrontHasDarkBanner(theme);
}
