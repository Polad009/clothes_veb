import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, isAdminAuthenticated, recordFailedAttempt, recordSuccessfulLogin } from '@/lib/adminAuth';
import { changeAccessKey, changeAdminPassword, currentAccessKey, currentAdminUsername } from '@/lib/adminCredentials';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** GET — current username and admin link (signed-in admins only). */
export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [username, accessKey] = await Promise.all([currentAdminUsername(), currentAccessKey()]);
  return NextResponse.json({ username, accessKey }, { headers: NO_STORE });
}

/**
 * POST { action: 'password', currentPassword, username, newPassword }
 * POST { action: 'access-key', currentPassword, accessKey }
 * Both need the current password, and wrong guesses count toward the login lockout.
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json({ error: `Çoxsaylı uğursuz cəhd. ${limit.retryAfter} saniyə sonra yenidən yoxlayın.` }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'password') {
      await changeAdminPassword({ currentPassword: body.currentPassword, username: body.username, newPassword: body.newPassword });
    } else if (body.action === 'access-key') {
      await changeAccessKey({ currentPassword: body.currentPassword, accessKey: body.accessKey });
    } else {
      return NextResponse.json({ error: 'Naməlum əməliyyat' }, { status: 400 });
    }
    recordSuccessfulLogin(ip);
    const [username, accessKey] = await Promise.all([currentAdminUsername(), currentAccessKey()]);
    return NextResponse.json({ success: true, username, accessKey }, { headers: NO_STORE });
  } catch (e: any) {
    if (/Hazırkı şifrə/.test(e.message)) recordFailedAttempt(ip);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
