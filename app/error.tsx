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
    console.error("Horvvalle Store Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-[#E6C280]/15 flex items-center justify-center mb-6">
        <span className="font-eb-garamond text-2xl text-[#B08D57]">H</span>
      </div>
      <h2 className="font-eb-garamond text-2xl sm:text-3xl text-[#1A1517] mb-2 font-normal">
        Xəta baş verdi
      </h2>
      <p className="text-stone-500 text-sm max-w-md mb-6 font-sans">
        Gözlənilməz texniki nasazlıq yarandı. Zəhmət olmasa yenidən cəhd edin və ya ana səhifəyə qayıdın.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-full bg-[#1A1517] text-white text-xs font-semibold hover:bg-black transition cursor-pointer"
        >
          Yenidən cəhd et
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition"
        >
          Ana səhifə
        </Link>
      </div>
    </div>
  );
}
