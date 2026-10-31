import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clone response headers or create next response
  const response = NextResponse.next();

  // 1. Mandatory HTTP Security Headers (OWASP Top 10 Defense)
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

