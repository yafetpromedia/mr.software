/**
 * Partnership / sponsor logos for the marketing home page.
 *
 * 1. Add PNG, SVG, or WebP files under `public/brand/partners/`
 *    (e.g. `public/brand/partners/acme.png`).
 * 2. List each partner below. Use `logo` for image path (from site root, same as in `Image src`).
 * 3. Optional: `href` opens in a new tab, `label` for accessible name override.
 * 4. You can use text-only (omit `logo`) to show a wordmark in a styled block until a file exists.
 *
 * The section is hidden when this array is empty.
 */
export type Partner = {
  name: string;
  /** e.g. `/brand/partners/acme.svg` */
  logo?: string;
  href?: string;
  /** If set, used for image `alt` and link `aria-label` */
  label?: string;
};

/** Ensures bare domains like `example.com` become absolute external URLs. */
export function normalizePartnerHref(href?: string): string | undefined {
  const value = href?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return value;
  return `https://${value}`;
}

export const defaultPartners: Partner[] = [
  /** Swap URL or add more rows — drop new files in `public/brand/partners/`. */
  {
    name: "Partner name",
    label: "Partner name",
    logo: "/brand/partners/partnership-logo-template.svg",
  },
];
