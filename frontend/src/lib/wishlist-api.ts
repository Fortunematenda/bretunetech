const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  const res = await fetch(`${API_URL}/wishlist`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  return res.json();
}

export async function checkWishlist(productId: string, token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/wishlist/check/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to check wishlist');
  const data = await res.json();
  return data.isInWishlist;
}

export async function addToWishlist(productId: string, token: string): Promise<WishlistItem> {
  const res = await fetch(`${API_URL}/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });
  if (res.status === 401) throw new Error('Session expired. Please log in again.');
  if (!res.ok) throw new Error('Failed to add to wishlist');
  return res.json();
}

export async function removeFromWishlist(productId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to remove from wishlist');
}
