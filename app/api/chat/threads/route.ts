import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const BUCKET = 'product-images';
const CHAT_PREFIX = 'livechat';

export async function GET(req: NextRequest) {
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

// DELETE /api/chat/threads?sessionId=... (Delete entire chat thread + messages from Supabase)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const filesToRemove = [
      `${CHAT_PREFIX}/thread_${sessionId}.json`,
      `${CHAT_PREFIX}/messages_${sessionId}.json`,
    ];

    const { error } = await supabaseServer.storage.from(BUCKET).remove(filesToRemove);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedSessionId: sessionId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
