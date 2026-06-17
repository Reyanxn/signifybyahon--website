'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string | null, discount: number) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,
      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        });
      },
      updateQuantity: (productId, size, color, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [], couponCode: null, discount: 0 }),
      setCoupon: (code, discount) => set({ couponCode: code, discount }),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'signify-cart' }
  )
);
