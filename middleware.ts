import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Lightweight WebCrypto HMAC-SHA256 for Edge Middleware ──────────────────
// No built-in fallback: without ADMIN_JWT_SECRET no admin session can be valid.
const ADMIN_JWT_SECRET = (process.env.ADMIN_JWT_SECRET || '').trim();

async function verifyTokenAtEdge(token: string | undefined | null): Promise<boolean> {
  if (!ADMIN_JWT_SECRET || !token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(ADMIN_JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${payload}`));
    const bytes = new Uint8Array(sigBuf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSignature = btoa(binary)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) return false;

    // Decode payload to check expiry
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = atob(base64);
    const data = JSON.parse(jsonStr);
    if (!data.exp || data.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

// ─── Admin link code ─────────────────────────────────────────────────────────
// A code saved in the admin panel (site_settings.admin_access) replaces ADMIN_ACCESS_KEY.
// Cached per edge instance for 30 seconds, so a change applies within half a minute.
let accessKeyCache: { key: string; at: number } | null = null;

async function expectedAccessKey(): Promise<string> {
  const envKey = (process.env.ADMIN_ACCESS_KEY || '').trim();
  if (accessKeyCache && Date.now() - accessKeyCache.at < 30_000) return accessKeyCache.key || envKey;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let stored = '';
  if (url && serviceKey) {
    try {
      const res = await fetch(`${url}/rest/v1/site_settings?key=eq.admin_access&select=value`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const rows = await res.json();
        stored = String(rows?.[0]?.value?.key || '').trim();
      } else if (accessKeyCache) {
        stored = accessKeyCache.key; // keep the last known code if the database blips
      }
    } catch {
      if (accessKeyCache) stored = accessKeyCache.key;
    }
  }
  accessKeyCache = { key: stored, at: Date.now() };
  return stored || envKey;
}

// ─── Edge DDoS & Rate Limiting Protection ────────────────────────────────────
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL EDGE DDOS & FLOOD PROTECTION
  // Automatically throttles aggressive bot attacks and HTTP floods before hitting routes
  // ═══════════════════════════════════════════════════════════════════════════
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'global-client';

  // API routes: Max 120 requests per minute per IP (allowing real-time chat)
  // Static pages: Max 300 requests per minute per IP
  const isApi = pathname.startsWith('/api/');
  const maxAllowed = isApi ? 120 : 300;

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
    // Check for the secret access key in query string
    const accessKey = request.nextUrl.searchParams.get('access')?.trim();
    const expectedKey = accessKey ? await expectedAccessKey() : '';
    const hasValidAccessKey = Boolean(expectedKey && accessKey && accessKey === expectedKey);

    const isLoginPage = pathname === '/admin/login';
    const hasSession = await verifyTokenAtEdge(request.cookies.get('horvvalle_admin_token')?.value);

    if (hasSession) {
      // Signed-in admin: every admin page is reachable without the key in the URL
      const response = isLoginPage
        ? NextResponse.redirect(new URL('/admin', request.url))
        : NextResponse.next();
      applySecurityHeaders(response);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }

    if (hasValidAccessKey) {
      // Knows the secret link but is not signed in yet → the login page (and only it)
      const response = isLoginPage || isAdminHtml
        ? NextResponse.next()
        : NextResponse.redirect(new URL(`/admin/login?access=${encodeURIComponent(expectedKey)}`, request.url));
      applySecurityHeaders(response);
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }

    // Neither a session nor the secret link → generic 404, the admin area stays invisible
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
    'camera=*, microphone=(), geolocation=(), payment=(self)'
  );
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https: http: https://challenges.cloudflare.com https://pay.google.com https://cdn.tailwindcss.com https://unpkg.com https://www.googletagmanager.com https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
    "style-src 'self' 'unsafe-inline' https: http: https://fonts.googleapis.com https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
    "img-src 'self' blob: data: https: http: https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
    "font-src 'self' https://fonts.gstatic.com data: https:",
    "media-src 'self' blob: data: https: http: https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
    "connect-src 'self' blob: data: https: http: wss: ws: https://challenges.cloudflare.com https://*.supabase.co https://api.qrserver.com https://epoint.az https://www.google-analytics.com https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
    "frame-src 'self' blob: data: https: http: https://challenges.cloudflare.com https://pay.google.com https://epoint.az https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
    "child-src 'self' blob: https: https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https: https://epoint.az https://tryanywear.ai https://*.tryanywear.ai https://anywear.decart.ai https://*.decart.ai",
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
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
