// End-to-end check of the live chat data layer against the real database.
// Uses a throwaway conversation that is deleted at the end.
//   npx tsx --env-file=.env.local scripts/verify-chat.ts

import { ChatClosedError, deleteThread, listThreads, pollConversation, postMessage, setClosed, setCustomerInfo, setTyping } from '@/lib/db/chat';
import { db } from '@/lib/db/client';

let failed = 0;
function check(name: string, ok: unknown, detail?: unknown) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`, ok ? '' : JSON.stringify(detail ?? ''));
  if (!ok) failed++;
}

const SID = `verify_${Date.now().toString(36)}`;

async function main() {
  try {
    const before = await pollConversation(SID, 'customer', true);
    check('visitor who never wrote gets nothing and creates nothing', before.thread === null && before.messages.length === 0);
    const ghost = await db().from('chat_threads').select('session_id').eq('session_id', SID).maybeSingle();
    check('no empty conversation stored', !ghost.data);

    await setCustomerInfo(SID, { name: 'Sınaq Müştəri', phone: '+994 50 000 00 03' });
    check('empty conversation hidden from the admin list', !(await listThreads()).some((t) => t.sessionId === SID));

    const first = await postMessage({ sessionId: SID, sender: 'customer', text: 'Salam, ölçü sualım var' });
    let view = await pollConversation(SID, 'admin', false);
    check('message stored', view.messages.length === 1 && view.messages[0].text === 'Salam, ölçü sualım var');
    check('name and phone kept', view.thread?.customerName === 'Sınaq Müştəri' && view.thread?.customerPhone === '+994 50 000 00 03');
    check('admin sees it as unread', view.thread?.unreadAdmin === 1);
    check('not read before the admin opens it', view.messages[0].status === 'delivered');
    check('listed for the admin', (await listThreads()).some((t) => t.sessionId === SID && t.unreadAdmin === 1));

    view = await pollConversation(SID, 'admin', true);
    check('opening marks it read', view.thread?.unreadAdmin === 0 && view.messages[0].status === 'read');

    await postMessage({ sessionId: SID, sender: 'admin', text: 'Salam! Buyurun.' });
    let cust = await pollConversation(SID, 'customer', false);
    check('customer has 1 unread while the chat is closed on screen', cust.thread?.unreadCustomer === 1);
    check('closed widget does not mark the reply read', cust.messages[1].status === 'delivered');
    check('shop shows online after the admin polled', cust.adminOnline === true);
    cust = await pollConversation(SID, 'customer', true);
    check('opening the widget marks the reply read', cust.thread?.unreadCustomer === 0 && cust.messages[1].status === 'read');
    check('customer counts as online', cust.thread?.customerOnline === true);

    await setTyping(SID, 'customer', true);
    check('typing shows', (await pollConversation(SID, 'admin', false)).thread?.isTypingCustomer === true);
    await postMessage({ sessionId: SID, sender: 'customer', text: 'L ölçü var?' });
    check('sending clears typing', (await pollConversation(SID, 'admin', false)).thread?.isTypingCustomer === false);

    // The old JSON storage lost messages here: both sides write at the same moment
    const burst = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        postMessage({ sessionId: SID, sender: i % 2 ? 'admin' : 'customer', text: `paralel ${i}` })
      )
    );
    view = await pollConversation(SID, 'admin', false);
    const texts = new Set(view.messages.map((m) => m.text));
    check('20 simultaneous messages from both sides all kept', burst.length === 20 && Array.from({ length: 20 }, (_, i) => `paralel ${i}`).every((t) => texts.has(t)), view.messages.length);
    check('message count matches', view.thread?.messageCount === 23, view.thread?.messageCount);
    check('unread counter counted every customer message', view.thread?.unreadAdmin === 11, view.thread?.unreadAdmin);
    check('messages in time order', view.messages.every((m, i, a) => i === 0 || a[i - 1].timestamp <= m.timestamp));

    await setClosed(SID, true, 'admin');
    let blocked: unknown = null;
    try {
      await postMessage({ sessionId: SID, sender: 'customer', text: 'bağlıdan sonra' });
    } catch (e) {
      blocked = e;
    }
    check('closed conversation refuses new messages', blocked instanceof ChatClosedError);
    await setClosed(SID, false, 'admin');
    await postMessage({ sessionId: SID, sender: 'admin', text: 'Yenidən açdıq' });
    check('reopened conversation accepts messages', (await pollConversation(SID, 'admin', false)).messages.at(-1)?.text === 'Yenidən açdıq');

    let tooLong: unknown = null;
    try {
      await postMessage({ sessionId: SID, sender: 'customer', text: 'x'.repeat(2500) });
    } catch (e) {
      tooLong = e;
    }
    const last = (await pollConversation(SID, 'admin', false)).messages.at(-1);
    check('over-long text is cut to 2000 characters', !tooLong && last?.text.length === 2000);
  } finally {
    await deleteThread(SID);
  }
  const gone = await db().from('chat_messages').select('id', { count: 'exact', head: true }).eq('session_id', SID);
  check('deleting removes the conversation and its messages', (gone.count || 0) === 0);

  console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error('\nABORTED:', e);
  await deleteThread(SID).catch(() => {});
  process.exit(1);
});
