import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  runTransaction,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get('reference');
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await verifyRes.json();

    if (!verifyRes.ok || !data?.status) {
      const msg = data?.message || 'Verify failed';
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    const isSuccess = data.data?.status === 'success';

    // If success, attempt to reconcile server-side pending order and issue tickets
    if (isSuccess) {
      try {
        const q = query(collection(db, 'orders'), where('reference', '==', reference), limit(1));
        const snaps = await getDocs(q);
        if (!snaps.empty) {
          const ordDoc = snaps.docs[0];
          const ord = ordDoc.data() as any;
          if (ord.status !== 'paid') {
            // run a transaction to mark paid and create tickets
            await runTransaction(db, async (tx) => {
              const ordRef = doc(db, 'orders', ordDoc.id);
              const current = await tx.get(ordRef);
              if (!current.exists()) throw new Error('Order disappeared');

              tx.update(ordRef, { status: 'paid', paidAt: serverTimestamp() });

              // Issue tickets only if order has items
              const items = (ord.items || []) as any[];
              const ticketIds: string[] = [];
              for (const i of items) {
                const qty = i.quantity || 1;
                for (let k = 0; k < qty; k++) {
                  const tRef = doc(collection(db, 'tickets'));
                  ticketIds.push(tRef.id);
                  const qrPayload = JSON.stringify({ t: tRef.id, e: i.eventId, tt: i.ticketTypeId });
                  tx.set(tRef, {
                    id: tRef.id,
                    orderId: ordRef.id,
                    buyerId: ord.buyerId || null,
                    buyerEmail: ord.buyerEmail || null,
                    sellerId: ord.sellerId || null,
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
            });
          }
        }
      } catch (err: any) {
        console.warn('Failed to reconcile order on Paystack verify:', err);
      }
    }

    return NextResponse.json({ ok: isSuccess, data: data.data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}