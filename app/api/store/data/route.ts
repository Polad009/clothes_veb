import { NextResponse } from 'next/server';
import { readStoreDb } from '@/lib/storeDb';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

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
          data.products = supaProducts.map((sp: any) => {
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
              colors: meta.colors || [],
              sizes: meta.sizes && meta.sizes.length > 0 ? meta.sizes : ['S', 'M', 'L', 'XL'],
              features: meta.features || [],
            };
          });
        }
      } catch (err) {
        console.warn('[StoreData] Supabase products fetch error:', err);
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
        products: data.products || [],
        content: data.content || {},
        settings: data.settings || {},
        promoCodes: sanitizedPromoCodes,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
