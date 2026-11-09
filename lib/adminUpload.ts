import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Stores an uploaded product image (Supabase Storage in production, the local
 * uploads folder as a development fallback) and extracts its print layer.
 */
export async function handleAdminUpload(formData: FormData | null, body: any): Promise<NextResponse> {
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
    // Store original pristine binary buffer directly without lossy compression or resizing
    let finalMainUrl = mainUrl;
    if (supabaseServer) {
      try {
        const mimeType = originalName.toLowerCase().endsWith('.png')
          ? 'image/png'
          : originalName.toLowerCase().endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg';

        const { error: supaErr } = await supabaseServer.storage
          .from('product-images')
          .upload(`products/${mainFileName}`, buffer, {
            contentType: mimeType,
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
