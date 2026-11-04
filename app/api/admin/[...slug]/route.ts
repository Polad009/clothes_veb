import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreProduct } from '@/lib/storeDb';
import {
  verifyAdminCredentials,
  createAdminToken,
  isAdminAuthenticated,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
} from '@/lib/adminAuth';
import { sendOrderStatusUpdate, sendBroadcastCampaign } from '@/lib/email/emailService';
import { supabaseServer } from '@/lib/supabaseServer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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
        isTest: Boolean(so.is_test || so.payment_status === 'test_paid'),
        currency: so.currency || 'AZN',
        promoCode: so.promo_code || undefined,
        provider: so.provider || 'mock',
      }));

      // Add any Supabase orders that aren't in local DB yet
      for (const co of convertedSupaOrders) {
        if (!existingIds.has(co.id)) {
          db.orders.push(co);
          existingIds.add(co.id);
        }
      }
    }

    // 3. Fetch live products from Supabase
    const { data: supaProducts } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (supaProducts && supaProducts.length > 0) {
      db.products = supaProducts.map((sp: any) => {
        let meta: any = {};
        try {
          if (typeof sp.description === 'string' && sp.description.startsWith('{')) {
            meta = JSON.parse(sp.description);
          }
        } catch (e) {}

        const resolvedImage = meta.image || meta.colors?.[0]?.image || meta.images?.[0] || sp.image || '/images/hero/black-tee.jpg';
        const resolvedImages = (meta.images && meta.images.length > 0) ? meta.images : [resolvedImage];

        return {
          id: sp.id,
          metaId: meta.id || sp.id,
          slug: sp.slug,
          name: sp.name,
          refCode: meta.refCode || sp.slug,
          price: Number(sp.price),
          compareAtPrice: meta.compareAtPrice != null && meta.compareAtPrice !== '' ? Number(meta.compareAtPrice) : undefined,
          category: sp.category,
          gender: sp.gender || 'unisex',
          badge: meta.badge || '',
          rating: meta.rating ?? 5.0,
          reviewCount: meta.reviewCount ?? 12,
          fit: meta.fit || 'Regular Fit',
          fabric: meta.fabric || '',
          composition: meta.composition || '',
          care: meta.care || '',
          isNew: sp.is_new ?? false,
          inStock: sp.in_stock ?? true,
          description: meta.description || (typeof sp.description === 'string' && !sp.description.startsWith('{') ? sp.description : ''),
          image: resolvedImage,
          images: resolvedImages,
          hoverImage: meta.hoverImage || meta.colors?.[0]?.hoverImage || '',
          colors: meta.colors || [],
          sizes: meta.sizes && meta.sizes.length > 0 ? meta.sizes : ['S', 'M', 'L', 'XL'],
          features: meta.features || [],
        };
      });
    }
    // 4. Fetch live promo codes from Supabase cloud storage
    try {
      const { data: promoFile, error: promoErr } = await supabaseServer.storage
        .from('product-images')
        .download('config/promos.json');

      if (!promoErr && promoFile) {
        const promoText = await promoFile.text();
        const cloudPromos = JSON.parse(promoText);
        if (Array.isArray(cloudPromos)) {
          db.promoCodes = cloudPromos;
        }
      }
    } catch (promoSyncErr) {
      console.warn('[AdminAPI] Promo cloud sync warning:', promoSyncErr);
    }

    // 5. Fetch live CMS content & settings from Supabase cloud storage
    try {
      const { data: configFile, error: configErr } = await supabaseServer.storage
        .from('product-images')
        .download('config/store_config.json');

      if (!configErr && configFile) {
        const configText = await configFile.text();
        const cloudConfig = JSON.parse(configText);
        if (cloudConfig?.content) db.content = { ...db.content, ...cloudConfig.content };
        if (cloudConfig?.settings) db.settings = { ...db.settings, ...cloudConfig.settings };
      }
    } catch (configSyncErr) {
      console.warn('[AdminAPI] Config cloud sync warning:', configSyncErr);
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
        } catch (e) { }
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

    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    let formData: FormData | null = null;
    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData().catch(() => null);
    } else {
      body = await req.json().catch(() => ({}));
    }

    // 0. LOGIN ROUTE (Publicly accessible for authenticating)
    if (route === 'login') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
      const rateCheck = checkRateLimit(ip);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: `Çoxsaylı uğursuz cəhd! Zəhmət olmasa ${rateCheck.retryAfter} saniyə sonra yenidən cəhd edin.` },
          { status: 429 }
        );
      }

      const { username, password } = body;
      const isValid = verifyAdminCredentials(username, password);

      if (!isValid) {
        recordFailedAttempt(ip);
        return NextResponse.json(
          { error: 'İstifadəçi adı və ya şifrə yanlışdır.' },
          { status: 401 }
        );
      }

      recordSuccessfulLogin(ip);
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
      const existingIndex = db.products.findIndex(
        (p: StoreProduct) => p.id === product.id || (product.slug && p.slug === product.slug)
      );

      const hasCompareAtPrice = product.compareAtPrice !== null && product.compareAtPrice !== undefined && (product.compareAtPrice as any) !== '';
      const parsedCompareAtPrice = hasCompareAtPrice ? Number(product.compareAtPrice) : undefined;

      if (existingIndex >= 0) {
        db.products[existingIndex] = {
          ...db.products[existingIndex],
          ...product,
          price: Number(product.price) || 0,
        };
        if (hasCompareAtPrice) {
          db.products[existingIndex].compareAtPrice = parsedCompareAtPrice;
        } else {
          delete db.products[existingIndex].compareAtPrice;
        }
      } else {
        if (!product.id) product.id = 'vtx-' + Date.now().toString(36);
        if (!product.slug) product.slug = (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (hasCompareAtPrice) {
          product.compareAtPrice = parsedCompareAtPrice;
        } else {
          delete product.compareAtPrice;
        }
        db.products.unshift(product);
      }

      writeStoreDb(db);

      // Persist directly into Supabase products table
      if (supabaseServer) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id || '');
          let existingSupa: any = null;

          if (isUuid) {
            const res = await supabaseServer.from('products').select('*').eq('id', product.id).maybeSingle();
            existingSupa = res.data;
          }

          if (!existingSupa && product.supaId) {
            const res = await supabaseServer.from('products').select('*').eq('id', product.supaId).maybeSingle();
            existingSupa = res.data;
          }

          if (!existingSupa && product.slug) {
            const res = await supabaseServer.from('products').select('*').eq('slug', product.slug).maybeSingle();
            existingSupa = res.data;
          }

          if (!existingSupa && product.name) {
            const res = await supabaseServer.from('products').select('*').eq('name', product.name).maybeSingle();
            existingSupa = res.data;
          }

          if (!existingSupa && product.name) {
            const firstWord = product.name.trim().split(' ')[0];
            if (firstWord && firstWord.length > 2) {
              const res = await supabaseServer.from('products').select('*').ilike('name', `%${firstWord}%`).limit(1);
              if (res.data && res.data.length > 0) existingSupa = res.data[0];
            }
          }

          let existingMeta: any = {};
          if (existingSupa && typeof existingSupa.description === 'string' && existingSupa.description.startsWith('{')) {
            try { existingMeta = JSON.parse(existingSupa.description); } catch(e) {}
          }

          const meta: any = {
            ...existingMeta,
            id: product.id || existingMeta.id || 'vtx-' + Date.now().toString(36),
            refCode: product.refCode || existingMeta.refCode || product.slug,
            description: product.description !== undefined ? product.description : (existingMeta.description || ''),
            badge: product.badge !== undefined ? product.badge : (existingMeta.badge || ''),
            rating: product.rating ?? existingMeta.rating ?? 5.0,
            reviewCount: product.reviewCount ?? existingMeta.reviewCount ?? 12,
            fit: product.fit || existingMeta.fit || 'Regular Fit',
            fabric: product.fabric || existingMeta.fabric || '',
            composition: product.composition || existingMeta.composition || '',
            care: product.care || existingMeta.care || '',
            sizes: product.sizes || existingMeta.sizes || ['S', 'M', 'L', 'XL'],
            colors: product.colors || existingMeta.colors || [],
            images: product.images || existingMeta.images || [],
            features: product.features || existingMeta.features || [],
          };

          if (product.image) meta.image = product.image;
          if (product.hoverImage) meta.hoverImage = product.hoverImage;
          if (product.leftShoulderImage) meta.leftShoulderImage = product.leftShoulderImage;
          if (product.rightShoulderImage) meta.rightShoulderImage = product.rightShoulderImage;
          if (product.gallery) meta.gallery = product.gallery;
          if (product.printLayers) meta.printLayers = product.printLayers;

          if (hasCompareAtPrice) {
            meta.compareAtPrice = parsedCompareAtPrice;
          } else {
            delete meta.compareAtPrice;
          }

          if (existingSupa) {
            const updateRes = await supabaseServer.from('products').update({
              name: product.name,
              price: Number(product.price) || 0,
              category: product.category || existingSupa.category || 'koynek',
              gender: product.gender || existingSupa.gender || 'unisex',
              in_stock: product.inStock ?? existingSupa.in_stock ?? true,
              description: JSON.stringify(meta),
            }).eq('id', existingSupa.id);

            if (updateRes.error) {
              console.error('[AdminAPI] Supabase product update error:', updateRes.error);
              return NextResponse.json({ success: false, error: 'Supabase update xətası: ' + updateRes.error.message }, { status: 500 });
            }
          } else {
            const insertRes = await supabaseServer.from('products').insert({
              slug: product.slug,
              name: product.name,
              price: Number(product.price) || 0,
              category: product.category || 'koynek',
              gender: product.gender || 'unisex',
              is_new: product.isNew ?? false,
              in_stock: product.inStock ?? true,
              description: JSON.stringify(meta),
            });

            if (insertRes.error) {
              console.error('[AdminAPI] Supabase product insert error:', insertRes.error);
              return NextResponse.json({ success: false, error: 'Supabase insert xətası: ' + insertRes.error.message }, { status: 500 });
            }
          }
        } catch (e: any) {
          console.warn('[AdminAPI] Supabase product upsert error:', e);
          return NextResponse.json({ success: false, error: 'Supabase əlaqə xətası: ' + (e?.message || 'Naməlum') }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, product });
    }

    // 1.1 Direct Image / Garment Upload with Automatic Print Layer Extraction
    if (route === 'upload' || route === 'upload-image') {
      try {
        let buffer: Buffer | null = null;
        let originalName = 'garment.png';

        if (formData) {
          const file = formData.get('file') as File | null;
          if (file) {
            originalName = file.name || 'garment.png';
            buffer = Buffer.from(await file.arrayBuffer());
          }
        } else if (body.dataUrl) {
          const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches[2]) {
            buffer = Buffer.from(matches[2], 'base64');
          }
        }

        if (!buffer) {
          return NextResponse.json({ error: 'Fayl tapılmadı. Kompyuterdən şəkil seçin.' }, { status: 400 });
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const cleanBase = originalName.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/\.[^/.]+$/, '').slice(0, 30);
        const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const mainFileName = `${cleanBase}_${uniqueSuffix}.png`;
        const mainFilePath = path.join(uploadsDir, mainFileName);

        // Save high quality PNG locally (fallback or dev)
        await sharp(buffer).png({ quality: 95 }).toFile(mainFilePath).catch((err) => {
          console.warn('[Upload local file write skipped/warning]:', err?.message);
        });
        const mainUrl = `/images/uploads/${mainFileName}`;

        // AUTOMATIC MOCKUP / PRINT DESIGN EXTRACTION
        let printLayerUrl = '';
        try {
          const meta = await sharp(buffer).metadata();
          if (meta.width && meta.height && meta.width > 100 && meta.height > 100) {
            const cropW = Math.round(meta.width * 0.54);
            const cropH = Math.round(meta.height * 0.52);
            const cropL = Math.max(0, Math.round((meta.width - cropW) / 2));
            const cropT = Math.max(0, Math.round(meta.height * 0.26));

            const printFileName = `${cleanBase}_print_layer_${uniqueSuffix}.png`;
            const printFilePath = path.join(uploadsDir, printFileName);

            const printBuffer = await sharp(buffer)
              .extract({ left: cropL, top: cropT, width: cropW, height: cropH })
              .png({ quality: 95 })
              .toBuffer();

            await sharp(printBuffer).toFile(printFilePath).catch(() => null);

            if (supabaseServer) {
              const { error: supaPrintErr } = await supabaseServer.storage
                .from('product-images')
                .upload(`prints/${printFileName}`, printBuffer, {
                  contentType: 'image/png',
                  upsert: true,
                });
              if (!supaPrintErr) {
                const { data: supaPrintData } = supabaseServer.storage
                  .from('product-images')
                  .getPublicUrl(`prints/${printFileName}`);
                if (supaPrintData?.publicUrl) {
                  printLayerUrl = supaPrintData.publicUrl;
                }
              }
            }
            if (!printLayerUrl) {
              printLayerUrl = `/images/uploads/${printFileName}`;
            }
          }
        } catch (extractErr) {
          console.warn('[Upload] Print extraction skipped:', extractErr);
        }

        // Upload main image to Supabase Storage (cloud CDN) for persistent serverless hosting
        let finalMainUrl = mainUrl;
        if (supabaseServer) {
          try {
            const optimizedBuffer = await sharp(buffer).png({ quality: 95 }).toBuffer();
            const { error: supaErr } = await supabaseServer.storage
              .from('product-images')
              .upload(`products/${mainFileName}`, optimizedBuffer, {
                contentType: 'image/png',
                upsert: true,
              });

            if (!supaErr) {
              const { data: supaData } = supabaseServer.storage
                .from('product-images')
                .getPublicUrl(`products/${mainFileName}`);
              if (supaData?.publicUrl) {
                finalMainUrl = supaData.publicUrl;
              }
            } else {
              console.warn('[Upload Supabase Storage Warning]:', supaErr.message);
            }
          } catch (supaUploadEx: any) {
            console.warn('[Upload Supabase Exception]:', supaUploadEx.message);
          }
        }

        return NextResponse.json({
          success: true,
          url: finalMainUrl,
          printLayerUrl: printLayerUrl || finalMainUrl,
          filename: mainFileName,
        });
      } catch (uploadErr: any) {
        console.error('[Upload API Error]:', uploadErr);
        return NextResponse.json({ error: 'Yükləmə xətası: ' + uploadErr.message }, { status: 500 });
      }
    }

    // 2. Update Dynamic CMS Content & Settings
    if (route === 'content') {
      const { settings, content } = body;
      if (settings) db.settings = { ...db.settings, ...settings };
      if (content) db.content = { ...db.content, ...content };
      writeStoreDb(db);

      if (supabaseServer) {
        try {
          const configPayload = { content: db.content, settings: db.settings };
          await supabaseServer.storage
            .from('product-images')
            .upload('config/store_config.json', Buffer.from(JSON.stringify(configPayload, null, 2)), {
              contentType: 'application/json',
              upsert: true,
            });
        } catch (confErr: any) {
          console.warn('[AdminAPI] Failed to persist config to Supabase storage:', confErr.message);
        }
      }

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
      const cleanCode = (promo.code || '').trim().toUpperCase();
      promo.code = cleanCode;

      const index = db.promoCodes.findIndex((p: any) => p.id === promo.id || (p.code || '').toUpperCase() === cleanCode);
      if (index >= 0) {
        db.promoCodes[index] = { ...db.promoCodes[index], ...promo };
      } else {
        promo.id = promo.id || 'promo-' + Date.now();
        db.promoCodes.unshift(promo);
      }
      writeStoreDb(db);

      if (supabaseServer) {
        try {
          await supabaseServer.storage
            .from('product-images')
            .upload('config/promos.json', Buffer.from(JSON.stringify(db.promoCodes, null, 2)), {
              contentType: 'application/json',
              upsert: true,
            });
        } catch (supaPromoErr: any) {
          console.warn('[AdminAPI] Failed to persist promo to Supabase storage:', supaPromoErr.message);
        }
      }

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
      db.products = db.products.filter((p: any) => p.id !== id && p.slug !== id);
      writeStoreDb(db);

      if (supabaseServer) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
          if (isUuid) {
            await supabaseServer.from('products').delete().eq('id', id);
          } else {
            await supabaseServer.from('products').delete().eq('slug', id);
          }
        } catch (e) {
          console.warn('[AdminAPI] Supabase product delete error:', e);
        }
      }

      return NextResponse.json({ success: true });
    }

    // 2. Delete Order or Clear Test Orders
    if (route === 'orders' && id === 'clear-test') {
      const testIds = new Set(
        (db.orders || [])
          .filter((o: any) => o.isTest === true || o.paymentStatus === 'test_paid')
          .map((o: any) => String(o.id))
      );
      const count = testIds.size;
      db.orders = (db.orders || []).filter((o: any) => !testIds.has(String(o.id)));
      db.podOrders = (db.podOrders || []).filter((p: any) => !testIds.has(String(p.orderId)));
      writeStoreDb(db);

      if (supabaseServer) {
        try {
          await supabaseServer.from('orders').delete().or('is_test.eq.true,payment_status.eq.test_paid');
        } catch (e) {
          console.warn('Supabase clear test warning:', e);
        }
      }

      return NextResponse.json({ success: true, count, message: `${count} test sifarişi silindi.` });
    }

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

      if (supabaseServer) {
        try {
          await supabaseServer.storage
            .from('product-images')
            .upload('config/promos.json', Buffer.from(JSON.stringify(db.promoCodes, null, 2)), {
              contentType: 'application/json',
              upsert: true,
            });
        } catch (supaPromoErr: any) {
          console.warn('[AdminAPI] Failed to update promo delete in Supabase storage:', supaPromoErr.message);
        }
      }

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
