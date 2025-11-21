'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getEventWithTicketsFS } from '@/lib/firestore';
import { Event, TicketType } from '@/lib/types';
import { useCart } from '@/store/cart';
import { formatMoney } from '@/components/Currency';

function withinSaleWindow(tt: TicketType) {
  const now = Date.now();
  const start = tt.saleStartAt ? new Date(tt.saleStartAt).getTime() : -Infinity;
  const end = tt.saleEndAt ? new Date(tt.saleEndAt).getTime() : Infinity;
  return now >= start && now <= end;
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const add = useCart((s) => s.add);

  // qty map per ticket type
  const [qty, setQty] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const ev = await getEventWithTicketsFS(id);
      setEvent(ev ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (!id) return <div>Loading…</div>;
  if (loading) return <div>Loading…</div>;
  if (!event) return <div>Event not found.</div>;

  const inc = (tt: TicketType) => {
    const remaining = (tt.quantityTotal ?? 0) - (tt.quantitySold ?? 0);
    const current = qty[tt.id] || 0;
    const maxPerOrder = tt.maxPerOrder ?? 10;
    const next = Math.min(current + 1, remaining, maxPerOrder);
    setQty((q) => ({ ...q, [tt.id]: next }));
  };
  const dec = (tt: TicketType) => {
    const current = qty[tt.id] || 0;
    setQty((q) => ({ ...q, [tt.id]: Math.max(0, current - 1) }));
  };
  const addToCart = (tt: TicketType) => {
    const q = qty[tt.id] || 0;
    if (q <= 0) return;
    add({
      eventId: event.id,
      eventTitle: event.title,
      ticketTypeId: tt.id,
      name: tt.name,
      unitPriceMinor: tt.priceMinor,
      quantity: q,
      currency: tt.currency,
    });
    setQty((prev) => ({ ...prev, [tt.id]: 0 }));
  };

  return (
    <div className="space-y-6">
      {event.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.coverImage} alt="" className="h-64 w-full rounded-lg object-cover" />
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            {event.city} • {new Date(event.startAt).toLocaleString()} • {event.category}
          </div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="text-[hsl(var(--muted-foreground))]">{event.venue}</div>
        </div>
        <a href="/checkout" className="btn btn-primary">Go to Checkout</a>
      </div>

      <p>{event.description}</p>

      <div>
        <h2 className="mb-2 text-xl font-semibold">Choose your tier</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {event.ticketTypes.map((tt) => {
            const remaining = (tt.quantityTotal ?? 0) - (tt.quantitySold ?? 0);
            const available = remaining > 0 && withinSaleWindow(tt) && !tt.isHidden;
            const q = qty[tt.id] || 0;
            const perks = tt.perks || [];
            return (
              <div key={tt.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide" style={{ color: tt.badgeColor || undefined }}>
                      {tt.tier || 'Tier'}
                    </div>
                    <div className="font-semibold">{tt.name}</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {formatMoney(tt.priceMinor, tt.currency)} • {remaining} left
                    </div>
                  </div>
                  {tt.badgeColor && (
                    <span className="h-3 w-3 rounded-full" style={{ background: tt.badgeColor }} />
                  )}
                </div>

                {perks.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-[hsl(var(--muted-foreground))]">
                    {perks.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="btn btn-ghost" onClick={() => dec(tt)} disabled={!available || q <= 0}>−</button>
                    <div className="w-10 text-center">{q}</div>
                    <button className="btn btn-ghost" onClick={() => inc(tt)} disabled={!available}>+</button>
                  </div>
                  <button className={`btn ${available && q > 0 ? 'btn-primary' : 'btn-ghost'}`} disabled={!available || q <= 0} onClick={() => addToCart(tt)}>
                    Add to cart
                  </button>
                </div>

                {!withinSaleWindow(tt) && (
                  <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">This tier is not on sale right now.</div>
                )}
                {remaining <= 0 && (
                  <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Sold out</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}