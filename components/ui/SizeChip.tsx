"use client";

import React from "react";

export interface SizeChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size: string;
  active?: boolean;
}

export function SizeChip({
  size,
  active = false,
  className = "",
  disabled = false,
  ...props
}: SizeChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Ölçü ${size}`}
      aria-pressed={active}
      className={`w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-full text-xs flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 select-none ${
        disabled
          ? "opacity-35 cursor-not-allowed bg-black/40 text-white/50 border border-white/10"
          : active
          ? "bg-white text-black font-extrabold shadow-lg"
          : "bg-black/85 text-white font-semibold hover:bg-black border border-white/10"
      } ${className}`.trim()}
      {...props}
    >
      {size}
    </button>
  );
}
