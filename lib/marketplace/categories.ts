import { SoftwareCategory } from "@prisma/client";

export const SOFTWARE_CATEGORY_LABELS: Record<SoftwareCategory, string> = {
  EDUCATION: "Education",
  HEALTHCARE: "Healthcare",
  BUSINESS: "Business",
  FINANCE: "Finance",
  ECOMMERCE: "E-Commerce",
  GOVERNMENT: "Government",
  AI_TOOLS: "AI Tools",
  DEVELOPER_TOOLS: "Developer Tools",
  TEMPLATES: "Templates",
  APIS: "APIs",
};

export const SOFTWARE_CATEGORIES = Object.keys(
  SOFTWARE_CATEGORY_LABELS,
) as SoftwareCategory[];

export function categoryLabel(category: SoftwareCategory | string): string {
  if (category in SOFTWARE_CATEGORY_LABELS) {
    return SOFTWARE_CATEGORY_LABELS[category as SoftwareCategory];
  }
  return "Developer Tools";
}

export function parseSoftwareCategory(value: unknown): SoftwareCategory | undefined {
  if (typeof value !== "string") return undefined;
  const key = value.trim().toUpperCase().replace(/-/g, "_");
  if (key in SOFTWARE_CATEGORY_LABELS) {
    return key as SoftwareCategory;
  }
  return undefined;
}
