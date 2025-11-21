export type DemoOrder = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  items: number;
  totalMinor: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  createdAt: string; // ISO
};

export type DemoTicket = {
  id: string;
  orderId: string;
  eventTitle: string;
  typeName: string;
  buyerEmail: string;
  status: 'unused' | 'checked_in' | 'refunded';
  issuedAt: string;
};

export type DemoCustomer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  tickets: number;
  joinedAt: string;
  lastSeenAt?: string;
};

const now = new Date();
function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const demoOrders: DemoOrder[] = [
  { id: 'ord_1001', buyerName: 'Tomiwa A.', buyerEmail: 'tomiwa@example.com', eventTitle: 'Afrobeat Fest 2025', items: 2, totalMinor: 400000, currency: 'NGN', status: 'paid', createdAt: daysAgo(1) },
  { id: 'ord_1002', buyerName: 'Sarah W.', buyerEmail: 'sarah@example.com', eventTitle: 'Tech Conference 2025', items: 1, totalMinor: 12000, currency: 'USD', status: 'pending', createdAt: daysAgo(2) },
  { id: 'ord_1003', buyerName: 'Kweku A.', buyerEmail: 'kweku@example.com', eventTitle: 'Premier League: City vs United', items: 3, totalMinor: 24000, currency: 'GBP', status: 'paid', createdAt: daysAgo(5) },
  { id: 'ord_1004', buyerName: 'Ada M.', buyerEmail: 'ada@example.com', eventTitle: 'Comedy Night', items: 2, totalMinor: 20000, currency: 'NGN', status: 'refunded', createdAt: daysAgo(6) },
  { id: 'ord_1005', buyerName: 'Luis R.', buyerEmail: 'luis@example.com', eventTitle: 'Tech Conference 2025', items: 1, totalMinor: 12000, currency: 'USD', status: 'paid', createdAt: daysAgo(9) },
  { id: 'ord_1006', buyerName: 'Amira S.', buyerEmail: 'amira@example.com', eventTitle: 'Afrobeat Fest 2025', items: 4, totalMinor: 800000, currency: 'NGN', status: 'paid', createdAt: daysAgo(12) },
];

export const demoTickets: DemoTicket[] = [
  { id: 'tkt_x1', orderId: 'ord_1001', eventTitle: 'Afrobeat Fest 2025', typeName: 'General', buyerEmail: 'tomiwa@example.com', status: 'checked_in', issuedAt: daysAgo(1) },
  { id: 'tkt_x2', orderId: 'ord_1001', eventId: undefined as any, eventTitle: 'Afrobeat Fest 2025', typeName: 'General', buyerEmail: 'tomiwa@example.com', status: 'unused', issuedAt: daysAgo(1) },
  { id: 'tkt_x3', orderId: 'ord_1003', eventTitle: 'Premier League: City vs United', typeName: 'Lower Tier', buyerEmail: 'kweku@example.com', status: 'unused', issuedAt: daysAgo(5) },
  { id: 'tkt_x4', orderId: 'ord_1005', eventTitle: 'Tech Conference 2025', typeName: 'Standard', buyerEmail: 'luis@example.com', status: 'unused', issuedAt: daysAgo(9) },
];

export const demoCustomers: DemoCustomer[] = [
  { id: 'cus_01', name: 'Tomiwa A.', email: 'tomiwa@example.com', orders: 1, tickets: 2, joinedAt: daysAgo(40), lastSeenAt: daysAgo(1) },
  { id: 'cus_02', name: 'Sarah W.', email: 'sarah@example.com', orders: 1, tickets: 1, joinedAt: daysAgo(60), lastSeenAt: daysAgo(2) },
  { id: 'cus_03', name: 'Kweku A.', email: 'kweku@example.com', orders: 1, tickets: 3, joinedAt: daysAgo(90), lastSeenAt: daysAgo(5) },
  { id: 'cus_04', name: 'Luis R.', email: 'luis@example.com', orders: 1, tickets: 1, joinedAt: daysAgo(120), lastSeenAt: daysAgo(9) },
  { id: 'cus_05', name: 'Amira S.', email: 'amira@example.com', orders: 1, tickets: 4, joinedAt: daysAgo(140), lastSeenAt: daysAgo(12) },
];