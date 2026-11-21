import { apiFetch, BASE_URL, getMediaUrl } from "@/api/client";
import type { Product } from "@/lib/products";

export interface CartItemResponse {
  product_id: string;
  quantity: number;
  product: Product;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export class CartApiError extends Error {
  constructor(public code: "insufficient_stock") {
    super(code);
    this.name = "CartApiError";
  }
}

const cartUrl = `${BASE_URL}/api/cart/`;

async function ensureOk(response: Response, message: string): Promise<void> {
  if (response.ok) return;

  const body = await response.json().catch(() => null) as { detail?: unknown } | null;
  if (body?.detail === "Requested quantity exceeds available stock") {
    throw new CartApiError("insufficient_stock");
  }

  throw new Error(message);
}

export async function fetchCart(): Promise<CartItem[]> {
  const response = await apiFetch(cartUrl);
  await ensureOk(response, "Failed to fetch cart");
  const items = (await response.json()) as CartItemResponse[];

  return items.map(({ product_id, quantity, product }) => ({
    productId: product_id,
    quantity,
    product: {
      ...product,
      id: product_id,
      image: /^https?:\/\//i.test(product.image)
        ? product.image
        : getMediaUrl(product.image.replace(/^\//, "")),
    },
  }));
}

export async function addCartItem(productId: string, quantity = 1): Promise<void> {
  const response = await apiFetch(`${cartUrl}${encodeURIComponent(productId)}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
  await ensureOk(response, "Failed to add item to cart");
}

export async function updateCartItem(productId: string, quantity: number): Promise<void> {
  const response = await apiFetch(`${cartUrl}${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  await ensureOk(response, "Failed to update cart item");
}

export async function removeCartItem(productId: string): Promise<void> {
  const response = await apiFetch(`${cartUrl}${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
  await ensureOk(response, "Failed to remove cart item");
}