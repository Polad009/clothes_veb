import React from "react";

export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF7F2] text-stone-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-[#B08D57] animate-spin" />
        <span className="text-[10px] font-semibold tracking-[0.25em] text-stone-500 uppercase font-mono">
          HORVVALLE · YÜKLƏNİR
        </span>
      </div>
    </div>
  );
}
