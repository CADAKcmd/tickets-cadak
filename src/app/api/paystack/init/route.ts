import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { items, buyerEmail, buyerId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!buyerEmail) {
      return NextResponse.json({ error: 'Buyer email is required' }, { status: 400 });
    }

    const currency = items[0].currency;
    if (!items.every((i: any) => i.currency === currency)) {
      return NextResponse.json({ error: 'All items must be same currency' }, { status: 400 });
    }
    if (currency !== 'NGN') {
      return NextResponse.json({ error: 'Paystack demo supports NGN only for now' }, { status: 400 });
    }

    const totalMinor = items.reduce((s: number, i: any) => s + i.unitPriceMinor * i.quantity, 0);
    if (totalMinor <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing in env' }, { status: 500 });
    }

    const ref = `cadak_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const origin = new URL(req.url).origin;
    const callback_url = `${origin}/paystack/callback`;

    // Persist a pending order snapshot server-side so verify can reconcile and issue tickets.
    try {
      const orderRef = doc(collection(db, 'orders'));
      await setDoc(orderRef, {
        reference: ref,
        buyerEmail,
        buyerId: buyerId ?? null,
        items,
        currency,
        totalMinor,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // log but continue — we still try to init the transaction so the payment can complete
      console.warn('Failed to persist pending order before Paystack init', err);
    }

    // Paystack amounts must be in kobo – our totalMinor is already minor for NGN (kobo)
    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: buyerEmail,
        amount: totalMinor, // already minor units (kobo)
        currency: 'NGN',
        reference: ref,
        callback_url,
        metadata: {
          cartItems: items.length, // informational
          buyerId: buyerId ?? null,
        },
      }),
    });

    const data = await initRes.json();
    if (!initRes.ok || !data?.status) {
      const msg = data?.message || 'Paystack init failed';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}