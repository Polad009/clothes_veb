"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Horvvalle Global Error:", error);
  }, [error]);

  return (
    <html lang="az">
      <body className="min-h-screen bg-[#FAF7F2] text-[#1A1517] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-3">Xəta baş verdi</h2>
          <p className="text-stone-600 text-sm mb-6">
            Gözlənilməz xəta yarandı. Zəhmət olmasa yenidən cəhd edin.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold cursor-pointer"
          >
            Yenilə
          </button>
        </div>
      </body>
    </html>
  );
}
