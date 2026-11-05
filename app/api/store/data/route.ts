import { NextResponse } from 'next/server';
import { readStoreDb } from '@/lib/storeDb';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const data = readStoreDb();

    // Fetch live products from Supabase database so admin price/product updates persist permanently
    if (supabaseServer) {
      try {
        const { data: supaProducts, error } = await supabaseServer
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && supaProducts && supaProducts.length > 0) {
          const liveMapped = supaProducts.map((sp: any) => {
            let meta: any = {};
            try {
              if (typeof sp.description === 'string' && sp.description.startsWith('{')) {
                meta = JSON.parse(sp.description);
              }
            } catch (e) {}

            const resolvedImage = meta.image || meta.colors?.[0]?.image || meta.images?.[0] || sp.image || '/images/hero/black-tee.jpg';
            const resolvedImages = (meta.images && meta.images.length > 0) ? meta.images : [resolvedImage];

            return {
              id: meta.id || sp.id,
              supaId: sp.id,
              slug: sp.slug,
              name: sp.name,
              refCode: meta.refCode || sp.slug,
              price: Number(sp.price),
              internationalPrice: meta.internationalPrice != null && meta.internationalPrice !== '' ? Number(meta.internationalPrice) : (sp.international_price != null ? Number(sp.international_price) : undefined),
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
              colors: meta.colors || [],
              sizes: meta.sizes && meta.sizes.length > 0 ? meta.sizes : ['S', 'M', 'L', 'XL'],
              features: meta.features || [],
              printLayers: meta.printLayers || [],
            };
          });

          // Live Supabase products always take 100% precedence for live prices & data
          const mergedProducts = [...liveMapped];
          // Keep any local-only products if not in Supabase yet
          (data.products || []).forEach((lp: any) => {
            if (!mergedProducts.some(mp => mp.slug === lp.slug || mp.id === lp.id)) {
              mergedProducts.push(lp);
            }
          });
          data.products = mergedProducts;
        }
      } catch (err) {
        console.warn('[StoreData] Supabase products fetch error:', err);
      }
    }

    // 2. Fetch live promo codes from Supabase cloud storage (persistent across serverless instances)
    if (supabaseServer) {
      try {
        const { data: promoFile, error: promoErr } = await supabaseServer.storage
          .from('product-images')
          .download('config/promos.json');

        if (!promoErr && promoFile) {
          const promoText = await promoFile.text();
          const cloudPromos = JSON.parse(promoText);
          if (Array.isArray(cloudPromos)) {
            data.promoCodes = cloudPromos;
          }
        }
      } catch (promoSyncErr) {
        console.warn('[StoreData] Promo cloud sync warning:', promoSyncErr);
      }
    }

    // 3. Fetch live CMS content & settings from Supabase cloud storage
    if (supabaseServer) {
      try {
        const { data: configFile, error: configErr } = await supabaseServer.storage
          .from('product-images')
          .download('config/store_config.json');

        if (!configErr && configFile) {
          const configText = await configFile.text();
          const cloudConfig = JSON.parse(configText);
          if (cloudConfig?.content) data.content = { ...data.content, ...cloudConfig.content };
          if (cloudConfig?.settings) data.settings = { ...data.settings, ...cloudConfig.settings };
        }
      } catch (configSyncErr) {
        console.warn('[StoreData] Config cloud sync warning:', configSyncErr);
      }
    }

    // SECURE SANITIZATION: Never leak customer orders or pod orders to public requests!
    const sanitizedPromoCodes = (data.promoCodes || []).map((p: any) => ({
      code: p.code,
      type: p.type,
      value: p.value,
      minAmount: p.minAmount,
      active: p.active,
      desc: p.desc,
    }));

    return NextResponse.json(
      {
        version: "v2026.11.02.live",
        products: data.products || [],
        content: data.content || {},
        settings: data.settings || {},
        promoCodes: sanitizedPromoCodes,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
