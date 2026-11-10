import { db, unwrap } from './client';

export const SESSION_RE = /^[A-Za-z0-9_-]{8,80}$/;
export const MAX_MESSAGE_LENGTH = 2000;

/** A visitor counts as on the site while their widget keeps checking in. */
const CUSTOMER_ONLINE_MS = 30_000;
/** The shop counts as online while an admin has the chat page open. */
const ADMIN_ONLINE_MS = 45_000;
const TYPING_MS = 5_000;
const MESSAGE_LIMIT = 300;
const PRESENCE_KEY = 'chat_presence';

export type ChatRole = 'customer' | 'admin';

export interface ChatMessage {
  id: string;
  /** 'admin' covers both the shop's replies and automatic store notices. */
  sender: 'customer' | 'admin';
  system?: boolean;
  text: string;
  timestamp: number;
  status: 'delivered' | 'read';
}

export interface ChatThread {
  sessionId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  lastMessage: string;
  lastSender?: string;
  lastMessageAt: number;
  messageCount: number;
  unreadAdmin: number;
  unreadCustomer: number;
  customerOnline: boolean;
  customerSeenAt?: number;
  adminOnline: boolean;
  isTypingCustomer: boolean;
  isTypingAdmin: boolean;
  isClosed: boolean;
  closedBy?: string;
  createdAt: number;
}

export class ChatClosedError extends Error {
  constructor() {
    super('Bu söhbət yekunlaşdırılıb. Zəhmət olmasa yeni söhbət başladın.');
    this.name = 'ChatClosedError';
  }
}

const ms = (v: string | null | undefined) => (v ? new Date(v).getTime() : 0);

function clean(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.replace(/[<>]/g, '').trim().slice(0, max);
  return v || undefined;
}

function rowToThread(r: any, adminSeenAt: number, now = Date.now()): ChatThread {
  return {
    sessionId: r.session_id,
    customerName: r.customer_name || 'Müştəri',
    customerPhone: r.customer_phone || undefined,
    customerEmail: r.customer_email || undefined,
    lastMessage: r.last_message || '',
    lastSender: r.last_sender || undefined,
    lastMessageAt: ms(r.last_message_at),
    messageCount: r.message_count || 0,
    unreadAdmin: r.unread_admin || 0,
    unreadCustomer: r.unread_customer || 0,
    customerOnline: now - ms(r.customer_seen_at) < CUSTOMER_ONLINE_MS,
    customerSeenAt: ms(r.customer_seen_at) || undefined,
    adminOnline: now - adminSeenAt < ADMIN_ONLINE_MS,
    isTypingCustomer: ms(r.customer_typing_until) > now,
    isTypingAdmin: ms(r.admin_typing_until) > now,
    isClosed: Boolean(r.is_closed),
    closedBy: r.closed_by || undefined,
    createdAt: ms(r.created_at),
  };
}

function rowToMessage(r: any, thread: any): ChatMessage {
  const at = ms(r.created_at);
  // A message is read once the other side has opened the chat after it arrived
  const readAt = r.sender === 'customer' ? ms(thread.admin_read_at) : ms(thread.customer_read_at);
  return {
    id: r.id,
    sender: r.sender === 'customer' ? 'customer' : 'admin',
    system: r.sender === 'system' || undefined,
    text: r.body,
    timestamp: at,
    status: readAt >= at ? 'read' : 'delivered',
  };
}

// ─── Admin presence (one row in site_settings) ─────────────────────────────────

async function getAdminSeenAt(): Promise<number> {
  const row = unwrap(
    await db().from('site_settings').select('value').eq('key', PRESENCE_KEY).maybeSingle(),
    'Çat statusu oxunmadı'
  );
  return Number((row?.value as any)?.adminSeenAt) || 0;
}

/** Marks the shop as online. Writes at most every 15 seconds. */
export async function touchAdminPresence(): Promise<void> {
  const now = Date.now();
  if (now - (await getAdminSeenAt()) < 15_000) return;
  unwrap(
    await db()
      .from('site_settings')
      .upsert({ key: PRESENCE_KEY, value: { adminSeenAt: now }, updated_at: new Date(now).toISOString() }, { onConflict: 'key' }),
    'Çat statusu yazılmadı'
  );
}

// ─── Reading ───────────────────────────────────────────────────────────────────

async function getThreadRow(sessionId: string): Promise<any | null> {
  return unwrap(
    await db().from('chat_threads').select('*').eq('session_id', sessionId).maybeSingle(),
    'Söhbət oxunmadı'
  );
}

/**
 * One poll from the customer widget or the admin chat page.
 * Records presence, and — only when the chat is actually open on screen
 * (`markRead`) — marks the other side's messages as read.
 * Never creates a conversation: a visitor who has not written gets nothing back.
 */
