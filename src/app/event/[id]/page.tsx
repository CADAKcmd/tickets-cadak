'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getEventWithTicketsFS } from '@/lib/firestore';
import { Event, TicketType } from '@/lib/types';
import { useCart } from '@/store/cart';
import { formatMoney } from '@/components/Currency';
import { useToast } from '@/components/ui/Toast';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const add = useCart((s) => s.add);
  const toast = useToast();

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

  const addTicket = (tt: TicketType) => {
    const soldOut = (tt.quantityTotal ?? 0) - (tt.quantitySold ?? 0) <= 0;
    if (soldOut) return;
    add({
      eventId: event.id,
      eventTitle: event.title,
      ticketTypeId: tt.id,
      name: tt.name,
      unitPriceMinor: tt.priceMinor,
      quantity: 1,
      currency: tt.currency,
    });
    toast({ message: `Added 1 × ${tt.name} to checkout`, variant: 'success' });
  };

  return (
    <div className="space-y-6">
      {event.coverImage && <img src={event.coverImage} alt="" className="h-64 w-full rounded-lg object-cover" />}
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
        <h2 className="mb-2 text-xl font-semibold">Tickets</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {event.ticketTypes.map((tt) => {
            const remaining = (tt.quantityTotal ?? 0) - (tt.quantitySold ?? 0);
            const soldOut = remaining <= 0;
            return (
              <div key={tt.id} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{tt.name}</div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formatMoney(tt.priceMinor, tt.currency)} • {remaining} left
                  </div>
                </div>
                <button disabled={soldOut} onClick={() => addTicket(tt)} className={`btn ${soldOut ? 'btn-ghost' : 'btn-primary'}`}>
                  {soldOut ? 'Sold out' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}