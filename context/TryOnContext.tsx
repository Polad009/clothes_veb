"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "@/data/products";

interface TryOnContextType {
  isOpen: boolean;
  isMinimized: boolean;
  product: Product | null;
  colorIndex: number;
  size: string;
  openTryOn: (product: Product, colorIndex?: number, size?: string) => void;
  closeTryOn: () => void;
  toggleMinimize: () => void;
  setColorIndex: (idx: number) => void;
  setSize: (size: string) => void;
}

const TryOnContext = createContext<TryOnContextType | undefined>(undefined);

export function TryOnProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState("L");

  const openTryOn = useCallback((prod: Product, cIndex: number = 0, initialSize?: string) => {
    setProduct(prod);
    setColorIndex(cIndex || 0);
    setSize(initialSize || (prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : "L"));
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeTryOn = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  return (
    <TryOnContext.Provider
      value={{
        isOpen,
        isMinimized,
        product,
        colorIndex,
        size,
        openTryOn,
        closeTryOn,
        toggleMinimize,
        setColorIndex,
        setSize,
      }}
    >
      {children}
    </TryOnContext.Provider>
  );
}

export function useTryOn() {
  const context = useContext(TryOnContext);
  if (!context) {
    throw new Error("useTryOn must be used within a TryOnProvider");
  }
  return context;
}
