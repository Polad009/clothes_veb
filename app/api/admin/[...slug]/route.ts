import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreProduct } from '@/lib/storeDb';
import {
  verifyAdminCredentials,
  createAdminToken,
  isAdminAuthenticated,
} from '@/lib/adminAuth';
import { sendOrderStatusUpdate, sendBroadcastCampaign } from '@/lib/email/emailService';
import { supabaseServer } from '@/lib/supabaseServer';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getEnrichedStoreData() {
  const db = readStoreDb();
  if (!supabaseServer) return db;

  try {
    // 1. Fetch live registered customer profiles from Supabase
    const { data: supaProfiles } = await supabaseServer
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (supaProfiles) {
      (db as any).profiles = supaProfiles;
    }

    // 2. Fetch live cloud orders from Supabase
    const { data: supaOrders } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (supaOrders && supaOrders.length > 0) {
      const existingIds = new Set((db.orders || []).map((o: any) => String(o.id)));
      
      const convertedSupaOrders = supaOrders.map((so: any) => ({
        id: String(so.id),
        date: so.created_at,
        customer: {
          fullName: so.customer_name || 'Müştəri',
          phone: so.customer_phone || '-',
          email: so.customer_email || '-',
          address: so.delivery_address || '-',
          city: so.delivery_city || 'Bakı',
          country: 'Azərbaycan',
        },
        items: (so.order_items || []).map((it: any) => ({
          name: it.item_name,
          color: it.color || 'Standart',
          size: it.size || 'L',
          quantity: it.quantity || 1,
          price: Number(it.unit_price) || 0,
        })),
        subtotal: Number(so.total_amount) || 0,
        shipping: 0,
        discount: 0,
        total: Number(so.total_amount) || 0,
        paymentMethod: so.payment_method || 'Kart',
        paymentStatus: so.payment_status || 'Paid',
        orderStatus: so.order_status || 'Yeni Sifariş',
        source: 'Supabase Cloud',
      }));

      // Add any Supabase orders that aren't in local DB yet
      for (const co of convertedSupaOrders) {
        if (!existingIds.has(co.id)) {
          db.orders.push(co);
          existingIds.add(co.id);
        }
      }
    }
  } catch (err) {
    console.warn('[AdminAPI] Enriched data sync warning:', err);
  }

  return db;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || [];
    const route = slug[0];

    // Auth verification check
    if (route === 'verify') {
      const isAuth = isAdminAuthenticated(req);
      if (isAuth) {
        return NextResponse.json({ success: true, authenticated: true });
      }
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    // ALL OTHER GET ROUTES REQUIRE ADMIN AUTH
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin icazəsi tələb olunur' },
        { status: 401 }
      );
    }

    // 1. Full store data (protected & enriched with Supabase live profiles & cloud orders)
    if (route === 'data') {
      const data = await getEnrichedStoreData();
      return NextResponse.json(data);
    }

    // 2. Gallery images list (protected)
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

    // 0. LOGIN ROUTE (Publicly accessible for authenticating)
    if (route === 'login') {
      const { username, password } = body;
      const isValid = verifyAdminCredentials(username, password);

      if (!isValid) {
        return NextResponse.json(
          { error: 'İstifadəçi adı və ya şifrə yanlışdır.' },
          { status: 401 }
        );
      }

      const token = createAdminToken(username || 'admin');
      const response = NextResponse.json({ success: true, token });

      // Set secure HTTP-only cookie
      response.cookies.set({
        name: 'horvvalle_admin_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    // 0. LOGOUT ROUTE
    if (route === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Çıxış edildi' });
      response.cookies.delete('horvvalle_admin_token');
      return response;
    }

    // ALL OTHER POST ROUTES REQUIRE ADMIN AUTH
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin icazəsi tələb olunur' },
        { status: 401 }
      );
    }

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

      if (supabaseServer) {
        try {
          await supabaseServer.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseServer.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (e) {
          console.warn('Supabase clear warning:', e);
        }
      }

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

    // 6. Categories Management
    if (route === 'categories') {
      const cat = body;
      if (!db.content) db.content = {} as any;
      if (!db.content.categories) {
        db.content.categories = [
          { id: 'koynek', title: 'T-Shirt & Köynək', desc: 'Streetwear & Oxford', image: '/images/products/vintage-king-of-pop-tee/mockup.jpg', active: true },
          { id: 'hudi', title: 'Hudi & Sviter', desc: '3iplik Qalın & İsti', image: '/images/products/heavyweight-hoodie-black/mockup.jpg', active: true },
          { id: 'salvar', title: 'Şalvar & Cins', desc: 'Kargo & Chino', image: '/images/products/modern-utility-cargo-pants/mockup.jpg', active: true },
          { id: 'aksesuar', title: 'Aksessuarlar', desc: 'Snapback & Çanta', image: '/images/products/snapback-cap-heavy/mockup.jpg', active: true }
        ];
      }
      const existingIdx = db.content.categories.findIndex((c: any) => c.id === cat.id);
      if (existingIdx >= 0) {
        db.content.categories[existingIdx] = { ...db.content.categories[existingIdx], ...cat };
      } else {
        cat.id = cat.id || 'cat-' + Date.now();
        db.content.categories.push(cat);
      }
      writeStoreDb(db);
      return NextResponse.json({ success: true, category: cat, categories: db.content.categories });
    }

    // 7. Loyalty Terminal Balance Update
    if (route === 'loyalty') {
      const { phone, points, tier, fullName } = body;
      if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });
      if (!(db as any).loyalty) (db as any).loyalty = [];
      const list = (db as any).loyalty;
      const idx = list.findIndex((l: any) => l.phone === phone);
      if (idx >= 0) {
        list[idx].points = (Number(list[idx].points) || 0) + Number(points || 0);
        if (tier) list[idx].tier = tier;
        if (fullName) list[idx].fullName = fullName;
      } else {
        list.push({
          phone,
          fullName: fullName || 'Müştəri',
          points: Number(points || 0),
          tier: tier || 'Bronze'
        });
      }
      writeStoreDb(db);
      return NextResponse.json({ success: true, loyalty: (db as any).loyalty });
    }

    // 8. Marketing Email Broadcast
    if (route === 'broadcast-email') {
      const { subject, headline, message, promoCode, ctaLink } = body;
      if (!subject || !headline || !message) {
        return NextResponse.json({ error: 'Mövzu, başlıq və mesaj mətni tələb olunur.' }, { status: 400 });
      }
      const result = await sendBroadcastCampaign({ subject, headline, message, promoCode, ctaLink });
      return NextResponse.json({ success: true, result });
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
    // ALL PATCH ROUTES REQUIRE ADMIN AUTH
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin icazəsi tələb olunur' },
        { status: 401 }
      );
    }

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
        if (orderStatus) {
          db.orders[index].orderStatus = orderStatus;
          sendOrderStatusUpdate(db.orders[index], orderStatus).catch((e) => {
            console.warn('Status update email warning:', e);
          });
        }
        if (paymentStatus) db.orders[index].paymentStatus = paymentStatus;
        writeStoreDb(db);

        // Also sync update to Supabase orders table
        if (supabaseServer) {
          try {
            const updatePayload: any = {};
            if (orderStatus) updatePayload.order_status = orderStatus;
            if (paymentStatus) updatePayload.payment_status = paymentStatus;
            await supabaseServer.from('orders').update(updatePayload).eq('id', id);
          } catch (e) {
            console.warn('Supabase status update warning:', e);
          }
        }

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
    // ALL DELETE ROUTES REQUIRE ADMIN AUTH
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin icazəsi tələb olunur' },
        { status: 401 }
      );
    }

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

      if (supabaseServer) {
        try {
          await supabaseServer.from('order_items').delete().eq('order_id', id);
          await supabaseServer.from('orders').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase delete order warning:', e);
        }
      }

      return NextResponse.json({ success: true });
    }

    // 3. Delete Promo
    if (route === 'promos' && id) {
      db.promoCodes = (db.promoCodes || []).filter((p: any) => p.id !== id && p.code !== id);
      writeStoreDb(db);
      return NextResponse.json({ success: true });
    }

    // 4. Delete Category
    if (route === 'categories' && id) {
      if (db.content?.categories) {
        db.content.categories = db.content.categories.filter((c: any) => c.id !== id);
        writeStoreDb(db);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
