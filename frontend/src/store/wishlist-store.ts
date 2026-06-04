import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sellingPrice: number;
    images: { url: string }[];
    category?: { name: string };
  };
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  itemCount: () => number;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      setItems: (items) => set({ items }),

      addItem: (item) => {
        const items = get().items;
        const exists = items.find((i) => i.productId === item.productId);
        if (!exists) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clearWishlist: () => set({ items: [] }),

      itemCount: () => get().items.length,

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
    }),
    { name: 'bretunetech-wishlist' }
  )
);
