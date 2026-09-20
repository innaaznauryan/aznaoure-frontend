import { BASE_URL, apiFetch, getMediaUrl } from "@/api/client";

export async function fetchProducts() {
  const response = await fetch(`${BASE_URL}/api/products/`);
  if (!response.ok) throw new Error("Failed to fetch products");
  const products = await response.json();
  return products.map((p) => ({ ...p, image: getMediaUrl(p.image) }));
}

export async function fetchProductById(id: string) {
  const response = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!response.ok) throw new Error("Failed to fetch product");
  const product = await response.json();
  return { ...product, image: getMediaUrl(product.image) };
}

export async function searchProducts(query: string) {
  const response = await apiFetch(
      `${BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error("Failed to search products");
  const data = await response.json();
  return {
    results: data.results.map((p) => ({ ...p, image: getMediaUrl(p.image) })),
    semantic: data.semantic,
    semanticRemaining: data.semantic_remaining,
  };
}

export async function getSearchQuota() {
  const response = await apiFetch(`${BASE_URL}/api/products/search/quota`);
  if (!response.ok) throw new Error("Failed to fetch search quota");
  return await response.json() as Promise<{ remaining: number; limit: number }>;
}