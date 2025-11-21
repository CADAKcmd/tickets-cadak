'use client';

import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { Event, TicketType } from '@/lib/types';

const KEY = 'seller_events';
const loadInitial = () => storage.get<Event[]>(KEY, []);

function randId(prefix = 'evt') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

type SellerStore = {
  events: Event[];
  load: () => void;
  addEvent: (e: Omit<Event, 'id'>) => Event;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  setStatus: (id: string, status: Event['status']) => void;
  deleteEvent: (id: string) => void;
  getById: (id: string) => Event | undefined;
};

export const useSeller = create<SellerStore>((set, get) => ({
  events: loadInitial(),
  load: () => set({ events: loadInitial() }),
  addEvent: (e) => {
    const event: Event = { ...e, id: randId('evt') };
    const next = [...get().events, event];
    storage.set(KEY, next);
    set({ events: next });
    return event;
  },
  updateEvent: (id, patch) => {
    const next = get().events.map(ev => ev.id === id ? { ...ev, ...patch } : ev);
    storage.set(KEY, next);
    set({ events: next });
  },
  setStatus: (id, status) => {
    const next = get().events.map(ev => ev.id === id ? { ...ev, status } : ev);
    storage.set(KEY, next);
    set({ events: next });
  },
  deleteEvent: (id) => {
    const next = get().events.filter(ev => ev.id !== id);
    storage.set(KEY, next);
    set({ events: next });
  },
  getById: (id) => get().events.find(e => e.id === id),
}));