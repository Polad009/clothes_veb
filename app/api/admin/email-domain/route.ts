import { NextRequest, NextResponse } from 'next/server';
import { isAdminOwner } from '@/lib/adminAuth';
import { createEmailDomain, getEmailDomainStatus, sendTestEmail, verifyEmailDomain } from '@/lib/email/domain';
import { SENDER_EMAIL } from '@/lib/email/emailService';
import { getSettings } from '@/lib/db/site';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
}

/** GET — sending domain status and the DNS records Resend expects. */
export async function GET(req: NextRequest) {
  if (!isAdminOwner(req)) return unauthorized();
  try {
    const [status, settings] = await Promise.all([getEmailDomainStatus(), getSettings()]);
    return NextResponse.json({ ...status, sender: SENDER_EMAIL, orderNotifyEmail: (settings as any).orderNotifyEmail || '' }, { headers: NO_STORE });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST { action: 'setup' | 'verify' | 'test', to? } */
export async function POST(req: NextRequest) {
  if (!isAdminOwner(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'setup') return NextResponse.json({ ...(await createEmailDomain()), sender: SENDER_EMAIL }, { headers: NO_STORE });
    if (body.action === 'verify') return NextResponse.json({ ...(await verifyEmailDomain()), sender: SENDER_EMAIL }, { headers: NO_STORE });
    if (body.action === 'test') {
      const to = String(body.to || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: 'Düzgün e-poçt ünvanı yazın.' }, { status: 400 });
      const result = await sendTestEmail(to, SENDER_EMAIL);
      return NextResponse.json(result, { status: result.error ? 502 : 200, headers: NO_STORE });
    }
    return NextResponse.json({ error: 'Naməlum əməliyyat' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
