import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // API routes: Max 120 requests per minute per IP (allowing fast chat sync)
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

  return response;
}

// ─── Production Grade HTTP Security Headers ──────────────────────────────────
function applySecurityHeaders(res: NextResponse) {
  // Prevent clickjacking on public store pages
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing
  res.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer privacy
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Modern browser XSS protection
  res.headers.set('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HSTS) - enforce HTTPS for 1 year
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Permissions policy for camera, microphone, geolocation
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, sounds, models)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|brand/|sounds/|models/|textures/).*)',
  ],
};
