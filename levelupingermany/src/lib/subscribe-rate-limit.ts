/**
 * Simple in-memory rate limit (per server instance).
 * For multi-instance production, use Redis / Upstash (@upstash/ratelimit).
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 15;

const buckets = new Map<string, number[]>();

export function checkSubscribeRateLimit(ip: string): boolean {
  const now = Date.now();
  const prev = buckets.get(ip) ?? [];
  const recent = prev.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return false;
  recent.push(now);
  buckets.set(ip, recent);
  return true;
}
