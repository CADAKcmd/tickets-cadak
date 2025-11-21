export type Event = {
  id: string;
  sellerId?: string;
  title: string;
  description: string;
  startAt: string;
  endAt?: string;
  venue: string;
  city?: string;
  country?: string;
  category: 'music' | 'sport' | 'conference' | 'festival' | 'theatre' | 'comedy' ;
  status: 'draft' | 'published';
  coverImage?: string;
  currency: string;
  ticketTypes: TicketType[];
  minPriceMinor?: number; // NEW
};

export type TicketType = {
  id: string;
  name: string;
  priceMinor: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  maxPerOrder?: number;

  // NEW (tiers)
  tier?: string;             // 'Regular' | 'VIP' | 'VVIP' | 'Premium' | etc.
  perks?: string[];          // e.g., ['Fast lane', 'Backstage', 'Free drink']
  badgeColor?: string;       // e.g., '#8B5CF6'
  saleStartAt?: string;      // ISO string
  saleEndAt?: string;        // ISO string
  isHidden?: boolean;        // hide tier (coming soon)
};