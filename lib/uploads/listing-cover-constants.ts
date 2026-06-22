/** Client-safe limits for listing cover uploads (no Node imports). */
export const LISTING_COVER_MAX_BYTES = 5 * 1024 * 1024;
export const LISTING_COVER_MAX_MB = LISTING_COVER_MAX_BYTES / (1024 * 1024);
