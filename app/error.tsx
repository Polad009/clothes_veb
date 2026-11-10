"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Horwalle store error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center bg-ink px-4 text-center font-grotesk text-bone">
      <h1 className="text-4xl font-black uppercase tracking-tight [font-stretch:112%] sm:text-6xl">Xəta baş verdi</h1>
      <p className="mt-4 max-w-md text-[14px] text-bone-dim">
        Səhifə yüklənmədi. Yenidən cəhd edin, problem qalsa bizə WhatsApp-da yazın.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-bone px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white"
        >
          Yenidən cəhd et
        </button>
        <Link href="/" className="rounded-full border border-white/25 px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] hover:border-bone">
          Ana səhifə
        </Link>
      </div>
    </div>
  );
}
