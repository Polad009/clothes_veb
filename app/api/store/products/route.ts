import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreProduct } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender');
    const category = searchParams.get('category');
    const search = searchParams.get('q')?.toLowerCase();

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
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        (p.refCode && p.refCode.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(products);
  } catch (error: any) {
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
