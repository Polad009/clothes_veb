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

// ─── 404 HTML (matching the brand 404 page design) ──────────────────────────
const NOT_FOUND_HTML = `<!DOCTYPE html><html lang="az"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — Horvvalle Atelier</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;background:#090707;color:#fff;font-family:'Georgia',serif;display:flex;align-items:center;justify-content:center;text-align:center}.g{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;background:radial-gradient(circle,rgba(230,194,128,.1),transparent 70%);border-radius:50%;pointer-events:none}.c{max-width:480px;padding:2rem;position:relative;z-index:1}.b{display:inline-flex;align-items:center;gap:.5rem;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);font-size:11px;font-weight:600;letter-spacing:.22em;color:#E6C280;text-transform:uppercase;margin-bottom:1.5rem}h1{font-size:clamp(6rem,15vw,9rem);font-weight:700;letter-spacing:-.04em;background:linear-gradient(180deg,#fff,#d6d3d1,rgba(255,255,255,.1));-webkit-background-clip:text;background-clip:text;color:transparent}h2{font-size:1.5rem;font-weight:700;margin:.75rem 0}p{color:#a8a29e;font-size:.875rem;line-height:1.6;max-width:400px;margin:0 auto 2.5rem}.btns{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}a{display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;border-radius:12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;text-decoration:none;transition:all .2s}.pri{background:#E6C280;color:#000}.pri:hover{background:#fff}.sec{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#d6d3d1}.sec:hover{background:rgba(255,255,255,.1);color:#fff}.sup{margin-top:3rem;font-size:11px;color:#a8a29e}a.wh{color:#E6C280;text-decoration:underline;text-underline-offset:4px}a.wh:hover{color:#fff}</style></head><body><div class="g"></div><div class="c"><div class="b">✦ Horvvalle Atelier</div><h1>404</h1><h2>Səhifə Tapılmadı</h2><p>Axtardığınız səhifə silinmiş, ünvanı dəyişdirilmiş və ya hazırda mövcud deyil.</p><div class="btns"><a href="/collections" class="pri">Kolleksiyaya Keç</a><a href="/" class="sec">Ana Səhifə</a></div><div class="sup">Kömək lazımdır? <a href="https://wa.me/994557669050" target="_blank" rel="noopener" class="wh">Atelye Dəstək (WhatsApp)</a></div></div></body></html>`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ═══════════════════════════════════════════════════════════════════════════
  // 0. ADMIN PANEL PROTECTION — completely hide /admin from unauthorized users
  // ═══════════════════════════════════════════════════════════════════════════
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminHtml = pathname === '/admin.html';

  if (isAdminPage || isAdminHtml) {
    // Step A: Check for a valid admin cookie (already logged in)
    const cookieToken = request.cookies.get('horvvalle_admin_token')?.value;
    const hasValidCookie = verifyTokenAtEdge(cookieToken);

    if (hasValidCookie) {
      // Authorized → let them through with security headers
      const response = NextResponse.next();
      applySecurityHeaders(response);
      return response;
    }

    // Step B: Check for the secret access key in query string
    const accessKey = request.nextUrl.searchParams.get('access');
    const expectedKey = process.env.ADMIN_ACCESS_KEY || 'horvvalle_portal_2026_xQ9mK';

    if (accessKey && accessKey === expectedKey) {
      // Valid access key → let them see the login page
      const response = NextResponse.next();
      applySecurityHeaders(response);
      return response;
    }

    // Step C: No valid cookie AND no valid access key → return 404
    return new NextResponse(NOT_FOUND_HTML, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Standard security headers for all other routes
  // ═══════════════════════════════════════════════════════════════════════════
  const response = NextResponse.next();
  applySecurityHeaders(response);

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
