import { BASE_URL, getMediaUrl } from "@/api/client";

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
  const response = await fetch(
    `${BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error("Failed to search products");
  const products = await response.json();
  return products.map((p) => ({ ...p, image: getMediaUrl(p.image) }));
}