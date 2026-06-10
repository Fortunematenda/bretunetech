import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId?: string;
  bundleId?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  type: 'product' | 'bundle';
  warehouseLocation?: 'CPT' | 'JHB' | 'DBN';
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => (item.productId && i.productId === item.productId) || (item.bundleId && i.bundleId === item.bundleId)
        );

        if (existingIndex >= 0) {
          const updated = [...items];
          updated[existingIndex].quantity += item.quantity;
          set({ items: updated });
        } else {
          const id = crypto.randomUUID();
          set({ items: [...items, { ...item, id }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => {
        set({ items: [] });
        // Force localStorage update
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bretunetech-cart');
        }
      },

      total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'bretunetech-cart' }
  )
);
