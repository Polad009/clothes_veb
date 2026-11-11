import { requestAdminRole } from '@/lib/adminSession';
import { NextRequest, NextResponse } from 'next/server';
import { deleteThread, listThreads, SESSION_RE } from '@/lib/db/chat';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

/** GET /api/chat/threads — conversations for the admin chat page (also marks the shop as online). */
export async function GET(req: NextRequest) {
  if (!(await requestAdminRole(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, threads: await listThreads() }, { headers: NO_STORE });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** DELETE /api/chat/threads?sessionId=… — removes one conversation and its messages. */
export async function DELETE(req: NextRequest) {
  if (!(await requestAdminRole(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }
  try {
    const sessionId = new URL(req.url).searchParams.get('sessionId') || '';
    if (!SESSION_RE.test(sessionId)) {
      return NextResponse.json({ error: 'sessionId yanlışdır' }, { status: 400 });
    }
    await deleteThread(sessionId);
    return NextResponse.json({ success: true, deletedSessionId: sessionId }, { headers: NO_STORE });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
