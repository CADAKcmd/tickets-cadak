import { NextRequest, NextResponse } from 'next/server';
import { getDbOrThrow } from '@/lib/firebase';
import { collection, query, where, getDocs, runTransaction, doc, serverTimestamp } from 'firebase/firestore';

// Paystack sends HMAC-SHA512 signature in header 'x-paystack-signature'
function validSignature(secret: string, body: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('hex');
  return digest === signatureHeader;
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 });

    const raw = await req.text();
    const sig = req.headers.get('x-paystack-signature');
    if (!validSignature(secret, raw, sig)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(raw);
    // Paystack event structure: { event: 'charge.success', data: { reference, amount, ... } }
    const event = payload?.event;
    const data = payload?.data;
    if (!event || !data) return NextResponse.json({ received: true }, { status: 200 });

    // We only care about successful charge events here
    if (event !== 'charge.success' && event !== 'payment.success' && event !== 'charge.success') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const reference = data.reference;
    if (!reference) return NextResponse.json({ error: 'No reference' }, { status: 400 });

    const db = getDbOrThrow();

    // Find the pending order by reference
    const q = query(collection(db, 'orders'), where('reference', '==', reference));
    const snaps = await getDocs(q);
    if (snaps.empty) {
      // Nothing to reconcile locally — still acknowledge the webhook
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Process each matching order (should normally be one)
    for (const s of snaps.docs) {
      const orderRef = s.ref;
      const order = s.data();

      // Idempotency: only act if status is still pending
      if (order.status === 'paid') continue;

      await runTransaction(db, async (tx) => {
        const current = (await tx.get(orderRef)).data();
        if (!current) return;
        if (current.status === 'paid') return; // already processed

        // Mark paid
        tx.update(orderRef, { status: 'paid', paidAt: serverTimestamp(), rawEvent: payload });

        // Issue tickets: create a `tickets` doc per item (minimal example)
        const items = current.items || [];
        for (const it of items) {
          const ticketRef = doc(collection(db, 'tickets'));
          tx.set(ticketRef, {
            orderReference: reference,
            buyerEmail: current.buyerEmail || null,
            buyerId: current.buyerId || null,
            eventId: it.eventId,
            ticketTypeId: it.ticketTypeId,
            name: it.name,
            quantity: it.quantity || 1,
            issuedAt: serverTimestamp(),
          });
        }
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    console.error('Paystack webhook error', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
