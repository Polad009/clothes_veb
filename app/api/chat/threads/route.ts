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
      return NextResponse.json({ threads: [] });
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

    return NextResponse.json({
      success: true,
      threads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
