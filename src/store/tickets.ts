'use client';

import { create } from 'zustand';
import { storage } from '@/lib/storage';
import { Ticket, CartItem } from '@/lib/types';

type TicketState = {
  tickets: Ticket[];
  issueFromOrder: (items: CartItem[], buyerEmail: string) => Ticket[];
  load: () => void;
};

const loadInitial = () => storage.get<Ticket[]>('my_tickets', []);

function randId(prefix = 't') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const useTickets = create<TicketState>((set, get) => ({
  tickets: loadInitial(),

  load: () => set({ tickets: loadInitial() }),

  issueFromOrder: (items, buyerEmail) => {
    const issued: Ticket[] = [];
    items.forEach((i) => {
      for (let k = 0; k < i.quantity; k++) {
        const id = randId('tkt');
        const payload = JSON.stringify({ t: id, e: i.eventId, tt: i.ticketTypeId });
        issued.push({
          id,
          eventId: i.eventId,
          eventTitle: i.eventTitle,
          ticketTypeName: i.name,
          buyerEmail,
          status: 'unused',
          qrPayload: payload,
        });
      }
    });
    const all = [...get().tickets, ...issued];
    storage.set('my_tickets', all);
    set({ tickets: all });
    return issued;
  },
}));