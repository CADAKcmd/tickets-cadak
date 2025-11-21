'use client';

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import type { Event, TicketType, CartItem } from '@/lib/types';

/**
 * EVENTS
 */
export async function createEventFS(
  sellerId: string,
  event: Omit<Event, 'id' | 'ticketTypes' | 'sellerId'>,
  ticketTypes: TicketType[]
) {
  const evRef = doc(collection(db, 'events'));

  // compute min price for Explore cards
  const prices = ticketTypes.map((t) => t.priceMinor).filter((n) => Number.isFinite(n));
  const minPriceMinor = prices.length ? Math.min(...prices) : null;

  await setDoc(evRef, {
    ...event,
    sellerId,
    minPriceMinor: minPriceMinor ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const batch = writeBatch(db);
  ticketTypes.forEach((t) => {
    const ttRef = doc(collection(db, 'events', evRef.id, 'ticketTypes'));
    batch.set(ttRef, { ...t, id: ttRef.id, quantitySold: t.quantitySold ?? 0 });
  });
  await batch.commit();

  return evRef.id;
}

export async function updateEventFS(eventId: string, patch: Partial<Event>) {
  await updateDoc(doc(db, 'events', eventId), { ...patch, updatedAt: serverTimestamp() });
}

export async function listPublishedEventsFS() {
  const qy = query(
    collection(db, 'events'),
    where('status', '==', 'published'),
    orderBy('startAt', 'asc'),
    limit(200)
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Event[];
}

export async function getEventWithTicketsFS(eventId: string) {
  const evSnap = await getDoc(doc(db, 'events', eventId));
  if (!evSnap.exists()) return undefined;
  const ev = { id: evSnap.id, ...(evSnap.data() as any) } as Event;
  const ttSnap = await getDocs(collection(db, 'events', eventId, 'ticketTypes'));
  const ticketTypes = ttSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TicketType[];
  ev.ticketTypes = ticketTypes;
  return ev;
}

/**
 * ORDERS + TICKETS
 * v1: one event per order
 * Returns created orderId and ticketIds so UI can highlight fresh tickets.
 */
export async function createOrderAndIssueTicketsFS(params: {
  buyerId: string;
  buyerEmail: string;
  items: CartItem[];
}): Promise<{ orderId: string; ticketIds: string[] }> {
  const { buyerId, buyerEmail, items } = params;
  if (!items.length) throw new Error('Cart empty');

  const eventIds = Array.from(new Set(items.map((i) => i.eventId)));
  if (eventIds.length !== 1) throw new Error('Only one event per order in v1');
  const eventId = eventIds[0];

  return await runTransaction(db, async (tx) => {
    const evRef = doc(db, 'events', eventId);
    const evSnap = await tx.get(evRef);
    if (!evSnap.exists()) throw new Error('Event not found');
    const sellerId = (evSnap.data() as any).sellerId as string;

    // Optional read-only validation (no writes to ticketTypes here, to avoid permission issues)
    for (const i of items) {
      const ttRef = doc(db, 'events', i.eventId, 'ticketTypes', i.ticketTypeId);
      const ttSnap = await tx.get(ttRef);
      if (!ttSnap.exists()) throw new Error('Ticket type missing');
      // You can keep a soft check if you want; we don't write inventory from client
      // const tt = ttSnap.data() as TicketType;
      // const remaining = (tt.quantityTotal ?? 0) - (tt.quantitySold ?? 0);
      // if (remaining < i.quantity) throw new Error(`Not enough ${tt.name} left`);
    }

    const currency = items[0].currency;
    const totalMinor = items.reduce((s, i) => s + i.unitPriceMinor * i.quantity, 0);

    // Create order
    const orderRef = doc(collection(db, 'orders'));
    tx.set(orderRef, {
      buyerId,
      buyerEmail,
      sellerId,
      eventId,
      status: 'paid', // later: set 'pending' and confirm via webhook
      currency,
      totalMinor,
      createdAt: serverTimestamp(),
      items: items.map((i) => ({
        eventId: i.eventId,
        eventTitle: i.eventTitle,
        ticketTypeId: i.ticketTypeId,
        name: i.name,
        unitPriceMinor: i.unitPriceMinor,
        quantity: i.quantity,
      })),
    });

    // Issue tickets
    const ticketIds: string[] = [];
    for (const i of items) {
      for (let k = 0; k < i.quantity; k++) {
        const tRef = doc(collection(db, 'tickets'));
        ticketIds.push(tRef.id);
        const qrPayload = JSON.stringify({ t: tRef.id, e: i.eventId, tt: i.ticketTypeId });
        tx.set(tRef, {
          id: tRef.id,
          orderId: orderRef.id,
          buyerId,
          buyerEmail,
          sellerId,
          eventId: i.eventId,
          eventTitle: i.eventTitle,
          ticketTypeId: i.ticketTypeId,
          typeName: i.name,
          status: 'unused',
          issuedAt: serverTimestamp(),
          qrPayload,
        });
      }
    }

    return { orderId: orderRef.id, ticketIds };
  });
}

export async function listBuyerTicketsFS(buyerId: string) {
  const qy = query(
    collection(db, 'tickets'),
    where('buyerId', '==', buyerId),
    orderBy('issuedAt', 'desc')
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => d.data() as any);
}

export async function listSellerOrdersFS(sellerId: string) {
  const qy = query(
    collection(db, 'orders'),
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listSellerTicketsFS(sellerId: string) {
  const qy = query(
    collection(db, 'tickets'),
    where('sellerId', '==', sellerId),
    orderBy('issuedAt', 'desc')
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => d.data() as any);
}

/**
 * SCAN / VERIFY
 */
export async function verifyAndCheckInFS(ticketId: string, scannerUid: string) {
  return await runTransaction(db, async (tx) => {
    const tRef = doc(db, 'tickets', ticketId);
    const tSnap = await tx.get(tRef);
    if (!tSnap.exists()) throw new Error('invalid');
    const t = tSnap.data() as any;
    if (t.sellerId !== scannerUid) throw new Error('not-authorized');
    if (t.status === 'checked_in') return { result: 'already_used', ticket: t };
    if (t.status !== 'unused') throw new Error('invalid');

    tx.update(tRef, { status: 'checked_in', scannedAt: serverTimestamp() });

    const scanRef = doc(collection(db, 'scans'));
    tx.set(scanRef, { ticketId, scannedBy: scannerUid, scannedAt: serverTimestamp(), eventId: t.eventId });

    return { result: 'valid', ticket: { ...t, status: 'checked_in' } };
  });
}

/**
 * PROFILES
 */
export type Profile = {
  uid: string;
  name?: string;
  about?: string;
  phone?: string;
  avatarUrl?: string;
  socials?: { facebook?: string; twitter?: string; instagram?: string };
  updatedAt?: any;
};

export async function getProfileFS(uid: string): Promise<Profile | null> {
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ uid, ...(snap.data() as any) }) : null;
}

export async function upsertProfileFS(uid: string, data: Omit<Profile, 'uid'>) {
  const ref = doc(db, 'profiles', uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * DELETE HELPERS
 */
export async function deleteTicketFS(ticketId: string, buyerUid: string) {
  const ref = doc(db, 'tickets', ticketId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Ticket not found');
  const t = snap.data() as any;
  if (t.buyerId !== buyerUid) throw new Error('Not your ticket');
  if (t.status === 'checked_in') throw new Error('Cannot delete a checked-in ticket');
  await deleteDoc(ref);
}

export async function deleteEventFS(eventId: string, sellerUid: string) {
  const ref = doc(db, 'events', eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Event not found');
  const data = snap.data() as any;
  if (data.sellerId !== sellerUid) throw new Error('Not your event');

  // delete ticketTypes subcollection
  const ttSnap = await getDocs(collection(db, 'events', eventId, 'ticketTypes'));
  const batch = writeBatch(db);
  ttSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  // finally delete the event
  await deleteDoc(ref);
}

/**
 * STATS / ANALYTICS
 */
export async function getSellerStatsFS(sellerId: string) {
  const orders = await listSellerOrdersFS(sellerId);
  const tickets = await listSellerTicketsFS(sellerId);
  const evSnap = await getDocs(query(collection(db, 'events'), where('sellerId', '==', sellerId)));
  const events = evSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

  const revenueMinor = orders
    .filter((o) => o.status === 'paid')
    .reduce((s, o) => s + (o.totalMinor ?? 0), 0);

  const ticketsSold = tickets.length;
  const activeEvents = events.filter((e) => e.status === 'published').length;

  const days = 30;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  const dailyRevenue = new Array(days).fill(0);
  const dailyOrders = new Array(days).fill(0);

  orders.forEach((o: any) => {
    const ts: Date | null =
      o.createdAt?.toDate?.() ?? (o.createdAt ? new Date(o.createdAt) : null);
    if (!ts) return;
    const d = Math.floor(
      (ts.getTime() - start.getTime()) / (24 * 3600 * 1000)
    );
    if (d >= 0 && d < days) {
      dailyRevenue[d] += o.totalMinor ?? 0;
      dailyOrders[d] += 1;
    }
  });

  return {
    revenueMinor,
    ticketsSold,
    activeEvents,
    dailyRevenue,
    dailyOrders,
    startDate: start.toISOString(),
  };
}

/**
 * CUSTOMERS (grouped by buyer email)
 */
export async function listCustomersFS(sellerId: string) {
  const orders = await listSellerOrdersFS(sellerId);
  const map = new Map<string, any>();

  orders.forEach((o: any) => {
    const key = (o.buyerEmail || o.buyerId || 'unknown').toLowerCase();
    const entry =
      map.get(key) || {
        email: o.buyerEmail || 'unknown',
        name: o.buyerName || '',
        orders: 0,
        tickets: 0,
        lastOrderAt: o.createdAt,
      };
    entry.orders += 1;
    entry.tickets += (o.items || []).reduce((s: number, it: any) => s + (it.quantity || 0), 0);
    if (!entry.lastOrderAt || (o.createdAt && o.createdAt > entry.lastOrderAt)) {
      entry.lastOrderAt = o.createdAt;
    }
    map.set(key, entry);
  });

  return Array.from(map.values()).sort((a, b) => b.orders - a.orders);
}

/**
 * PAYOUTS
 */
export async function getPayoutSettingsFS(sellerId: string) {
  const snap = await getDoc(doc(db, 'payoutSettings', sellerId));
  return snap.exists() ? (snap.data() as any) : null;
}

export async function savePayoutSettingsFS(sellerId: string, data: any) {
  await setDoc(doc(db, 'payoutSettings', sellerId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function listPayoutRequestsFS(sellerId: string) {
  const qy = query(collection(db, 'payoutRequests'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function requestPayoutFS(sellerId: string, amountMinor: number) {
  const ref = doc(collection(db, 'payoutRequests'));
  await setDoc(ref, { sellerId, amountMinor, status: 'pending', createdAt: serverTimestamp() });
  return ref.id;
}

/**
 * ACCESS MANAGERS (invite/accept/remove) + accessIndex for scanner auth
 */
export async function inviteAccessFS(
  sellerId: string,
  sellerEmail: string,
  memberEmail: string,
  role: 'scanner' | 'manager'
) {
  const ref = doc(collection(db, 'access'));
  await setDoc(ref, {
    sellerId,
    sellerEmail,
    memberEmail,
    role,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listAccessForSellerFS(sellerId: string) {
  const qy = query(collection(db, 'access'), where('sellerId', '==', sellerId));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listAccessInvitesForUserFS(userEmail: string) {
  const qy = query(collection(db, 'access'), where('memberEmail', '==', userEmail));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function acceptAccessInviteFS(inviteId: string, memberUid: string) {
  const ref = doc(db, 'access', inviteId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Invite not found');

  const data = snap.data() as any;
  await updateDoc(ref, {
    memberUid,
    status: 'active',
    acceptedAt: serverTimestamp(),
  });

  // Create accessIndex doc for rules: sellerId_memberUid
  const idxId = `${data.sellerId}_${memberUid}`;
  await setDoc(doc(db, 'accessIndex', idxId), {
    sellerId: data.sellerId,
    memberUid,
    role: data.role,
    createdAt: serverTimestamp(),
  });
}

export async function removeAccessMemberFS(inviteId: string) {
  const ref = doc(db, 'access', inviteId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as any;
    if (data.memberUid) {
      const idxId = `${data.sellerId}_${data.memberUid}`;
      await deleteDoc(doc(db, 'accessIndex', idxId));
    }
  }
  await deleteDoc(ref);
}

/**
 * AFFILIATES
 */
export async function createAffiliateCodeFS(sellerId: string, code: string) {
  const id = `${sellerId}_${code}`;
  await setDoc(doc(db, 'affiliates', id), { sellerId, code, createdAt: serverTimestamp() });
}

export async function listAffiliateCodesFS(sellerId: string) {
  const qy = query(collection(db, 'affiliates'), where('sellerId', '==', sellerId));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}