"use client";

import React from "react";
import Link from "next/link";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  href?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Pill({
  active = false,
  href,
  icon,
  className = "",
  children,
  ...props
}: PillProps) {
  const baseClass = "inline-flex items-center gap-1.5 rounded-full text-sm transition-all duration-200 select-none whitespace-nowrap active:scale-95 cursor-pointer";
  
  const stateClass = active
    ? "bg-white text-black font-semibold px-5 py-2 shadow-sm"
    : "bg-black/40 text-white/85 hover:text-white border border-white/15 px-4 py-2 font-medium backdrop-blur-md hover:bg-black/60";

  const combinedClass = `${baseClass} ${stateClass} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClass}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type="button" className={combinedClass} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
