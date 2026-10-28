import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreProduct } from '@/lib/storeDb';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || [];
    const route = slug[0];

    // 1. Full store data
    if (route === 'data') {
      const data = readStoreDb();
      return NextResponse.json(data);
    }

    // 2. Gallery images list
    if (route === 'gallery') {
      const imagesDir = path.join(process.cwd(), 'public', 'images');
      const list: string[] = [];

      const scan = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        try {
          const files = fs.readdirSync(dir);
          for (const f of files) {
            const full = path.join(dir, f);
            if (fs.statSync(full).isDirectory()) {
              scan(full);
            } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(f)) {
              const rel = path.relative(path.join(process.cwd(), 'public'), full);
              list.push('/' + rel.replace(/\\/g, '/'));
            }
          }
        } catch (e) {}
      };

      scan(imagesDir);
      return NextResponse.json(list);
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || [];
    const route = slug[0];
    const subRoute = slug[1];
    const body = await req.json().catch(() => ({}));
    const db = readStoreDb();

    // 1. Save Product (Add or Edit)
    if (route === 'products') {
      const product = body;
      const existingIndex = db.products.findIndex((p: StoreProduct) => p.id === product.id);

      if (existingIndex >= 0) {
        db.products[existingIndex] = { ...db.products[existingIndex], ...product };
      } else {
        if (!product.id) product.id = 'vtx-' + Date.now().toString(36);
        if (!product.slug) product.slug = (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        db.products.unshift(product);
      }

      writeStoreDb(db);
      return NextResponse.json({ success: true, product });
    }

    // 2. Update Dynamic CMS Content & Settings
    if (route === 'content') {
      const { settings, content } = body;
      if (settings) db.settings = { ...db.settings, ...settings };
      if (content) db.content = { ...db.content, ...content };
      writeStoreDb(db);
      return NextResponse.json({ success: true, settings: db.settings, content: db.content });
    }

    // 3. Clear All Orders
    if (route === 'orders' && subRoute === 'clear-all') {
      db.orders = [];
      db.podOrders = [];
      writeStoreDb(db);
      return NextResponse.json({ success: true });
    }

    // 4. Add or Edit Promo Code
    if (route === 'promos') {
      const promo = body;
      if (!db.promoCodes) db.promoCodes = [];
      const index = db.promoCodes.findIndex((p: any) => p.id === promo.id || p.code === promo.code);
      if (index >= 0) {
        db.promoCodes[index] = { ...db.promoCodes[index], ...promo };
      } else {
        promo.id = promo.id || 'promo-' + Date.now();
        db.promoCodes.unshift(promo);
      }
      writeStoreDb(db);
      return NextResponse.json({ success: true, promo });
    }

    // 5. Upload Image
    if (route === 'upload-image') {
      const { dataUrl } = body;
      if (!dataUrl) return NextResponse.json({ error: 'dataUrl required' }, { status: 400 });
      return NextResponse.json({ success: true, url: dataUrl });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || [];
    const route = slug[0];
    const id = slug[1];
    const body = await req.json().catch(() => ({}));
    const db = readStoreDb();

    // 1. Update Order Status
    if (route === 'orders' && id) {
      const { orderStatus, paymentStatus } = body;
      const index = db.orders.findIndex((o: any) => o.id === id);
      if (index >= 0) {
        if (orderStatus) db.orders[index].orderStatus = orderStatus;
        if (paymentStatus) db.orders[index].paymentStatus = paymentStatus;
        writeStoreDb(db);
        return NextResponse.json({ success: true, order: db.orders[index] });
      }
      return NextResponse.json({ error: 'Sifariş tapılmadı' }, { status: 404 });
    }

    // 2. Update POD Order Status
    if (route === 'pod-orders' && id) {
      const { status } = body;
      const index = (db.podOrders || []).findIndex((p: any) => p.id === id);
      if (index >= 0) {
        db.podOrders[index].status = status;
        writeStoreDb(db);
        return NextResponse.json({ success: true, podOrder: db.podOrders[index] });
      }
      return NextResponse.json({ error: 'Fərdi çap sifarişi tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || [];
    const route = slug[0];
    const id = slug[1];
    const db = readStoreDb();

    // 1. Delete Product
    if (route === 'products' && id) {
      db.products = db.products.filter((p: any) => p.id !== id);
      writeStoreDb(db);
      return NextResponse.json({ success: true });
    }

    // 2. Delete Order
    if (route === 'orders' && id) {
      db.orders = (db.orders || []).filter((o: any) => o.id !== id);
      db.podOrders = (db.podOrders || []).filter((p: any) => p.orderId !== id && p.id !== id);
      writeStoreDb(db);
      return NextResponse.json({ success: true });
    }

    // 3. Delete Promo
    if (route === 'promos' && id) {
      db.promoCodes = (db.promoCodes || []).filter((p: any) => p.id !== id && p.code !== id);
      writeStoreDb(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
