import { NextRequest, NextResponse } from 'next/server';
import { deleteProduct, listProducts, saveProduct } from '@/lib/db/products';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const UNAUTHORIZED = { success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender')?.toLowerCase().trim() || null;
    const category = searchParams.get('category');
    const search = searchParams.get('q')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '', 10);

    let products = await listProducts();

    if (gender && gender !== 'all') {
      products = products.filter((p) =>
        gender === 'men' || gender === 'women'
          ? p.gender === gender || p.gender === 'unisex'
          : p.gender === gender
      );
    }

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      products = products.filter((p) =>
        p.slug.toLowerCase().includes(search) ||
        p.id.toLowerCase() === search ||
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        (p.category || '').toLowerCase().includes(search) ||
        p.refCode.toLowerCase().includes(search)
      );
    }

    if (limit > 0) products = products.slice(0, limit);

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[Store Products API] GET failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body?.name || !body?.price) {
      return NextResponse.json({ error: 'Məhsulun adı və qiyməti tələb olunur.' }, { status: 400 });
    }
    const product = await saveProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Məhsul ID-si tələb olunur.' }, { status: 400 });
    }
    await deleteProduct(id);
    return NextResponse.json({ success: true, message: 'Məhsul silindi.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
