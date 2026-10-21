import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const maxDuration = 60; // Next.js route max duration

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json({ success: false, error: "Image is required" }, { status: 400 });
    }

    // 1. Try local fast AI Background Removal Server (http://127.0.0.1:5155/remove-bg)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const srvRes = await fetch("http://127.0.0.1:5155/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData && srvData.success && srvData.image) {
          return NextResponse.json({
            success: true,
            image: srvData.image,
            duration: srvData.duration,
            source: "local-daemon",
          });
        }
      }
    } catch {
      // Local daemon is not running: spawn it in the background so future requests are instant (<0.5s)
      try {
        const srvScript = path.join(process.cwd(), "scripts", "bg_server.py");
        const srvChild = spawn("python", [srvScript], {
          detached: true,
          stdio: "ignore",
        });
        srvChild.unref();
      } catch {}
    }

    // 2. Direct fallback via Python CLI
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const tempDir = os.tmpdir();
    const tempIn = path.join(tempDir, `rembg_in_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);
    const tempOut = path.join(tempDir, `rembg_out_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);

    await fs.promises.writeFile(tempIn, Buffer.from(base64Data, "base64"));

    const scriptPath = path.join(process.cwd(), "scripts", "bg_server.py");

    await new Promise<void>((resolve, reject) => {
      const child = spawn("python", [scriptPath, "--file", tempIn, tempOut]);

      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("close", (code) => {
        if (code === 0 && fs.existsSync(tempOut)) {
          resolve();
        } else {
          reject(new Error(`Python rembg failed with exit code ${code}: ${stderr}`));
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });

    const outBuf = await fs.promises.readFile(tempOut);
    const cleanedBase64 = `data:image/png;base64,${outBuf.toString("base64")}`;

    // Clean up temp files silently
    try {
      await fs.promises.unlink(tempIn);
      await fs.promises.unlink(tempOut);
    } catch {}

    return NextResponse.json({
      success: true,
      image: cleanedBase64,
      source: "python-cli",
    });
  } catch (error: any) {
    console.error("[API remove-bg] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to remove background" },
      { status: 500 }
    );
  }
}
