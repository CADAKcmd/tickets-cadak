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
  category: 'music' | 'sport' | 'conference' | 'festival' | 'theatre' | 'comedy';
  status: 'draft' | 'published';
  coverImage?: string;
  currency: string;
  ticketTypes: TicketType[];
  minPriceMinor?: number;
};

export type TicketType = {
  id: string;
  name: string;
  priceMinor: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  maxPerOrder?: number;
  tier?: string;
  perks?: string[];
  badgeColor?: string;
  saleStartAt?: string;
  saleEndAt?: string;
  isHidden?: boolean;
};

export type Ticket = {
  id: string;
  eventId: string;
  eventTitle?: string;
  ticketTypeName?: string;
  buyerEmail?: string;
  status?: 'unused' | 'checked_in' | 'used' | 'revoked';
  qrPayload?: string;
  issuedAt?: string | any;
};

export type CartItem = {
  eventId: string;
  eventTitle?: string;
  ticketTypeId: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
  currency: string;
};