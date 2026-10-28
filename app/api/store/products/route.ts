import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreProduct } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender');
    const category = searchParams.get('category');
    const search = searchParams.get('q')?.toLowerCase();
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const db = readStoreDb();
    let products = db.products;

    if (gender && gender !== 'all') {
      products = products.filter(p => p.gender === gender || p.gender === 'accessories');
    }

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    if (search) {
      products = products.filter(p =>
        (p.slug && p.slug.toLowerCase() === search) ||
        (p.slug && p.slug.toLowerCase().includes(search)) ||
        p.id.toLowerCase() === search ||
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        (p.refCode && p.refCode.toLowerCase().includes(search))
      );
    }

    if (limit && limit > 0) {
      products = products.slice(0, limit);
    }

    const durationMs = Date.now() - startTime;
    console.log(`[Store API Timing] GET /api/store/products - ${durationMs}ms (${products.length} items)`);

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Response-Time': `${durationMs}ms`,
      },
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    console.error(`[Store API Timing Error] Failed in ${durationMs}ms:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const product: StoreProduct = await req.json();
    if (!product.name || !product.price) {
      return NextResponse.json({ error: 'Məhsulun adı və qiyməti tələb olunur.' }, { status: 400 });
    }

    const db = readStoreDb();
    const existingIndex = db.products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      // Update existing
      db.products[existingIndex] = { ...db.products[existingIndex], ...product };
    } else {
      // Create new
      if (!product.id) {
        product.id = 'vtx-' + Date.now().toString(36);
      }
      if (!product.slug) {
        product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      db.products.unshift(product);
    }

    writeStoreDb(db);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Məhsul ID-si tələb olunur.' }, { status: 400 });
    }

    const db = readStoreDb();
    const prevCount = db.products.length;
    db.products = db.products.filter(p => p.id !== id);

    if (db.products.length === prevCount) {
      return NextResponse.json({ error: 'Məhsul tapılmadı.' }, { status: 404 });
    }

    writeStoreDb(db);
    return NextResponse.json({ success: true, message: 'Məhsul silindi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
