import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Secrets come from the environment only; there is deliberately no built-in fallback.
const SECRET = (process.env.ADMIN_JWT_SECRET || '').trim();

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

  // Exactly check configured username from env (fallback to 'admin')
  const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  if (cleanUser !== expectedUser) {
    return false;
  }

  // Exactly check configured password from env
  const expectedPass = (process.env.ADMIN_PASSWORD || '').trim();
  if (!expectedPass || !SECRET) {
    return false;
  }

  const cleanPassHash = crypto.createHash('sha256').update(cleanPass).digest();
  const targetHash = crypto.createHash('sha256').update(expectedPass).digest();

  return crypto.timingSafeEqual(cleanPassHash, targetHash);
}

/** owner = the shop owner (everything); staff = orders, print jobs, chat and products only. */
export type AdminRole = 'owner' | 'staff';

export function createAdminToken(username: string, role: AdminRole = 'owner'): string {
  if (!SECRET) throw new Error('ADMIN_JWT_SECRET konfiqurasiya olunmayıb.');
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      u: username,
      r: role,
      // owner: 7 days; staff: 12 hours, so a removed staff account stops working soon
      exp: Date.now() + (role === 'staff' ? 12 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000),
    })
  );

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  return adminTokenRole(token) !== null;
}

/** The role in a valid token, or null. Tokens made before roles existed belong to the owner. */
export function adminTokenRole(token: string | null | undefined): AdminRole | null {
  const data = readAdminToken(token);
  if (!data) return null;
  return data.r === 'staff' ? 'staff' : 'owner';
}

/** Username in a valid token, or null. */
export function adminTokenUser(token: string | null | undefined): string | null {
  const data = readAdminToken(token);
  return data ? String(data.u || '') : null;
}

function readAdminToken(token: string | null | undefined): Record<string, any> | null {
  if (!SECRET || !token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const data = JSON.parse(base64UrlDecode(payload));
    if (!data.exp || data.exp < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/** Token sent with a request (Bearer header, x-admin-token header or the session cookie). */
function requestToken(req: NextRequest): string | undefined {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const t = authHeader.slice(7).trim();
    if (verifyAdminToken(t)) return t;
  }
  const custom = req.headers.get('x-admin-token') || '';
  if (custom && verifyAdminToken(custom)) return custom;
  return req.cookies.get('horvvalle_admin_token')?.value;
}

export function adminRequestRole(req: NextRequest): AdminRole | null {
  return adminTokenRole(requestToken(req));
}

/** Owner-only actions: settings, prices, content, discounts, reports, credentials, deleting. */
export function isAdminOwner(req: NextRequest): boolean {
  return adminRequestRole(req) === 'owner';
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
