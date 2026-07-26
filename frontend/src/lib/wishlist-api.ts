import { fetchApiForWishlist } from './api';

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sellingPrice: number;
    originalPrice?: number;
    stockQuantity?: number;
    condition: string;
    images: { url: string; altText?: string }[];
    category?: { name: string; slug: string };
  };
  createdAt: string;
}

export async function getWishlist(token: string): Promise<WishlistItem[]> {
  return fetchApiForWishlist<WishlistItem[]>('/wishlist', { token });
}

export async function checkWishlist(productId: string, token: string): Promise<boolean> {
  const data = await fetchApiForWishlist<{ isInWishlist: boolean }>(`/wishlist/check/${productId}`, { token });
  return data.isInWishlist;
}

export async function addToWishlist(productId: string, token: string): Promise<WishlistItem> {
  return fetchApiForWishlist<WishlistItem>('/wishlist', {
    method: 'POST',
    token,
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromWishlist(productId: string, token: string): Promise<void> {
  await fetchApiForWishlist<void>(`/wishlist/${productId}`, {
    method: 'DELETE',
    token,
  });
}
