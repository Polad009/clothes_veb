import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminToken,
  isAdminAuthenticated,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
} from '@/lib/adminAuth';
import { sendOrderStatusUpdate, sendBroadcastCampaign } from '@/lib/email/emailService';
import { handleAdminUpload } from '@/lib/adminUpload';
import { verifyAdminLogin } from '@/lib/adminCredentials';
import { refreshStore } from '@/lib/storeSnapshot';
import { db } from '@/lib/db/client';
import { deleteProduct, listProducts, saveProduct } from '@/lib/db/products';
import {
  deleteAllOrders,
  deleteOrder,
  deleteTestOrders,
  listOrders,
  listPodOrders,
  OutOfStockError,
  updateOrder,
  updatePodOrderStatus,
} from '@/lib/db/orders';
import {
  deleteCategory,
  deletePromo,
  getContent,
  getSettings,
  listCategories,
  listPromos,
  saveCategory,
  saveContent,
  savePromo,
  saveSettings,
} from '@/lib/db/site';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

type RouteContext = { params: { slug: string[] } };

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' };

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

function unauthorized() {
  return json({ error: 'Unauthorized: Admin icazəsi tələb olunur' }, 401);
}

function failure(error: any) {
  if (error instanceof OutOfStockError) return json({ success: false, error: error.message }, 409);
  console.error('[AdminAPI]', error);
  return json({ success: false, error: error?.message || 'Server xətası' }, 500);
}

/** Everything the admin panel shows, read live from the database. */
async function loadAdminData() {
  const [settings, content, products, orders, podOrders, promoCodes, profilesRes] = await Promise.all([
    getSettings(),
    getContent(),
    listProducts(),
    listOrders(),
    listPodOrders(),
    listPromos(),
    db().from('profiles').select('*').order('created_at', { ascending: false }),
  ]);

  return { settings, content, products, orders, podOrders, promoCodes, profiles: profilesRes.data || [] };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const route = (params.slug || [])[0];

    if (route === 'verify') {
      return isAdminAuthenticated(req)
        ? json({ success: true, authenticated: true })
        : json({ success: false, authenticated: false }, 401);
    }

    if (!isAdminAuthenticated(req)) return unauthorized();

    if (route === 'data') {
      return json(await loadAdminData());
    }

    // Images bundled with the site (development convenience; uploads live in Storage)
    if (route === 'gallery') {
      const publicDir = path.join(process.cwd(), 'public');
      const list: string[] = [];

      const scan = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        try {
          for (const f of fs.readdirSync(dir)) {
            const full = path.join(dir, f);
            if (fs.statSync(full).isDirectory()) {
              scan(full);
            } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(f)) {
              list.push('/' + path.relative(publicDir, full).replace(/\\/g, '/'));
            }
          }
        } catch (e) {}
      };

      scan(path.join(publicDir, 'images'));
      return NextResponse.json(list);
    }

    return json({ error: 'Endpoint not found' }, 404);
  } catch (error: any) {
    return failure(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const [route, subRoute] = params.slug || [];

    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    let formData: FormData | null = null;
    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData().catch(() => null);
    } else {
      body = await req.json().catch(() => ({}));
    }

    if (route === 'login') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
      const rateCheck = checkRateLimit(ip);
      if (!rateCheck.allowed) {
        return json(
          { error: `Çoxsaylı uğursuz cəhd! Zəhmət olmasa ${rateCheck.retryAfter} saniyə sonra yenidən cəhd edin.` },
          429
        );
      }

      const { username, password } = body;
      if (!(await verifyAdminLogin(username, password))) {
        recordFailedAttempt(ip);
        return json({ error: 'İstifadəçi adı və ya şifrə yanlışdır.' }, 401);
      }

      recordSuccessfulLogin(ip);
      const token = createAdminToken(username || 'admin');
      const response = json({ success: true, token });
      response.cookies.set({
        name: 'horvvalle_admin_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
      return response;
    }

    if (route === 'logout') {
      const response = json({ success: true, message: 'Çıxış edildi' });
      response.cookies.delete('horvvalle_admin_token');
      return response;
    }

    if (!isAdminAuthenticated(req)) return unauthorized();

    if (route === 'products') {
      const product = await saveProduct(body);
      refreshStore();
      return json({ success: true, product });
    }

    if (route === 'upload' || route === 'upload-image') {
      return handleAdminUpload(formData, body);
    }

    if (route === 'content') {
      const settings = body.settings ? await saveSettings(body.settings) : await getSettings();
      const content = body.content ? await saveContent(body.content) : await getContent();
      refreshStore();
      return json({ success: true, settings, content });
    }

    if (route === 'orders' && subRoute === 'clear-all') {
      const count = await deleteAllOrders();
      return json({ success: true, count });
    }

    if (route === 'promos') {
      const promo = await savePromo(body);
      return json({ success: true, promo });
    }

    if (route === 'categories') {
      const category = await saveCategory(body);
      refreshStore();
      return json({ success: true, category, categories: await listCategories() });
    }

    if (route === 'broadcast-email') {
      const { subject, headline, message, promoCode, ctaLink } = body;
      if (!subject || !headline || !message) {
        return json({ error: 'Mövzu, başlıq və mesaj mətni tələb olunur.' }, 400);
      }
      const result = await sendBroadcastCampaign({ subject, headline, message, promoCode, ctaLink });
      return json({ success: true, result });
    }

    return json({ error: 'Endpoint not found' }, 404);
  } catch (error: any) {
    return failure(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    if (!isAdminAuthenticated(req)) return unauthorized();

    const [route, rawId] = params.slug || [];
    const id = rawId ? decodeURIComponent(rawId) : '';
    const body = await req.json().catch(() => ({}));

    if (route === 'orders' && id) {
      const { orderStatus, paymentStatus } = body;
      const order = await updateOrder(id, { orderStatus, paymentStatus });
      if (!order) return json({ error: 'Sifariş tapılmadı' }, 404);

      if (orderStatus) {
        sendOrderStatusUpdate(order, orderStatus).catch((e) => {
          console.warn('Status update email warning:', e);
        });
      }
      return json({ success: true, order });
    }

    if (route === 'pod-orders' && id) {
      const status = String(body.status || '').replace(/[<>]/g, '').trim().slice(0, 50);
      if (!status) return json({ error: 'Status tələb olunur' }, 400);
      const podOrder = await updatePodOrderStatus(id, status);
      if (!podOrder) return json({ error: 'Fərdi çap sifarişi tapılmadı' }, 404);
      return json({ success: true, podOrder });
    }

    return json({ error: 'Endpoint not found' }, 404);
  } catch (error: any) {
    return failure(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    if (!isAdminAuthenticated(req)) return unauthorized();

    const [route, rawId] = params.slug || [];
    const id = rawId ? decodeURIComponent(rawId) : '';

    if (route === 'products' && id) {
      await deleteProduct(id);
      refreshStore();
      return json({ success: true });
    }

    if (route === 'orders' && id === 'clear-test') {
      const count = await deleteTestOrders();
      return json({ success: true, count, message: `${count} test sifarişi silindi.` });
    }

    if (route === 'orders' && id) {
      await deleteOrder(id);
      return json({ success: true });
    }

    if (route === 'promos' && id) {
      await deletePromo(id);
      return json({ success: true });
    }

    if (route === 'categories' && id) {
      await deleteCategory(id);
      refreshStore();
      return json({ success: true });
    }

    return json({ error: 'Endpoint not found' }, 404);
  } catch (error: any) {
    return failure(error);
  }
}
