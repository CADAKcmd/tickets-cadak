'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/store/cart';
import { formatMoney } from '@/components/Currency';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, currency, setQuantity, remove, clear, totalMinor } = useCart();
  const items = Array.isArray(cartItems) ? cartItems : [];
  const { user } = useAuth();

  const [buyerEmail, setBuyerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && !buyerEmail) setBuyerEmail(user.email);
  }, [user, buyerEmail]);

  const total = useMemo(() => totalMinor(), [cartItems, totalMinor]);

  const clearPendingSnapshot = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('cadak_checkout_items');
    sessionStorage.removeItem('cadak_checkout_email');
  };

  const payNow = async () => {
    setErr(null);
    if (!user) { router.push('/auth?next=/checkout'); return; }
    if (!items.length) { setErr('Your cart is empty.'); return; }
    if (!buyerEmail) { setErr('Enter your email.'); return; }

    // This demo uses Paystack test mode (NGN) only for now
    if (currency !== 'NGN' || !items.every(i => i.currency === 'NGN')) {
      setErr('This payment flow is for NGN (Paystack test) only. Create an NGN event and add NGN tickets.');
      return;
    }

    try {
      setSubmitting(true);

      // Save snapshot so callback can issue tickets
      sessionStorage.setItem('cadak_checkout_items', JSON.stringify(items));
      sessionStorage.setItem('cadak_checkout_email', buyerEmail);

      const res = await fetch('/api/paystack/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, buyerEmail, buyerId: user?.uid }),
      });

      // Handle HTML error pages gracefully (404/500)
      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await res.json() : { error: await res.text() };

      if (!res.ok || (payload as any)?.error) {
        throw new Error((payload as any)?.error || `Payment init failed [${res.status}]`);
      }

      const { authorizationUrl } = payload as any;
      if (!authorizationUrl) throw new Error('Init ok but authorizationUrl is missing');

      window.location.href = authorizationUrl; // redirect to Paystack
    } catch (e: any) {
      setErr(e?.message || 'Payment init failed');
      setSubmitting(false);
    }
  };

  const [hasPendingSnapshot, setHasPendingSnapshot] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasPendingSnapshot(!!sessionStorage.getItem('cadak_checkout_items'));
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((i) => (
              i && (
                <div key={`${i.ticketTypeId}-${i.eventId}`} className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{i.eventTitle} — {i.name}</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatMoney(i.unitPriceMinor, i.currency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={i.quantity}
                      onChange={(e) => setQuantity(i.ticketTypeId, Number(e.target.value) || 1)}
                      className="w-20 input"
                    />
                    <button className="btn btn-ghost" onClick={() => remove(i.ticketTypeId)}>Remove</button>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="card p-4 text-[hsl(var(--muted-foreground))]">
            Your cart is empty.
            {hasPendingSnapshot && (
              <>
                {' '}You have a pending payment snapshot.{' '}
                <button
                  className="underline"
                  onClick={() => { clearPendingSnapshot(); location.reload(); }}
                >
                  Clear it
                </button>{' '}
                and try again.
              </>
            )}
          </div>
        )}

        <div className="card p-4">
          <label className="block text-sm font-medium">Email for tickets</label>
          <input
            type="email"
            className="input mt-1"
            placeholder="you@example.com"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
          />
          {err && <div className="mt-2 text-sm text-red-500">{err}</div>}
          {hasPendingSnapshot && (
            <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              If you cancelled Paystack or navigated back, you can clear the pending snapshot to reset checkout.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <h2 className="mb-2 text-lg font-semibold">Order Summary</h2>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">{currency ? formatMoney(total, currency) : '-'}</span>
          </div>
          <button
            disabled={items.length === 0 || submitting}
            onClick={payNow}
            className="btn btn-primary btn-block mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Redirecting…' : 'Pay with Paystack'}
          </button>
          <div className="mt-2 flex justify-between gap-2">
            <button
              className="btn btn-ghost w-full"
              onClick={() => { clearPendingSnapshot(); clear(); }}
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}