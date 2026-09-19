'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, ProductVariant } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant, selectedOptions?: Record<string, string>) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getItemKey: (productId: string, variantId?: string) => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      getItemKey: (productId, variantId) => variantId ? `${productId}::${variantId}` : productId,
      addItem: (product, quantity = 1, variant, selectedOptions) => {
        const itemKey = get().getItemKey(product._id, variant?._id);
        set((state) => {
          const existing = state.items.find((i) => get().getItemKey(i.product._id, i.variant?._id) === itemKey);
          const stock = variant ? variant.stock : product.stock;
          if (existing) {
            return {
              items: state.items.map((i) =>
                get().getItemKey(i.product._id, i.variant?._id) === itemKey
                  ? { ...i, quantity: Math.min(i.quantity + quantity, stock) }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { product, quantity: Math.min(quantity, stock), variant, selectedOptions }],
            isOpen: true,
          };
        });
      },
      removeItem: (productId, variantId) => {
        const itemKey = get().getItemKey(productId, variantId);
        set((state) => ({
          items: state.items.filter((i) => get().getItemKey(i.product._id, i.variant?._id) !== itemKey),
        }));
      },
      updateQuantity: (productId, quantity, variantId) => {
        const itemKey = get().getItemKey(productId, variantId);
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (get().getItemKey(i.product._id, i.variant?._id) !== itemKey) return i;
            const stock = i.variant ? i.variant.stock : i.product.stock;
            return { ...i, quantity: Math.min(quantity, stock) };
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      getSubtotal: () => get().items.reduce((sum, i) => {
        const price = i.variant?.price ?? i.product.price;
        return sum + price * i.quantity;
      }, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'glowteva-cart' }
  )
);
