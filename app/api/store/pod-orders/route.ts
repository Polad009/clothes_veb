import { NextRequest, NextResponse } from 'next/server';
import { createPodOrder, listPodOrders, updatePodOrderStatus } from '@/lib/db/orders';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

const UNAUTHORIZED = { success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' };

function sanitizeStr(val: any, maxLen = 100): string {
  if (!val || typeof val !== 'string') return '';
  return val.replace(/[<>]/g, '').trim().slice(0, maxLen);
}

function firstString(...values: any[]): string {
  for (const v of values) if (typeof v === 'string' && v) return v;
  return '';
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    return NextResponse.json(await listPodOrders());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-client';
    if (!checkRateLimit(`pod_${ip}`, { limit: 10, windowMs: 60 * 1000 }).allowed) {
      return NextResponse.json({ error: 'Həddindən artıq cəhd. Bir dəqiqə sonra yenidən yoxlayın.' }, { status: 429 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Etibarsız məlumat göndərildi.' }, { status: 400 });
    }

    const custom = body.customData || {};
    const podOrder = await createPodOrder({
      orderId: sanitizeStr(body.orderId, 50) || 'VTX-CUSTOM-' + Date.now().toString(36).toUpperCase(),
      customerName: sanitizeStr(body.customerName, 100) || 'Müştəri',
      customerPhone: sanitizeStr(body.customerPhone, 30),
      customerEmail: sanitizeStr(body.customerEmail, 100),
      garmentType: sanitizeStr(body.garmentType, 100) || 'Heavyweight Oversized Tee',
      garmentColor: sanitizeStr(body.garmentColor, 50) || 'Onyx Black',
      size: sanitizeStr(body.size, 10) || 'L',
      price: Math.max(0, Number(body.price) || 55),
      frontDesign: body.frontDesign || custom.frontDesign || {},
      backDesign: body.backDesign || custom.backDesign || {},
      status: 'Pending Print',
      originalImage: firstString(
        body.originalImage,
        custom.originalImage,
        custom.frontDesign?.originalImage,
        custom.backDesign?.originalImage
      ),
      placement: sanitizeStr(body.placement || custom.placement, 100) || 'Sinə (Mərkəz)',
      customerNote: sanitizeStr(body.customerNote || custom.customerNote, 500),
      placementData: body.placementData || custom.placementData || null,
      previewImage: firstString(body.previewImage, custom.previewImage),
      customData: body.customData || null,
    });

    return NextResponse.json({ success: true, podOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    const clean = sanitizeStr(status, 50);
    if (!id || !clean) {
      return NextResponse.json({ error: 'ID və status tələb olunur.' }, { status: 400 });
    }

    const podOrder = await updatePodOrderStatus(String(id), clean);
    if (!podOrder) {
      return NextResponse.json({ error: 'Fərdi sifariş tapılmadı.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, podOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
