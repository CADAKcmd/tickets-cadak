'use client';

import { useEffect, useState } from 'react';
import { listPublishedEventsFS } from '@/lib/firestore';
import { Event } from '@/lib/types';
import EventCard from '@/components/EventCard';

export default function TrendingEvents({ limit = 6 }: { limit?: number }) {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await listPublishedEventsFS();
        setEvents(list.slice(0, limit));
      } catch (e: any) {
        setErr(e?.message || 'Failed to load trending events');
      }
    })();
  }, [limit]);

  if (err) {
    const link = err.match(/https:\/\/console\.firebase\.google\.com\/[^\s"]+/)?.[0];
    return (
      <div className="card p-4 text-sm">
        {link ? (
          <>This query needs a Firestore index. <a className="underline text-[hsl(var(--accent))]" href={link} target="_blank">Create it</a> and refresh.</>
        ) : <>We couldn’t load events right now.</>}
      </div>
    );
  }

  if (!events) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card h-40 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <div className="card p-4 text-[hsl(var(--muted-foreground))]">No events yet. Be the first to create one!</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => <EventCard key={e.id} event={e} />)}
    </div>
  );
}