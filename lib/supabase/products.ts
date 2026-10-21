import { Product, MOCK_PRODUCTS } from "@/data/products";

/**
 * Fetch all products with optional filters
 */
export async function getProducts(filters?: {
  category?: string;
  gender?: string;
  search?: string;
  sortBy?: string;
}): Promise<Product[]> {
  let products = [...MOCK_PRODUCTS];

  if (filters?.category && filters.category !== "all") {
    products = products.filter((p) => p.category === filters.category);
  }

  if (filters?.gender && filters.gender !== "all") {
    products = products.filter(
      (p) => p.gender === filters.gender || p.gender === "unisex"
    );
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (filters?.sortBy) {
    if (filters.sortBy === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    }
  }

  return products;
}

/**
 * Fetch single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
  return found || null;
}
