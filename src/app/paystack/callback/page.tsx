'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createOrderAndIssueTicketsFS } from '@/lib/firestore';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/store/cart';

export default function PaystackCallbackPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const reference = sp.get('reference') || '';
  const { user } = useAuth();
  const { clear } = useCart();

  const [msg, setMsg] = useState('Verifying payment…');
  const [verified, setVerified] = useState(false);
  const [issued, setIssued] = useState(false);

  // 1) Verify
  useEffect(() => {
    (async () => {
      try {
        if (!reference) { setMsg('Missing reference.'); return; }
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          setMsg(data?.error || 'Payment not verified.');
          return;
        }
        setVerified(true);
        setMsg('Payment verified.');
      } catch (e: any) {
        setMsg(e?.message || 'Verify failed.');
      }
    })();
  }, [reference]);

  // 2) If verified but not signed in → send to auth
  useEffect(() => {
    if (verified && !user) {
      const next = `/paystack/callback?reference=${encodeURIComponent(reference)}`;
      router.replace(`/auth?next=${encodeURIComponent(next)}`);
    }
  }, [verified, user, router, reference]);

  // 3) Issue tickets once, then redirect with ids to /dashboard/tickets
  useEffect(() => {
    (async () => {
      if (!verified || !user || issued) return;
      try {
        setMsg('Issuing tickets…');

        const rawItems = sessionStorage.getItem('cadak_checkout_items');
        const savedEmail = sessionStorage.getItem('cadak_checkout_email') || user.email || 'unknown@example.com';
        const items = rawItems ? JSON.parse(rawItems) : [];

        if (!items.length) {
          // Nothing to issue (user might have cleared cart); go to tickets anyway
          router.replace('/dashboard/tickets?justBought=1');
          return;
        }

        const { orderId, ticketIds } = await createOrderAndIssueTicketsFS({
          buyerId: user.uid,
          buyerEmail: savedEmail,
          items,
        });

        // Cleanup
        sessionStorage.removeItem('cadak_checkout_items');
        sessionStorage.removeItem('cadak_checkout_email');
        clear();

        setIssued(true);
        // Pass ids to highlight them on the tickets page
        router.replace(`/dashboard/tickets?justBought=1&order=${encodeURIComponent(orderId)}&tickets=${encodeURIComponent(ticketIds.join(','))}`);
      } catch (e: any) {
        const m = e?.message || 'Failed to issue tickets.';
        setMsg(m);
        router.replace('/dashboard/tickets?justBought=1&error=' + encodeURIComponent(m));
      }
    })();
  }, [verified, user, issued, clear, router]);

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-4">{msg}</div>
    </div>
  );
}