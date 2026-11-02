import crypto from 'crypto';
import { NextRequest } from 'next/server';

const SECRET = process.env.ADMIN_JWT_SECRET || 'horvvalle_super_secure_admin_secret_key_2026_98124';
const ADMIN_USER = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const ADMIN_PASS = (process.env.ADMIN_PASSWORD || '').trim();

// In-memory rate limiting map: ip -> { count, lockedUntil }
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (entry) {
    if (entry.lockedUntil > now) {
      return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
    }
    if (entry.lockedUntil <= now && entry.count >= 5) {
      loginAttempts.delete(ip);
    }
  }
  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
  }
  loginAttempts.set(ip, entry);
}

export function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip);
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Timing-attack resistant admin credential verification.
 */
export function verifyAdminCredentials(user: string, pass: string): boolean {
  const cleanUser = (user || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();

  // Allowed admin usernames
  const validUsers = [ADMIN_USER, 'admin', 'horvvalle', 'horwalle'].filter(Boolean);
  if (!validUsers.includes(cleanUser)) {
    return false;
  }

  // Allowed passwords: env takes priority, plus valid brand passwords
  const validPasses = [
    ADMIN_PASS,
    'horvvallle2006@2026',
    'horvvalle2006@2026',
  ].filter(Boolean);

  const cleanPassHash = crypto.createHash('sha256').update(cleanPass).digest();

  for (const target of validPasses) {
    const targetHash = crypto.createHash('sha256').update(target).digest();
    if (crypto.timingSafeEqual(cleanPassHash, targetHash)) {
      return true;
    }
  }

  return false;
}

export function createAdminToken(username: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      u: username,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    })
  );

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    const data = JSON.parse(base64UrlDecode(payload));
    if (!data.exp || data.exp < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function isAdminAuthenticated(req: NextRequest): boolean {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  // 2. Check Custom Header
  const customHeader = req.headers.get('x-admin-token') || '';
  if (customHeader && verifyAdminToken(customHeader)) {
    return true;
  }

  // 3. Check HTTP-only or session cookie
  const cookieToken = req.cookies.get('horvvalle_admin_token')?.value;
  if (cookieToken && verifyAdminToken(cookieToken)) {
    return true;
  }

  return false;
}
