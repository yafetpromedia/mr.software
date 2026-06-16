type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const DEFAULT_PRUNE = 5 * 60_000;

let lastPrune = Date.now();

function prune(now: number) {
  if (now - lastPrune < DEFAULT_PRUNE) return;
  lastPrune = now;
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

/**
 * In-memory rate limiter (one Node process). For multiple instances or
 * strict protection, use Redis or your edge (Cloudflare, etc.).
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = store.get(key);
  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (bucket.count >= max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { ok: true, remaining: max - bucket.count };
}
