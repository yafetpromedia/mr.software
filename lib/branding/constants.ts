export const DEFAULT_LOGO_URL = "/brand/logo-mark.png";

/** Display name shown in header, auth, and emails */
export const BRAND_NAME = "MrSoftware ET";

/** Public site domain (no protocol) */
export const BRAND_DOMAIN = "mrsoftware-et.com";

/** Full public site URL */
export const BRAND_URL = `https://${BRAND_DOMAIN}`;

/** AI product line label */
export const BRAND_AI_NAME = `${BRAND_NAME} AI`;

/** Hosted deploy / cloud label */
export const BRAND_CLOUD_NAME = `${BRAND_NAME} Cloud`;

/** Public storefront URL label, e.g. mrsoftware-et.com/@handle */
export function storefrontPublicLabel(handle: string): string {
  return `${BRAND_DOMAIN}/@${handle}`;
}
