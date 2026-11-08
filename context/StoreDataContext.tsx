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

    const candidateList = Array.isArray(c.gallery) && c.gallery.length > 0 ? c.gallery : [];
    const allCandidates = [c.image, validHover, c.leftShoulderImage, c.rightShoulderImage, ...candidateList];
    const gallery = allCandidates.filter((img: any, idx: number, arr: any[]) => 
      img && typeof img === 'string' && img.trim() !== '' && arr.indexOf(img) === idx
    );

    return {
      name: c.name || "Standart",
      hex: c.hex || "#111111",
      image: c.image || p.image || "/images/hero/lookbook.webp",
      hoverImage: validHover || p.hoverImage,
      leftShoulderImage: c.leftShoulderImage || p.leftShoulderImage,
      rightShoulderImage: c.rightShoulderImage || p.rightShoulderImage,
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
    internationalPrice: p.internationalPrice != null && p.internationalPrice !== '' ? Number(p.internationalPrice) : undefined,
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
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("hv_live_products_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(normalizeProduct);
          }
        }
      } catch (e) {}
    }
    return MOCK_PRODUCTS;
  });
  const [content, setContent] = useState<any>(storeDataDefault.content);
  const [settings, setSettings] = useState<any>(storeDataDefault.settings);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLiveStoreData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/store/data?_nocache=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        const normalized = data.products.map(normalizeProduct);
        setProducts(normalized);
        try {
          localStorage.setItem("hv_live_products_cache", JSON.stringify(normalized));
        } catch (e) {}
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

    // Auto-refresh when tab gains focus, becomes visible, or when admin saves across tabs
    const onRefresh = () => fetchLiveStoreData();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchLiveStoreData();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "hv_store_updated" || e.key === "hv_last_sync" || e.key === "hv_live_products_cache") {
        fetchLiveStoreData();
      }
    };
    const onWindowMessage = (event: MessageEvent) => {
      if (
        event.data === "hv-store-refresh" ||
        event.data?.type === "hv-store-refresh" ||
        event.data?.type === "DATA_UPDATED"
      ) {
        fetchLiveStoreData();
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("horwalle_store_sync");
        bc.onmessage = (event) => {
          if (
            event.data &&
            (event.data.type === "DATA_UPDATED" ||
              event.data.type === "PRODUCT_MUTATED" ||
              event.data.type === "ORDER_PLACED" ||
              event.data.type === "REFRESH")
          ) {
            fetchLiveStoreData();
          }
        };
      } catch (e) {}
    }

    window.addEventListener("focus", onRefresh);
    window.addEventListener("hv-store-refresh", onRefresh);
    window.addEventListener("message", onWindowMessage);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Periodic live sync every 15 seconds to ensure any admin price updates reflect instantly
    const interval = setInterval(fetchLiveStoreData, 15000);

    return () => {
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener("hv-store-refresh", onRefresh);
      window.removeEventListener("message", onWindowMessage);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (bc) {
        try {
          bc.close();
        } catch (e) {}
      }
      clearInterval(interval);
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
