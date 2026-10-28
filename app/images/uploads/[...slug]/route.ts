import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params?.slug || [];
    if (slug.length === 0) {
      return new NextResponse("File path required", { status: 400 });
    }

    // Sanitize each path segment to prevent directory traversal attacks
    const safeSegments = slug.map((segment) => path.basename(segment));
    const filePath = path.join(process.cwd(), "public", "images", "uploads", ...safeSegments);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse("Not a file", { status: 400 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[Upload Image Route Error]:", error?.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
