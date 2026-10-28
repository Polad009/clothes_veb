"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
