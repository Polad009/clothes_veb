import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const BUCKET = 'product-images';
const CHAT_PREFIX = 'livechat';

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  text: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  read?: boolean;
}

export interface ChatThread {
  sessionId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadAdmin: number;
  unreadCustomer: number;
  customerOnline?: boolean;
  adminOnline?: boolean;
  isTypingCustomer?: boolean;
  isTypingAdmin?: boolean;
  isClosed?: boolean;
  typingAdminExpiresAt?: number;
  typingCustomerExpiresAt?: number;
  createdAt: number;
}

// In-memory cache WITH short TTL to avoid serving stale data in serverless instances
const cacheTimestamps: Record<string, number> = {};
const memoryThreads: Record<string, ChatThread> = {};
const memoryMessages: Record<string, ChatMessage[]> = {};

async function getThreadFromStorage(sessionId: string, bypassCache = false): Promise<ChatThread | null> {
  const now = Date.now();
  if (!bypassCache && memoryThreads[sessionId] && cacheTimestamps[`t_${sessionId}`] && (now - cacheTimestamps[`t_${sessionId}`] < 800)) {
    return memoryThreads[sessionId];
  }

  if (!supabaseServer) return memoryThreads[sessionId] || null;

  try {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET)
      .download(`${CHAT_PREFIX}/thread_${sessionId}.json`);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      memoryThreads[sessionId] = parsed;
      cacheTimestamps[`t_${sessionId}`] = now;
      return parsed;
    }
  } catch (e) {}
  return memoryThreads[sessionId] || null;
}

async function saveThreadToStorage(thread: ChatThread) {
  memoryThreads[thread.sessionId] = thread;
  cacheTimestamps[`t_${thread.sessionId}`] = Date.now();
  if (!supabaseServer) return;
  try {
    await supabaseServer.storage
      .from(BUCKET)
      .upload(`${CHAT_PREFIX}/thread_${thread.sessionId}.json`, Buffer.from(JSON.stringify(thread)), {
        contentType: 'application/json',
        upsert: true,
      });
  } catch (e) {}
}

async function getMessagesFromStorage(sessionId: string, bypassCache = false): Promise<ChatMessage[]> {
  const now = Date.now();
  if (!bypassCache && memoryMessages[sessionId] && cacheTimestamps[`m_${sessionId}`] && (now - cacheTimestamps[`m_${sessionId}`] < 800)) {
    return memoryMessages[sessionId];
  }

  if (!supabaseServer) return memoryMessages[sessionId] || [];

  try {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET)
      .download(`${CHAT_PREFIX}/messages_${sessionId}.json`);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : [];
      memoryMessages[sessionId] = list;
      cacheTimestamps[`m_${sessionId}`] = now;
      return list;
    }
  } catch (e) {}
  return memoryMessages[sessionId] || [];
}

async function saveMessagesToStorage(sessionId: string, messages: ChatMessage[]) {
  memoryMessages[sessionId] = messages;
  cacheTimestamps[`m_${sessionId}`] = Date.now();
  if (!supabaseServer) return;
  try {
    await supabaseServer.storage
      .from(BUCKET)
      .upload(`${CHAT_PREFIX}/messages_${sessionId}.json`, Buffer.from(JSON.stringify(messages)), {
        contentType: 'application/json',
        upsert: true,
      });
  } catch (e) {}
}

