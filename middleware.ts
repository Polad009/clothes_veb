import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

// ─── Admin Token Verification (lightweight, runs at edge) ────────────────────
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || 'horvvalle_super_secure_admin_secret_key_2026_98124';

function verifyTokenAtEdge(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return false;

    // Decode payload to check expiry
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const data = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    if (!data.exp || data.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

// ─── Edge DDoS & Rate Limiting Protection ────────────────────────────────────
// In-memory sliding window cache for Edge network to block automated DDoS floods
const ipHitCounter = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, limit = 60, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const entry = ipHitCounter.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHitCounter.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= limit) {
    return true;
  }
  entry.count += 1;
  return false;
}

// ─── Generic Default 404 (Brand-sız, sadə qara/ağ standart Vercel/Next.js tipli 404) ───
const GENERIC_404_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404: This page could not be found</title><style>body{color:#000;background:#fff;font-family:-apple-system,BlinkMacSystemFont,Roboto,"Segoe UI","Fira Sans",Avenir,"Helvetica Neue","Lucida Grande",sans-serif;height:100vh;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}}.d{display:flex;align-items:center}h1{display:inline-block;margin:0 20px 0 0;padding:0 23px 0 0;font-size:24px;font-weight:500;vertical-align:top;line-height:49px;border-right:1px solid rgba(128,128,128,.4)}h2{font-size:14px;font-weight:400;line-height:49px;margin:0}</style></head><body><div class="d"><h1>404</h1><h2>This page could not be found.</h2></div></body></html>`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL EDGE DDOS & FLOOD PROTECTION
  // Automatically throttles aggressive bot attacks and HTTP floods before hitting routes
  // ═══════════════════════════════════════════════════════════════════════════
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'global-client';

  // API routes: Max 60 requests per minute per IP
  // Static pages: Max 150 requests per minute per IP
  const isApi = pathname.startsWith('/api/');
  const maxAllowed = isApi ? 60 : 150;

  if (isRateLimited(clientIp, maxAllowed, 60 * 1000)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'DDoS mühafizəsi: Həddindən artıq sorğu aşkar edildi. Zəhmət olmasa bir qədər gözləyin.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 0. ADMIN PANEL PROTECTION — completely hide /admin from unauthorized users
  // ═══════════════════════════════════════════════════════════════════════════
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminHtml = pathname === '/admin.html';

  if (isAdminPage || isAdminHtml) {
    // Step A: Check for a valid admin cookie (already logged in)
    const cookieToken = request.cookies.get('horvvalle_admin_token')?.value;
    const hasValidCookie = verifyTokenAtEdge(cookieToken);

    // Step B: Check for the secret access key in query string
    const accessKey = request.nextUrl.searchParams.get('access')?.trim();
    const expectedKey = (process.env.ADMIN_ACCESS_KEY || 'horvvalle_portal_2026_xQ9mK').trim();
    const hasValidAccessKey = Boolean(accessKey && accessKey === expectedKey);

    if (hasValidCookie || hasValidAccessKey) {
      // Authorized → allow access to the admin page/html
      const response = NextResponse.next();
      applySecurityHeaders(response);
      return response;
    }

    // Step C: No valid cookie AND no valid access key → return generic 404
    return new NextResponse(GENERIC_404_HTML, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Standard security headers and Geo detection for all other routes
  // ═══════════════════════════════════════════════════════════════════════════
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // Geo detection (Vercel Edge / Cloudflare)
  const country =
    request.headers.get('x-vercel-ip-country')?.toUpperCase() ||
    request.headers.get('cf-ipcountry')?.toUpperCase() ||
    (request as any).geo?.country?.toUpperCase() ||
    '';

  if (country) {
    response.headers.set('x-horwalle-country', country);
    response.cookies.set('horwalle_geo_country', country, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    // Auto set default language cookie if user hasn't explicitly chosen one yet
    const userLangCookie = request.cookies.get('horvvalle_user_language_v1')?.value;
    if (!userLangCookie) {
      const defaultLang = country === 'AZ' ? 'az' : 'en';
      response.cookies.set('horvvalle_user_language_v1', defaultLang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    }

    // Auto set default currency cookie if user hasn't chosen one yet
    const userCurrencyCookie = request.cookies.get('atelier_selected_currency_v1')?.value;
    if (!userCurrencyCookie) {
      const defaultCurr = country === 'AZ' ? 'AZN' : 'USD';
      response.cookies.set('atelier_selected_currency_v1', defaultCurr, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    }
  }

  // 2. Extra API defense against scanning or probing
  if (pathname.startsWith('/api/admin') && !pathname.includes('/api/admin/login')) {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('horvvalle_admin_token')?.value;
    const customToken = request.headers.get('x-admin-token');

    if (!authHeader && !cookieToken && !customToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin icazəsi tələb olunur' },
        { status: 401 }
      );
    }
  }

  return response;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );
  // Content Security Policy (CSP) with Cloudflare Challenges / Turnstile & Payment Gateway Support
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://pay.google.com https://cdn.tailwindcss.com https://unpkg.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https: http:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co https://api.qrserver.com https://epoint.az https://www.google-analytics.com",
    "frame-src 'self' https://challenges.cloudflare.com https://pay.google.com https://epoint.az",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://epoint.az",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images / public static files
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
