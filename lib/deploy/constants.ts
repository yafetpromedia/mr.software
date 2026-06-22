/** 100 MB — enforced on upload, per-file unzip, and total uncompressed size */
export const MAX_ZIP_BYTES = 100 * 1024 * 1024;
export const MAX_ZIP_MB = MAX_ZIP_BYTES / (1024 * 1024);

/** Max time for npm install + build during deploy */
export const DEPLOY_BUILD_TIMEOUT_MS = 240_000;
