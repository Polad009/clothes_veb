import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const BUCKET = 'product-images';
const CHAT_PREFIX = 'livechat';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  text: string;
  timestamp: number;
  read?: boolean;
}

interface ChatThread {
  sessionId: string;
  customerName: string;
  customerEmail?: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadAdmin: number;
  unreadCustomer: number;
  customerOnline?: boolean;
  adminOnline?: boolean;
  isTypingCustomer?: boolean;
  isTypingAdmin?: boolean;
  createdAt: number;
}

// In-memory fast fallback cache
const memoryThreads: Record<string, ChatThread> = {};
const memoryMessages: Record<string, ChatMessage[]> = {};

async function getThreadFromStorage(sessionId: string): Promise<ChatThread | null> {
  if (memoryThreads[sessionId]) return memoryThreads[sessionId];
  try {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET)
      .download(`${CHAT_PREFIX}/thread_${sessionId}.json`);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      memoryThreads[sessionId] = parsed;
      return parsed;
    }
  } catch (e) {}
  return null;
}

async function saveThreadToStorage(thread: ChatThread) {
  memoryThreads[thread.sessionId] = thread;
  try {
    await supabaseServer.storage
      .from(BUCKET)
      .upload(`${CHAT_PREFIX}/thread_${thread.sessionId}.json`, Buffer.from(JSON.stringify(thread)), {
        contentType: 'application/json',
        upsert: true,
      });
  } catch (e) {}
}

async function getMessagesFromStorage(sessionId: string): Promise<ChatMessage[]> {
  if (memoryMessages[sessionId]) return memoryMessages[sessionId];
  try {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET)
      .download(`${CHAT_PREFIX}/messages_${sessionId}.json`);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      memoryMessages[sessionId] = Array.isArray(parsed) ? parsed : [];
      return memoryMessages[sessionId];
    }
  } catch (e) {}
  return [];
}

async function saveMessagesToStorage(sessionId: string, messages: ChatMessage[]) {
  memoryMessages[sessionId] = messages;
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

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    let thread = await getThreadFromStorage(sessionId);
    if (!thread) {
      thread = {
        sessionId,
        customerName: searchParams.get('name') || 'Müştəri',
        lastMessage: 'Söhbət başladıldı',
        lastMessageAt: Date.now(),
        unreadAdmin: 0,
        unreadCustomer: 0,
        customerOnline: true,
        adminOnline: true,
        isTypingCustomer: false,
        isTypingAdmin: false,
        createdAt: Date.now(),
      };
      await saveThreadToStorage(thread);
    } else {
      let changed = false;
      if (role === 'customer') {
        if (!thread.customerOnline) { thread.customerOnline = true; changed = true; }
        if (isTypingParam !== null) {
          const isTyping = isTypingParam === 'true';
          if (thread.isTypingCustomer !== isTyping) { thread.isTypingCustomer = isTyping; changed = true; }
        }
        if (thread.unreadCustomer > 0) {
          thread.unreadCustomer = 0;
          changed = true;
        }
      } else if (role === 'admin') {
        if (!thread.adminOnline) { thread.adminOnline = true; changed = true; }
        if (isTypingParam !== null) {
          const isTyping = isTypingParam === 'true';
          if (thread.isTypingAdmin !== isTyping) { thread.isTypingAdmin = isTyping; changed = true; }
        }
        if (thread.unreadAdmin > 0) {
          thread.unreadAdmin = 0;
          changed = true;
        }
      }
      if (changed) {
        await saveThreadToStorage(thread);
      }
    }

    const messages = await getMessagesFromStorage(sessionId);

    return NextResponse.json({
      success: true,
      thread,
      messages,
      serverTime: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/chat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sender, text, customerName, customerEmail } = body;

    if (!sessionId || !sender || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid message payload' }, { status: 400 });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    let thread = await getThreadFromStorage(sessionId);
    if (!thread) {
      thread = {
        sessionId,
        customerName: customerName || 'Müştəri',
        customerEmail: customerEmail || undefined,
        lastMessage: trimmed,
        lastMessageAt: Date.now(),
        unreadAdmin: sender === 'customer' ? 1 : 0,
        unreadCustomer: sender === 'admin' ? 1 : 0,
        customerOnline: true,
        adminOnline: true,
        isTypingCustomer: false,
        isTypingAdmin: false,
        createdAt: Date.now(),
      };
    } else {
      thread.lastMessage = trimmed;
      thread.lastMessageAt = Date.now();
      if (customerName) thread.customerName = customerName;
      if (customerEmail) thread.customerEmail = customerEmail;

      if (sender === 'customer') {
        thread.unreadAdmin = (thread.unreadAdmin || 0) + 1;
        thread.isTypingCustomer = false;
        thread.customerOnline = true;
      } else {
        thread.unreadCustomer = (thread.unreadCustomer || 0) + 1;
        thread.isTypingAdmin = false;
        thread.adminOnline = true;
      }
    }

    await saveThreadToStorage(thread);

    const messages = await getMessagesFromStorage(sessionId);
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender,
      text: trimmed,
      timestamp: Date.now(),
      read: false,
    };
    messages.push(newMsg);

    // Keep max 200 recent messages per session
    if (messages.length > 200) {
      messages.splice(0, messages.length - 200);
    }

    await saveMessagesToStorage(sessionId, messages);

    return NextResponse.json({
      success: true,
      message: newMsg,
      thread,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
