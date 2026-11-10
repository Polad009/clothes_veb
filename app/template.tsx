"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Soft fade between pages. Opacity only: a transform here would turn sticky
 * and fixed children (filter drawer, buy panel) into scrolling elements.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;
  return <div className="hw-fade flex w-full flex-grow flex-col">{children}</div>;
}