export async function pollConversation(
  sessionId: string,
  role: ChatRole,
  markRead: boolean
): Promise<{ thread: ChatThread | null; messages: ChatMessage[]; adminOnline: boolean }> {
  if (role === 'customer') {
    // Presence is compared with the app clock, so the app clock stamps it
    unwrap(
      await db().from('chat_threads').update({ customer_seen_at: new Date().toISOString() }).eq('session_id', sessionId),
      'Söhbət yenilənmədi'
    );
  }
  if (markRead) {
    // Read times are compared with message times, so the database clock stamps them
    const { error } = await db().rpc('chat_mark_read', { p_session: sessionId, p_role: role });
    if (error) throw new Error(`Söhbət yenilənmədi: ${error.message}`);
  }
  if (role === 'admin') await touchAdminPresence();

  const [row, adminSeenAt] = await Promise.all([getThreadRow(sessionId), getAdminSeenAt()]);
  const adminOnline = Date.now() - adminSeenAt < ADMIN_ONLINE_MS;
  if (!row) return { thread: null, messages: [], adminOnline };

  const rows = unwrap(
    await db()
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(MESSAGE_LIMIT),
    'Mesajlar oxunmadı'
  );
  const messages = (rows || []).reverse().map((m: any) => rowToMessage(m, row));
  return { thread: rowToThread(row, adminSeenAt), messages, adminOnline };
}

/** Conversations for the admin list, newest first. Empty conversations are left out. */
export async function listThreads(): Promise<ChatThread[]> {
  await touchAdminPresence();
  const [rows, adminSeenAt] = await Promise.all([
    db()
      .from('chat_threads')
      .select('*')
      .gt('message_count', 0)
      .order('last_message_at', { ascending: false })
      .limit(300)
      .then((res) => unwrap(res, 'Söhbətlər oxunmadı')),
    getAdminSeenAt(),
  ]);
  const now = Date.now();
  return (rows || []).map((r: any) => rowToThread(r, adminSeenAt, now));
}

export async function countUnreadThreads(): Promise<number> {
  const res = await db()
    .from('chat_threads')
    .select('session_id', { count: 'exact', head: true })
    .gt('unread_admin', 0)
    .eq('is_closed', false);
  return res.count || 0;
}

// ─── Writing ───────────────────────────────────────────────────────────────────

export async function postMessage(input: {
  sessionId: string;
  sender: 'customer' | 'admin' | 'system';
  text: string;
  customerName?: unknown;
  customerPhone?: unknown;
  customerEmail?: unknown;
}): Promise<ChatMessage> {
  const body = String(input.text || '').trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!body) throw new Error('Boş mesaj göndərilə bilməz.');

  const isCustomer = input.sender === 'customer';
  const { data, error } = await db().rpc('chat_post_message', {
    p_session: input.sessionId,
    p_sender: input.sender,
    p_body: body,
    p_name: isCustomer ? clean(input.customerName, 80) ?? null : null,
    p_phone: isCustomer ? clean(input.customerPhone, 30) ?? null : null,
    p_email: isCustomer ? clean(input.customerEmail, 120) ?? null : null,
  });
  if (error) {
    if (/CHAT_CLOSED/.test(error.message)) throw new ChatClosedError();
    throw new Error(`Mesaj göndərilmədi: ${error.message}`);
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { id: row.id, sender: row.sender === 'customer' ? 'customer' : 'admin', system: row.sender === 'system' || undefined, text: row.body, timestamp: ms(row.created_at), status: 'delivered' };
}

/** Saves the visitor's name and phone; creates the conversation if needed. */
export async function setCustomerInfo(sessionId: string, info: { name?: unknown; phone?: unknown; email?: unknown }) {
  const name = clean(info.name, 80);
  const phone = clean(info.phone, 30);
  const email = clean(info.email, 120);
  const existing = await getThreadRow(sessionId);
  if (existing) {
    const patch: Record<string, any> = {};
    if (name) patch.customer_name = name;
    if (phone) patch.customer_phone = phone;
    if (email) patch.customer_email = email;
    if (Object.keys(patch).length) unwrap(await db().from('chat_threads').update(patch).eq('session_id', sessionId), 'Məlumat saxlanılmadı');
    return;
  }
  unwrap(
    await db().from('chat_threads').insert({ session_id: sessionId, customer_name: name || 'Müştəri', customer_phone: phone ?? null, customer_email: email ?? null }),
    'Məlumat saxlanılmadı'
  );
}

export async function setTyping(sessionId: string, role: ChatRole, typing: boolean) {
  const column = role === 'customer' ? 'customer_typing_until' : 'admin_typing_until';
  unwrap(
    await db()
      .from('chat_threads')
      .update({ [column]: typing ? new Date(Date.now() + TYPING_MS).toISOString() : null })
      .eq('session_id', sessionId),
    'Yazır statusu yazılmadı'
  );
}

export async function setClosed(sessionId: string, closed: boolean, by: ChatRole) {
  unwrap(
    await db()
      .from('chat_threads')
      .update(
        closed
          ? { is_closed: true, closed_by: by, closed_at: new Date().toISOString(), customer_typing_until: null, admin_typing_until: null }
          : { is_closed: false, closed_by: null, closed_at: null }
      )
      .eq('session_id', sessionId),
    'Söhbət statusu dəyişmədi'
  );
}

export async function deleteThread(sessionId: string) {
  unwrap(await db().from('chat_threads').delete().eq('session_id', sessionId), 'Söhbət silinmədi');
}
