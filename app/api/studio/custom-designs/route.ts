import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productSlug, color, size, designJson, previewUrl } = body;

    if (!productSlug || !designJson) {
      return NextResponse.json(
        { success: false, message: "Dizayn məlumatları natamamdır." },
        { status: 400 }
      );
    }

    const designId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // In production with Supabase configured, insert into custom_designs table
    // For now return generated design ID and URL
    return NextResponse.json({
      success: true,
      designId,
      previewUrl: previewUrl || null,
      message: "Fərdi dizayn uğurla yadda saxlanıldı.",
    });
  } catch (error: any) {
    console.error("Custom design save error:", error);
    return NextResponse.json(
      { success: false, message: "Dizaynı yadda saxlamaq mümkün olmadı." },
      { status: 500 }
    );
  }
}
