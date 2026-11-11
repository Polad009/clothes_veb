import { requestAdminRole } from '@/lib/adminSession';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimiter';
import {
  ChatClosedError,
  MAX_MESSAGE_LENGTH,
  pollConversation,
  postMessage,
  SESSION_RE,
  setClosed,
  setCustomerInfo,
  setTyping,
  type ChatRole,
} from '@/lib/db/chat';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-client';
}

/**
 * GET /api/chat?sessionId=…&role=customer|admin&read=1
 * `read=1` is sent only while the chat is open on screen; it marks the other side's messages as read.
 * Returns { thread: null, messages: [] } for a visitor who has not written yet.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || '';
    if (!SESSION_RE.test(sessionId)) return json({ error: 'sessionId yanlışdır' }, 400);

    const wantsAdmin = searchParams.get('role') === 'admin';
    if (wantsAdmin && !(await requestAdminRole(req))) return json({ error: 'Unauthorized' }, 401);
    const role: ChatRole = wantsAdmin ? 'admin' : 'customer';

    // Older widgets sent typing updates through GET
    const typing = searchParams.get('typing');
    if (typing === 'true' || typing === 'false') await setTyping(sessionId, role, typing === 'true');

    const { thread, messages, adminOnline } = await pollConversation(sessionId, role, searchParams.get('read') === '1');
    return json({ success: true, thread, messages, adminOnline, serverTime: Date.now() });
  } catch (err: any) {
    console.error('[Chat] GET failed:', err);
    return json({ error: err.message }, 500);
  }
}

/**
 * POST /api/chat
 *   { sessionId, sender: 'customer'|'admin', text, customerName?, customerPhone?, customerEmail? }
 *   { sessionId, action: 'typing', role, typing }
 *   { sessionId, action: 'set_customer_info', customerName, customerPhone, customerEmail }
 *   { sessionId, action: 'end_chat' }                       — customer ends the conversation
 *   { sessionId, action: 'close_chat' | 'reopen_chat' }     — admin only
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.sessionId || '');
    if (!SESSION_RE.test(sessionId)) return json({ error: 'sessionId yanlışdır' }, 400);

    const isAdmin = Boolean(await requestAdminRole(req));
    const action = body.action;

    if (action === 'typing') {
      const role: ChatRole = body.role === 'admin' ? 'admin' : 'customer';
      if (role === 'admin' && !isAdmin) return json({ error: 'Unauthorized' }, 401);
      if (!isAdmin && !checkRateLimit(`chat_typing_${clientIp(req)}`, { limit: 40, windowMs: 60_000 }).allowed) {
        return json({ success: true, throttled: true });
      }
      await setTyping(sessionId, role, Boolean(body.typing));
      return json({ success: true });
    }

    if (action === 'close_chat' || action === 'reopen_chat') {
      if (!isAdmin) return json({ error: 'Unauthorized' }, 401);
      await setClosed(sessionId, action === 'close_chat', 'admin');
      return json({ success: true, isClosed: action === 'close_chat' });
    }

    // Everything below can be called by visitors: limit how fast one address may write
    if (!isAdmin && !checkRateLimit(`chat_${clientIp(req)}`, { limit: 30, windowMs: 60_000 }).allowed) {
      return json({ error: 'Çox sürətli yazırsınız. Bir az gözləyib yenidən cəhd edin.' }, 429);
    }

    if (action === 'end_chat') {
      await setClosed(sessionId, true, 'customer');
      return json({ success: true, isClosed: true });
    }

    if (action === 'set_customer_info') {
      await setCustomerInfo(sessionId, { name: body.customerName, phone: body.customerPhone, email: body.customerEmail });
      return json({ success: true });
    }

    const sender = body.sender === 'admin' ? 'admin' : 'customer';
    if (sender === 'admin' && !isAdmin) {
      return json({ error: 'Unauthorized: Admin authentication required to send admin messages' }, 401);
    }
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) return json({ error: 'Boş mesaj göndərilə bilməz.' }, 400);
    if (text.length > MAX_MESSAGE_LENGTH) return json({ error: `Mesaj ən çox ${MAX_MESSAGE_LENGTH} simvol ola bilər.` }, 400);

    const message = await postMessage({
      sessionId,
      sender,
      text,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
    });
    return json({ success: true, message });
  } catch (err: any) {
    if (err instanceof ChatClosedError) return json({ error: err.message, isClosed: true }, 403);
    console.error('[Chat] POST failed:', err);
    return json({ error: err.message }, 500);
  }
}
