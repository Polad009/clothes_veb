// Copies the old live-chat JSON files (private-data/livechat/*.json) into the
// chat_threads / chat_messages tables. Safe to run more than once: messages keep
// their original ids and existing rows are left alone.
//
//   node scripts/import-chat-json.mjs           # dry run
//   node scripts/import-chat-json.mjs --apply
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const BUCKET = 'private-data';
const PREFIX = 'livechat';
const SESSION_RE = /^[A-Za-z0-9_-]{8,80}$/;

for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function download(name) {
  const { data, error } = await supabase.storage.from(BUCKET).download(`${PREFIX}/${name}`);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

const files = [];
for (let offset = 0; ; offset += 1000) {
  const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, { limit: 1000, offset });
  if (error) throw new Error(error.message);
  files.push(...(data || []).map((f) => f.name));
  if (!data || data.length < 1000) break;
}

const sessions = [...new Set(files.filter((n) => n.startsWith('messages_')).map((n) => n.slice(9, -5)))].filter((s) => SESSION_RE.test(s));
const iso = (ms) => new Date(Number(ms) || Date.now()).toISOString();
const clip = (v, n) => (typeof v === 'string' && v.trim() ? v.replace(/[<>]/g, '').trim().slice(0, n) : null);

let threads = 0;
let messages = 0;
let skipped = 0;

for (const sessionId of sessions) {
  const list = (await download(`messages_${sessionId}.json`)) || [];
  const msgs = (Array.isArray(list) ? list : [])
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      id: String(m.id || `legacy_${sessionId}_${m.timestamp}`).slice(0, 120),
      session_id: sessionId,
      sender: m.sender === 'customer' ? 'customer' : m.id?.startsWith('msg_auto_') ? 'system' : 'admin',
      body: m.text.trim().slice(0, 2000),
      created_at: iso(m.timestamp),
    }));
  if (msgs.length === 0) {
    skipped++;
    continue;
  }
  msgs.sort((a, b) => a.created_at.localeCompare(b.created_at));

  const t = (await download(`thread_${sessionId}.json`)) || {};
  const last = msgs[msgs.length - 1];
  const anyRead = (sender) => msgs.filter((m) => m.sender === sender).every((m) => list.find((x) => x.id === m.id)?.status === 'read');
  const thread = {
    session_id: sessionId,
    customer_name: clip(t.customerName, 80) || 'Müştəri',
    customer_phone: clip(t.customerPhone, 30),
    customer_email: clip(t.customerEmail, 120),
    last_message: last.body.slice(0, 300),
    last_sender: last.sender,
    last_message_at: last.created_at,
    message_count: msgs.length,
    unread_admin: Math.max(0, Number(t.unreadAdmin) || 0),
    unread_customer: Math.max(0, Number(t.unreadCustomer) || 0),
    // Old read flags lived on each message; carry them over as read-up-to times
    admin_read_at: anyRead('customer') ? last.created_at : null,
    customer_read_at: anyRead('admin') ? last.created_at : null,
    is_closed: Boolean(t.isClosed),
    closed_by: t.isClosed ? 'customer' : null,
    created_at: iso(t.createdAt || msgs[0].created_at),
  };

  if (APPLY) {
    const tr = await supabase.from('chat_threads').upsert(thread, { onConflict: 'session_id', ignoreDuplicates: true });
    if (tr.error) throw new Error(`${sessionId}: ${tr.error.message}`);
    const mr = await supabase.from('chat_messages').upsert(msgs, { onConflict: 'id', ignoreDuplicates: true });
    if (mr.error) throw new Error(`${sessionId}: ${mr.error.message}`);
  }
  threads++;
  messages += msgs.length;
}

console.log(`Söhbət: ${threads}, mesaj: ${messages}, boş (köçürülmədi): ${skipped}`);
console.log(APPLY ? 'Yazıldı.' : 'DRY RUN — heç nə yazılmadı. Yazmaq üçün: --apply');
