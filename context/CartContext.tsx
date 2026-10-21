"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { OrderItemType } from "@/lib/payments/types";
import { playAddToCartSound } from "@/lib/soundEffects";

export interface CartItem {
  id: string; // unique item id: e.g. prod_slug_size_color or custom_id
  productId: string;
  name: string;
  price: number;
  quantity: number;
  type: OrderItemType; // 'ready' or 'custom'
  size: string;
  color: string;
  image: string;
  stockQuantity?: number;
  customDesignId?: string;
  customDesignPreview?: string;
  customData?: any;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalCount: number;
  totalPrice: number;
  hasCustomItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "atelier_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage safely on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items, isHydrated]);

  const addItem = (newItem: Omit<CartItem, "quantity">, qty: number = 1) => {
    try {
      playAddToCartSound();
    } catch (e) {
      // AudioContext fallback
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === newItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const maxStock = updated[existingIndex].stockQuantity || 99;
        const newQty = Math.min(maxStock, updated[existingIndex].quantity + qty);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }
      return [...prev, { ...newItem, quantity: qty }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const maxStock = item.stockQuantity || 99;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(maxStock, newQty),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasCustomItems = items.some((item) => item.type === "custom");

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        totalCount,
        totalPrice,
        hasCustomItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
