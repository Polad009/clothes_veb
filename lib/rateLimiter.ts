/**
 * In-Memory Sliding Window Rate Limiter for Next.js Edge & Node API Routes
 * Protects against Brute-Force, Scraping, and Automated Flood Attacks
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale records periodically every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number;        // Max allowed requests in interval
  windowMs?: number;     // Window size in milliseconds
}

/**
 * Check if a request identifier (usually Client IP) exceeds rate limits
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetInSec: number } {
  const limit = options.limit || 20;
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const now = Date.now();

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}
