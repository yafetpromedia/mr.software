import type { ProductKind } from "@prisma/client";

export const PRODUCT_KINDS: ProductKind[] = [
  "SAAS",
  "WEBSITE",
  "MOBILE_APP",
  "DESKTOP_APP",
  "UI_KIT",
  "TEMPLATE",
  "API",
  "AI_MODEL",
  "PLUGIN",
  "EXTENSION",
  "SOURCE_CODE",
];

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  SAAS: "SaaS",
  WEBSITE: "Website",
  MOBILE_APP: "Mobile app",
  DESKTOP_APP: "Desktop app",
  UI_KIT: "UI kit",
  TEMPLATE: "Template",
  API: "API",
  AI_MODEL: "AI model",
  PLUGIN: "Plugin",
  EXTENSION: "Extension",
  SOURCE_CODE: "Source code (ZIP)",
};

export function parseProductKind(value: unknown): ProductKind | undefined {
  if (typeof value !== "string") return undefined;
  return PRODUCT_KINDS.includes(value as ProductKind) ? (value as ProductKind) : undefined;
}

export function productKindLabel(kind: ProductKind): string {
  return PRODUCT_KIND_LABELS[kind];
}
