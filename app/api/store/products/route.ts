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

            return {
              id: meta.id || sp.id,
              slug: sp.slug,
              name: sp.name,
              refCode: meta.refCode || sp.slug,
              price: Number(sp.price),
              compareAtPrice: meta.compareAtPrice,
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
              images: meta.images || [],
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
      db.products[existingIndex] = { ...db.products[existingIndex], ...product };
    } else {
      if (!product.id) {
        product.id = 'vtx-' + Date.now().toString(36);
      }
      if (!product.slug) {
        product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      db.products.unshift(product);
    }

    writeStoreDb(db);

    if (supabaseServer) {
      try {
        const meta = {
          id: product.id,
          refCode: product.refCode,
          description: product.description,
          compareAtPrice: product.compareAtPrice,
          badge: product.badge,
          rating: product.rating,
          reviewCount: product.reviewCount,
          fit: product.fit,
          fabric: product.fabric,
          composition: product.composition,
          care: product.care,
          sizes: product.sizes,
          colors: product.colors,
          images: (product as any).images,
          features: (product as any).features,
        };

        const { data: existingSupa } = await supabaseServer
          .from('products')
          .select('id')
          .or(`slug.eq."${product.slug}",id.eq."${product.id}"`)
          .maybeSingle();

        const recordId = existingSupa?.id || product.id;

        await supabaseServer.from('products').upsert({
          id: recordId,
          slug: product.slug,
          name: product.name,
          price: Number(product.price) || 0,
          category: product.category || 'koynek',
          gender: product.gender || 'unisex',
          is_new: (product as any).isNew ?? false,
          in_stock: product.inStock ?? true,
          description: JSON.stringify(meta),
        });
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
        await supabaseServer.from('products').delete().or(`id.eq."${id}",slug.eq."${id}"`);
      } catch (e) {
        console.warn('[Products API] Supabase delete error:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Məhsul silindi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
