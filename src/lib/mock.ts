import { Event } from './types';

const now = new Date();
const plusDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

export const mockEvents: Event[] = [
  {
    id: 'evt_afrobeat',
    title: 'Afrobeat Fest 2025',
    description: 'A night of nonstop music with top Afrobeat artists.',
    startAt: plusDays(30),
    venue: 'Eko Energy City',
    city: 'Lagos',
    country: 'NG',
    category: 'music',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format',
    currency: 'NGN',
    ticketTypes: [
      { id: 'tt_afro_gen', name: 'General', priceMinor: 200000, currency: 'NGN', quantityTotal: 2000, quantitySold: 320 },
      { id: 'tt_afro_vip', name: 'VIP', priceMinor: 500000, currency: 'NGN', quantityTotal: 300, quantitySold: 120 },
    ],
  },
  {
    id: 'evt_techconf',
    title: 'Tech Conference 2025',
    description: 'Talks, workshops, and networking with tech leaders.',
    startAt: plusDays(45),
    venue: 'KICC',
    city: 'Nairobi',
    country: 'KE',
    category: 'conference',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=1200&auto=format',
    currency: 'USD',
    ticketTypes: [
      { id: 'tt_tech_std', name: 'Standard', priceMinor: 12000, currency: 'USD', quantityTotal: 1000, quantitySold: 220 },
      { id: 'tt_tech_vip', name: 'VIP', priceMinor: 30000, currency: 'USD', quantityTotal: 150, quantitySold: 40 },
    ],
  },
  {
    id: 'evt_premier',
    title: 'Premier League: City vs United',
    description: 'Derby match at Etihad Stadium.',
    startAt: plusDays(20),
    venue: 'Etihad Stadium',
    city: 'Manchester',
    country: 'UK',
    category: 'sport',
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1518600579408-5f07fda3b5bb?q=80&w=1200&auto=format',
    currency: 'GBP',
    ticketTypes: [
      { id: 'tt_pl_lower', name: 'Lower Tier', priceMinor: 8000, currency: 'GBP', quantityTotal: 500, quantitySold: 190 },
      { id: 'tt_pl_upper', name: 'Upper Tier', priceMinor: 5000, currency: 'GBP', quantityTotal: 800, quantitySold: 500 },
    ],
  },
];

export async function searchEvents(params: {
  q?: string;
  city?: string;
  category?: Event['category'] | 'all';
  from?: string;
  to?: string;
}): Promise<Event[]> {
  const { q = '', city = '', category = 'all', from, to } = params;
  const ql = q.toLowerCase();
  const cl = city.toLowerCase();
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 250));

  return mockEvents.filter((e) => {
    if (e.status !== 'published') return false;
    if (ql && !(e.title.toLowerCase().includes(ql) || e.description.toLowerCase().includes(ql))) return false;
    if (cl && !(e.city?.toLowerCase().includes(cl))) return false;
    if (category !== 'all' && e.category !== category) return false;
    const start = new Date(e.startAt);
    if (fromDate && start < fromDate) return false;
    if (toDate && start > toDate) return false;
    return true;
  });
}

export async function getEventById(id: string): Promise<Event | undefined> {
  await new Promise((r) => setTimeout(r, 150));
  return mockEvents.find((e) => e.id === id);
}