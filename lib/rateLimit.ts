/**
 * In-Memory Sliding Window Rate Limiter & Daily Quota Guard
 * Protects AI and expensive API endpoints against abuse, DDoS, and surprise cloud billing.
 */

interface RateLimitRecord {
  timestamps: number[]; // for minute window
  dailyCount: number;
  dailyResetTime: number; // timestamp when day resets
}

const ipStore = new Map<string, RateLimitRecord>();

// Cleanup stale IPs every 15 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    ipStore.forEach((record, ip) => {
      if (now > record.dailyResetTime && record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    });
  }, 15 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs?: number; // default: 60,000 (1 minute)
  maxPerWindow?: number; // default: 10 requests / minute
  dailyQuota?: number; // default: 50 requests / day
}

export interface RateLimitResult {
  success: boolean;
  status: 200 | 429;
  limit: number;
  remaining: number;
  dailyRemaining: number;
  resetSeconds: number;
  error?: string;
}

export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs || 60 * 1000;
  const maxPerWindow = options.maxPerWindow || 10;
  const dailyQuota = options.dailyQuota || 50;

  const now = Date.now();
  let record = ipStore.get(ip);

  // Initialize or reset daily quota if day passed
  if (!record || now > record.dailyResetTime) {
    record = {
      timestamps: [],
      dailyCount: 0,
      dailyResetTime: now + 24 * 60 * 60 * 1000,
    };
    ipStore.set(ip, record);
  }

  // 1. Check Daily Quota
  if (record.dailyCount >= dailyQuota) {
    const resetSeconds = Math.ceil((record.dailyResetTime - now) / 1000);
    return {
      success: false,
      status: 429,
      limit: dailyQuota,
      remaining: 0,
      dailyRemaining: 0,
      resetSeconds,
      error: `Günlük süni intellekt kvotanız dolmuşdur (${dailyQuota} sorğu/gün). Zəhmət olmasa sabah yenidən cəhd edin.`,
    };
  }

  // 2. Clean timestamps older than windowMs
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  // 3. Check Minute Window Rate Limit
  if (record.timestamps.length >= maxPerWindow) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      status: 429,
      limit: maxPerWindow,
      remaining: 0,
      dailyRemaining: dailyQuota - record.dailyCount,
      resetSeconds,
      error: `Çox sayda sorğu göndərildi. Zəhmət olmasa ${resetSeconds} saniyə gözləyin.`,
    };
  }

  // 4. Record new request
  record.timestamps.push(now);
  record.dailyCount += 1;

  return {
    success: true,
    status: 200,
    limit: maxPerWindow,
    remaining: maxPerWindow - record.timestamps.length,
    dailyRemaining: dailyQuota - record.dailyCount,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
