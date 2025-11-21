'use client';

import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { CartItem } from '@/lib/types';

type CartState = {
  items: CartItem[];
  currency: string | null;
  add: (item: CartItem) => void;
  setQuantity: (ticketTypeId: string, quantity: number) => void;
  remove: (ticketTypeId: string) => void;
  clear: () => void;
  totalMinor: () => number;
  count: () => number;
};

const initial = () => storage.get<CartState['items']>('cart_items', []);
const initialCurrency = () => storage.get<string | null>('cart_currency', null);

export const useCart = create<CartState>((set, get) => ({
  items: initial(),
  currency: initialCurrency(),

  add: (item) =>
    set((state) => {
      if (state.currency && state.currency !== item.currency) {
        alert(`Cart currency is ${state.currency}. Please checkout or clear the cart before adding ${item.currency} items.`);
        return state;
      }
      const existing = state.items.find((i) => i.ticketTypeId === item.ticketTypeId);
      let items;
      if (existing) {
        items = state.items.map((i) =>
          i.ticketTypeId === item.ticketTypeId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        items = [...state.items, item];
      }
      storage.set('cart_items', items);
      storage.set('cart_currency', item.currency);
      return { items, currency: item.currency };
    }),

  setQuantity: (ticketTypeId, quantity) =>
    set((state) => {
      const items = state.items.map((i) => (i.ticketTypeId === ticketTypeId ? { ...i, quantity } : i));
      storage.set('cart_items', items);
      return { items };
    }),

  remove: (ticketTypeId) =>
    set((state) => {
      const items = state.items.filter((i) => i.ticketTypeId !== ticketTypeId);
      const currency = items.length ? state.currency : null;
      storage.set('cart_items', items);
      storage.set('cart_currency', currency);
      return { items, currency };
    }),

  clear: () => {
    storage.set('cart_items', []);
    storage.set('cart_currency', null);
    set({ items: [], currency: null });
  },

  totalMinor: () => get().items.reduce((sum, i) => sum + i.unitPriceMinor * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));