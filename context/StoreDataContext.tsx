"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, MOCK_PRODUCTS } from "@/data/products";
import storeDataDefault from "@/data/storeData.json";

export function normalizeProduct(p: any): Product {
  const colors = (p.colors || []).map((c: any) => {
    const hasDistinctHover = Boolean(
      c.hoverImage &&
      typeof c.hoverImage === 'string' &&
      c.hoverImage.trim() !== '' &&
      c.hoverImage !== c.image
    );
    const validHover = hasDistinctHover ? c.hoverImage : undefined;

    let gallery: string[] = [];
    if (c.gallery && Array.isArray(c.gallery) && c.gallery.length > 0) {
      gallery = c.gallery.filter((img: string, idx: number, arr: string[]) => img && typeof img === 'string' && arr.indexOf(img) === idx);
    } else {
      gallery = [c.image];
      if (validHover && !gallery.includes(validHover)) gallery.push(validHover);
      if (c.leftShoulderImage && !gallery.includes(c.leftShoulderImage)) gallery.push(c.leftShoulderImage);
      if (c.rightShoulderImage && !gallery.includes(c.rightShoulderImage)) gallery.push(c.rightShoulderImage);
    }

    return {
      name: c.name || "Standart",
      hex: c.hex || "#111111",
      image: c.image || p.image || "/images/hero/lookbook.webp",
      hoverImage: validHover || p.hoverImage,
      leftShoulderImage: c.leftShoulderImage,
      rightShoulderImage: c.rightShoulderImage,
      gallery: gallery.length > 0 ? gallery : [p.image || "/images/hero/lookbook.webp"],
    };
  });

  const finalColors = colors.length > 0 ? colors : [{
    name: "Standart",
    hex: "#111111",
    image: p.image || "/images/hero/lookbook.webp",
    hoverImage: p.hoverImage,
    gallery: p.gallery || [p.image || "/images/hero/lookbook.webp"]
  }];

  return {
    id: p.id || p.slug,
    slug: p.slug || p.id,
    name: p.name || "Məhsul",
    refCode: p.refCode || "",
    description: p.description || "",
    price: Number(p.price) || 0,
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    badge: p.badge || undefined,
    category: p.category || "koynek",
    gender: p.gender || "unisex",
    rating: p.rating || 5,
    reviewCount: p.reviewCount || p.reviewsCount || 1,
    composition: p.composition || p.material || "100% Pambıq",
    fit: p.fit || "Regular Fit",
    care: p.care || "30°C dərəcədə tərsinə çevirərək yuyun.",
    inStock: p.inStock !== undefined ? p.inStock : true,
    sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ["S", "M", "L", "XL"],
    colors: finalColors,
  };
}

interface StoreDataContextType {
  products: Product[];
  content: any;
  settings: any;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const StoreDataContext = createContext<StoreDataContextType>({
  products: MOCK_PRODUCTS,
  content: storeDataDefault.content,
  settings: storeDataDefault.settings,
  isLoading: false,
  refresh: async () => {},
});

export function StoreDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [content, setContent] = useState<any>(storeDataDefault.content);
  const [settings, setSettings] = useState<any>(storeDataDefault.settings);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLiveStoreData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/store/data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.products && Array.isArray(data.products)) {
        const normalized = data.products.map(normalizeProduct);
        setProducts(normalized);
      }
      if (data.content) setContent(data.content);
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      console.warn("Could not fetch live store data, using fallback:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveStoreData();

    // Auto-refresh when tab gains focus (e.g. user made changes in admin portal and clicked back)
    const onFocus = () => fetchLiveStoreData();
    window.addEventListener("focus", onFocus);
    window.addEventListener("hv-store-refresh", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("hv-store-refresh", onFocus);
    };
  }, [fetchLiveStoreData]);

  return (
    <StoreDataContext.Provider value={{ products, content, settings, isLoading, refresh: fetchLiveStoreData }}>
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  return useContext(StoreDataContext);
}
