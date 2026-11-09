import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const BUCKET = 'product-images';
const CHAT_PREFIX = 'livechat';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }

  if (!supabaseServer) {
    const res = NextResponse.json({ success: true, threads: [] });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  }

  try {
    const { data: files, error } = await supabaseServer.storage
      .from(BUCKET)
      .list(CHAT_PREFIX, { limit: 100, sortBy: { column: 'updated_at', order: 'desc' } });

    if (error) {
      const res = NextResponse.json({ success: true, threads: [] });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      return res;
    }

    const threadFiles = (files || []).filter((f) => f.name.startsWith('thread_'));
    const threads: any[] = [];

    await Promise.all(
      threadFiles.map(async (file) => {
        try {
          if (!supabaseServer) return;
          const { data } = await supabaseServer.storage
            .from(BUCKET)
            .download(`${CHAT_PREFIX}/${file.name}`);
          if (data) {
            const parsed = JSON.parse(await data.text());
            threads.push(parsed);
          }
        } catch (e) {}
      })
    );

    // Sort by most recent message
    threads.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    const res = NextResponse.json({
      success: true,
      threads,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/chat/threads?sessionId=... or /api/chat/threads?all=true (Batch delete all chat threads + messages)
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const deleteAll = searchParams.get('all') === 'true';

    if (!sessionId && !deleteAll) {
      return NextResponse.json({ error: 'sessionId or all=true required' }, { status: 400 });
    }

    if (!supabaseServer) {
      return NextResponse.json({ success: true, deletedAll: deleteAll, deletedSessionId: sessionId });
    }

    if (deleteAll) {
      // 1. Purge all storage files under livechat/
      const { data: files, error: listError } = await supabaseServer.storage
        .from(BUCKET)
        .list(CHAT_PREFIX, { limit: 1000 });

      let removedCount = 0;
      if (!listError && files && files.length > 0) {
        const filePaths = files.map((f) => `${CHAT_PREFIX}/${f.name}`);
        const { error: removeError } = await supabaseServer.storage.from(BUCKET).remove(filePaths);
        if (removeError) {
          console.warn('[ChatThreads] Warning deleting storage files:', removeError);
        } else {
          removedCount = filePaths.length;
        }
      }

      // 2. Purge database tables if present
      try {
        await supabaseServer.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabaseServer.from('chat_threads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        // Database tables optional in storage-backed livechat
      }

      return NextResponse.json({
        success: true,
        message: 'Bütün mesajlar və söhbət tarixçəsi uğurla silindi',
        deletedAll: true,
        deletedCount: removedCount,
      });
    }

    // Single thread deletion
    const filesToRemove = [
      `${CHAT_PREFIX}/thread_${sessionId}.json`,
      `${CHAT_PREFIX}/messages_${sessionId}.json`,
    ];

    const { error } = await supabaseServer.storage.from(BUCKET).remove(filesToRemove);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabaseServer.from('chat_messages').delete().eq('session_id', sessionId);
      await supabaseServer.from('chat_threads').delete().eq('session_id', sessionId);
    } catch (e) {}

    return NextResponse.json({ success: true, deletedSessionId: sessionId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
