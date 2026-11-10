"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();

  // The admin panel has a fixed sidebar and sticky bars; a transformed wrapper
  // would turn them into scrolling elements, so it gets no page transition.
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      style={{ willChange: "transform, opacity" }}
      className="flex-grow flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
}
