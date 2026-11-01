import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreProduct } from '@/lib/storeDb';
import { supabaseServer } from '@/lib/supabaseServer';

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

    if (supabaseServer) {
      try {
        const { data: supaProducts, error } = await supabaseServer
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && supaProducts && supaProducts.length > 0) {
          products = supaProducts.map((sp: any) => {
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
      } catch (e) {
        console.warn('[Store Products API] Supabase fetch error:', e);
      }
    }

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
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.category && p.category.toLowerCase().includes(search)) ||
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
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
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
    const existingIndex = db.products.findIndex(
      (p) => p.id === product.id || (product.slug && p.slug === product.slug)
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
      if (!product.id) {
        product.id = 'vtx-' + Date.now().toString(36);
      }
      if (!product.slug) {
        product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      if (hasCompareAtPrice) {
        product.compareAtPrice = parsedCompareAtPrice;
      } else {
        delete product.compareAtPrice;
      }
      db.products.unshift(product);
    }

    writeStoreDb(db);

    if (supabaseServer) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id || '');
        let existingSupa: any = null;

        if (isUuid) {
          const res = await supabaseServer.from('products').select('*').eq('id', product.id).maybeSingle();
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
          images: (product as any).images || existingMeta.images || [],
          features: (product as any).features || existingMeta.features || [],
        };

        if (hasCompareAtPrice) {
          meta.compareAtPrice = parsedCompareAtPrice;
        } else {
          delete meta.compareAtPrice;
        }

        if (existingSupa) {
          await supabaseServer.from('products').update({
            name: product.name,
            price: Number(product.price) || 0,
            category: product.category || existingSupa.category || 'koynek',
            gender: product.gender || existingSupa.gender || 'unisex',
            in_stock: product.inStock ?? existingSupa.in_stock ?? true,
            description: JSON.stringify(meta),
          }).eq('id', existingSupa.id);
        } else {
          await supabaseServer.from('products').insert({
            slug: product.slug,
            name: product.name,
            price: Number(product.price) || 0,
            category: product.category || 'koynek',
            gender: product.gender || 'unisex',
            is_new: (product as any).isNew ?? false,
            in_stock: product.inStock ?? true,
            description: JSON.stringify(meta),
          });
        }
      } catch (e) {
        console.warn('[Products API] Supabase upsert error:', e);
      }
    }

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

    if (supabaseServer) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          await supabaseServer.from('products').delete().eq('id', id);
        } else {
          await supabaseServer.from('products').delete().eq('slug', id);
        }
      } catch (e) {
        console.warn('[Products API] Supabase delete error:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Məhsul silindi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
