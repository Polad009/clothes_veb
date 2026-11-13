"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/components/store/i18n";

const P = {
  open: { az: "Kamera ilə oxut", en: "Scan with camera", ru: "Сканировать камерой", tr: "Kamerayla tara" },
  close: { az: "Bağla", en: "Close", ru: "Закрыть", tr: "Kapat" },
  hint: {
    az: "QR kodu çərçivənin içinə gətirin",
    en: "Hold the QR code inside the frame",
    ru: "Наведите камеру на QR-код",
    tr: "QR kodu çerçevenin içine getirin",
  },
  denied: {
    az: "Kameraya icazə verilmədi. Brauzer ayarlarından icazə verin və ya kodu əl ilə yazın.",
    en: "Camera access was blocked. Allow it in your browser settings or type the code.",
    ru: "Доступ к камере запрещён. Разрешите его в настройках браузера или введите код вручную.",
    tr: "Kamera izni verilmedi. Tarayıcı ayarlarından izin verin veya kodu elle yazın.",
  },
  unsupported: {
    az: "Bu brauzerdə kamera açılmır. Telefonun kamerası ilə QR-ı oxudun və ya kodu əl ilə yazın.",
    en: "The camera cannot be opened in this browser. Scan the QR with your phone camera or type the code.",
    ru: "В этом браузере камера недоступна. Отсканируйте QR камерой телефона или введите код.",
    tr: "Bu tarayıcıda kamera açılamıyor. QR'ı telefon kamerasıyla okutun veya kodu elle yazın.",
  },
  foreign: {
    az: "Bu QR Horwalle orijinallıq kodu deyil.",
    en: "This QR is not a Horwalle authenticity code.",
    ru: "Этот QR не является кодом подлинности Horwalle.",
    tr: "Bu QR bir Horwalle orijinallik kodu değil.",
  },
};

/** Our code from a scanned text: the full verify URL or the bare 26-character code. */
export function codeFromScan(text: string): string | null {
  const t = String(text || "").trim();
  const fromUrl = /\/v\/([A-Za-z2-7]{26})(?:[/?#]|$)/i.exec(t);
  if (fromUrl) {
    try {
      const host = new URL(t).hostname.toLowerCase();
      if (host !== "horwalle.com" && !host.endsWith(".horwalle.com") && host !== "localhost") return null;
    } catch {
      return null;
    }
    return fromUrl[1].toUpperCase();
  }
  const bare = t.toUpperCase().replace(/[\s-]/g, "");
  return /^[A-Z2-7]{26}$/.test(bare) ? bare : null;
}

type Detector = (source: HTMLVideoElement, canvas: HTMLCanvasElement) => Promise<string | null>;

/** Native BarcodeDetector (Chrome/Android) when present, jsQR on canvas frames otherwise (iPhone Safari). */
async function makeDetector(): Promise<Detector> {
  const Native = (window as any).BarcodeDetector;
  if (Native) {
    try {
      const formats: string[] = await Native.getSupportedFormats();
      if (formats.includes("qr_code")) {
        const detector = new Native({ formats: ["qr_code"] });
        return async (video) => {
          const found = await detector.detect(video);
          return found[0]?.rawValue || null;
        };
      }
    } catch {}
  }
  const jsQR = (await import("jsqr")).default;
  return async (video, canvas) => {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    // decode a centred square at most 640px wide: fast enough on older phones
    const side = Math.min(w, h);
    const size = Math.min(side, 640);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
    const img = ctx.getImageData(0, 0, size, size);
    return jsQR(img.data, size, size, { inversionAttempts: "attemptBoth" })?.data || null;
  };
}

export function QrScanner({ onCode }: { onCode: (code: string) => void }) {
  const { language: lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [notOurs, setNotOurs] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(tr(lang, P.unsupported));
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (e: any) {
        setError(tr(lang, e?.name === "NotAllowedError" ? P.denied : P.unsupported));
        return;
      }
      if (stopped) return stream.getTracks().forEach((t) => t.stop());
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => {});
      const detect = await makeDetector();

      const tick = async () => {
        if (stopped) return;
        const text = await detect(video, canvasRef.current!).catch(() => null);
        if (stopped) return;
        if (text) {
          const code = codeFromScan(text);
          if (code) {
            if (navigator.vibrate) navigator.vibrate(60);
            stopped = true;
            setOpen(false);
            onCodeRef.current(code);
            return;
          }
          setNotOurs(true);
        }
        timer = setTimeout(tick, 180);
      };
      tick();
    })();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open, lang]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setError("");
          setNotOurs(false);
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-bone px-6 py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white"
      >
        <Camera className="h-5 w-5" aria-hidden /> {tr(lang, P.open)}
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-black">
      <div className="relative aspect-square w-full">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {!error && (
          <div className="pointer-events-none absolute inset-[18%] rounded-2xl border-2 border-bone/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" aria-hidden />
        )}
        {error && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-[14px] text-bone">{error}</p>}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={tr(lang, P.close)}
          className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-bone hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {!error && (
        <p className="px-4 py-3 text-center text-[13px] text-bone-dim" role="status">
          {notOurs ? tr(lang, P.foreign) : tr(lang, P.hint)}
        </p>
      )}
    </div>
  );
}
