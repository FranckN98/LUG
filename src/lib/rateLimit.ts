/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Suitable for single-instance deployments (Vercel free/hobby/single region).
 * For multi-region or horizontally-scaled production, replace with a
 * Redis/Upstash-backed implementation.
 *
 * Note: Vercel may run multiple lambda instances; the limit is therefore
 * "best-effort" — it dramatically slows abuse but won't be precise across
 * instances. That is still much better than no limit.
 */

type Bucket = { hits: number[]; blockedUntil?: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Logical group, e.g. 'admin-login' or 'members-apply'. */
  key: string;
  /** Identifier within the group, typically client IP. */
  id: string;
  /** Time window in milliseconds. */
  windowMs: number;
  /** Maximum number of allowed requests within the window. */
  max: number;
  /** Optional cool-off period after exceeding the limit (default = windowMs). */
  blockMs?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const { key, id, windowMs, max } = opts;
  const blockMs = opts.blockMs ?? windowMs;
  const now = Date.now();
  const bucketKey = `${key}::${id}`;
  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(bucketKey, bucket);
  }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  // Drop hits outside the window.
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= max) {
    bucket.blockedUntil = now + blockMs;
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil(blockMs / 1000) };
  }

  bucket.hits.push(now);
  return { allowed: true, remaining: max - bucket.hits.length, retryAfterSeconds: 0 };
}

/** Best-effort client IP extraction from common Vercel/Cloudflare headers. */
export function getClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return (
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    h.get('x-vercel-forwarded-for') ||
    'unknown'
  );
}