// GET /api/chat?sessionId=...&role=customer|admin&typing=true|false
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const role = searchParams.get('role') || 'customer';
    const isTypingParam = searchParams.get('typing');
    const now = Date.now();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    let thread = await getThreadFromStorage(sessionId, true);
    let messages = await getMessagesFromStorage(sessionId, true);
    let messagesUpdated = false;

    if (!thread) {
      thread = {
        sessionId,
        customerName: searchParams.get('name') || 'Müştəri',
        lastMessage: 'Söhbət başladıldı',
        lastMessageAt: now,
        unreadAdmin: 0,
        unreadCustomer: 0,
        customerOnline: true,
        adminOnline: true,
        isTypingCustomer: false,
        isTypingAdmin: false,
        createdAt: now,
      };
      await saveThreadToStorage(thread);
    } else {
      let changed = false;

      // Check auto-expiration for typing states (maximum 4 seconds)
      if (thread.isTypingAdmin && thread.typingAdminExpiresAt && now > thread.typingAdminExpiresAt) {
        thread.isTypingAdmin = false;
        changed = true;
      }
      if (thread.isTypingCustomer && thread.typingCustomerExpiresAt && now > thread.typingCustomerExpiresAt) {
        thread.isTypingCustomer = false;
        changed = true;
      }

      if (role === 'customer') {
        if (!thread.customerOnline) { thread.customerOnline = true; changed = true; }
        if (isTypingParam !== null) {
          const isTyping = isTypingParam === 'true';
          if (thread.isTypingCustomer !== isTyping) {
            thread.isTypingCustomer = isTyping;
            thread.typingCustomerExpiresAt = isTyping ? now + 4000 : 0;
            changed = true;
          }
        }
        if (thread.unreadCustomer > 0) {
          thread.unreadCustomer = 0;
          changed = true;
        }

        // When customer is viewing the chat, admin messages become 'read' / delivered
        for (const m of messages) {
          if (m.sender === 'admin' && m.status !== 'read') {
            m.status = 'read';
            m.read = true;
            messagesUpdated = true;
          }
        }
      } else if (role === 'admin' && isAdminAuthenticated(req)) {
        if (!thread.adminOnline) { thread.adminOnline = true; changed = true; }
        if (isTypingParam !== null) {
          const isTyping = isTypingParam === 'true';
          if (thread.isTypingAdmin !== isTyping) {
            thread.isTypingAdmin = isTyping;
            thread.typingAdminExpiresAt = isTyping ? now + 4000 : 0;
            changed = true;
          }
        }
        if (thread.unreadAdmin > 0) {
          thread.unreadAdmin = 0;
          changed = true;
        }

        // When admin reads the chat, customer's messages are marked as read (double blue check)
        for (const m of messages) {
          if (m.sender === 'customer' && m.status !== 'read') {
            m.status = 'read';
            m.read = true;
            messagesUpdated = true;
          }
        }
      }

      if (changed) {
        await saveThreadToStorage(thread);
      }
      if (messagesUpdated) {
        await saveMessagesToStorage(sessionId, messages);
      }
    }

    const res = NextResponse.json({
      success: true,
      thread,
      messages,
      serverTime: now,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/chat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sender, text, customerName, customerPhone, customerEmail, action } = body;
    const now = Date.now();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Action: Close / End Chat
    if (action === 'end_chat') {
      let thread = await getThreadFromStorage(sessionId, true);
      if (thread) {
        thread.isClosed = true;
        thread.lastMessage = 'Söhbət müştəri tərəfindən yekunlaşdırıldı';
        thread.lastMessageAt = now;
        await saveThreadToStorage(thread);
      }
      return NextResponse.json({ success: true, isClosed: true });
    }

    // Action: Set/Update Customer Info
    if (action === 'set_customer_info') {
      let thread = await getThreadFromStorage(sessionId, true);
      if (!thread) {
        thread = {
          sessionId,
          customerName: customerName || 'Müştəri',
          customerPhone: customerPhone || undefined,
          customerEmail: customerEmail || undefined,
          lastMessage: 'Söhbət başladıldı',
          lastMessageAt: now,
          unreadAdmin: 0,
          unreadCustomer: 0,
          customerOnline: true,
          adminOnline: true,
          isTypingCustomer: false,
          isTypingAdmin: false,
          createdAt: now,
        };
      } else {
        if (customerName) thread.customerName = customerName;
        if (customerPhone) thread.customerPhone = customerPhone;
        if (customerEmail) thread.customerEmail = customerEmail;
      }
      await saveThreadToStorage(thread);
      return NextResponse.json({ success: true, thread });
    }

    if (!sender || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid message payload' }, { status: 400 });
    }

    if (sender === 'admin' && !isAdminAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required to send admin messages' }, { status: 401 });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    let thread = await getThreadFromStorage(sessionId, true);

    // If chat is already closed/ended, reject any new messages from both customer and admin!
    if (thread && thread.isClosed) {
      return NextResponse.json(
        { error: 'Bu söhbət yekunlaşdırılıb. Zəhmət olmasa yeni söhbət başladın.', isClosed: true },
        { status: 403 }
      );
    }

    if (!thread) {
      thread = {
        sessionId,
        customerName: customerName || 'Müştəri',
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        lastMessage: trimmed,
        lastMessageAt: now,
        unreadAdmin: sender === 'customer' ? 1 : 0,
        unreadCustomer: sender === 'admin' ? 1 : 0,
        customerOnline: true,
        adminOnline: true,
        isTypingCustomer: false,
        isTypingAdmin: false,
        createdAt: now,
      };
    } else {
      thread.lastMessage = trimmed;
      thread.lastMessageAt = now;
      if (customerName) thread.customerName = customerName;
      if (customerPhone) thread.customerPhone = customerPhone;
      if (customerEmail) thread.customerEmail = customerEmail;

      if (sender === 'customer') {
        thread.unreadAdmin = (thread.unreadAdmin || 0) + 1;
        thread.isTypingCustomer = false;
        thread.customerOnline = true;
      } else {
        thread.unreadCustomer = (thread.unreadCustomer || 0) + 1;
        thread.isTypingAdmin = false;
        thread.typingAdminExpiresAt = 0;
        thread.adminOnline = true;
      }
    }

    await saveThreadToStorage(thread);

    const messages = await getMessagesFromStorage(sessionId, true);
    const newMsg: ChatMessage = {
      id: `msg_${now}_${Math.random().toString(36).substring(2, 7)}`,
      sender,
      text: trimmed,
      timestamp: now,
      status: 'delivered',
      read: false,
    };
    messages.push(newMsg);

    // AVTOMATİK CAVAB (Müştəri ilk dəfə yazdıqda ad və əlaqə nömrəsini dərhal soruşan bot/sistem mesajı)
    if (sender === 'customer') {
      const customerMsgs = messages.filter(m => m.sender === 'customer');
      const alreadyAsked = messages.some(m => m.sender === 'admin' && m.text.includes('adınızı və əlaqə nömrənizi'));
      
      // Əgər müştərinin ilk mesajıdırsa və hələ əlaqə məlumatı qeyd edilməyibsə
      if (customerMsgs.length === 1 && !alreadyAsked && (!thread.customerPhone || thread.customerName === 'Müştəri')) {
        const autoReplyNow = now + 100;
        const autoMsg: ChatMessage = {
          id: `msg_auto_${autoReplyNow}`,
          sender: 'admin',
          text: 'Salam! Horwalle Atelier Canlı Dəstək xidmətinə xoş gəlmisiniz. Zəhmət olmasa, sizə operativ və fərdi xidmət göstərə bilməyimiz üçün adınızı və əlaqə nömrənizi qeyd edin.',
          timestamp: autoReplyNow,
          status: 'delivered',
          read: false,
        };
        messages.push(autoMsg);
        thread.lastMessage = autoMsg.text;
        thread.lastMessageAt = autoReplyNow;
        thread.unreadCustomer = (thread.unreadCustomer || 0) + 1;
        await saveThreadToStorage(thread);
      }
    }

    // Keep max 200 recent messages per session
    if (messages.length > 200) {
      messages.splice(0, messages.length - 200);
    }

    await saveMessagesToStorage(sessionId, messages);

    const res = NextResponse.json({
      success: true,
      message: newMsg,
      thread,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
