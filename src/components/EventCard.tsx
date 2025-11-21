import Link from 'next/link';
import { Event } from '@/lib/types';
import { formatMoney } from './Currency';

export default function EventCard({ event }: { event: Event }) {
  const hasPrice = Number.isFinite(event.minPriceMinor);
  return (
    <Link href={`/event/${event.id}`} className="group block overflow-hidden rounded-xl border bg-[hsl(var(--card))] shadow-soft transition hover:shadow-neon">
      {event.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.coverImage} alt={event.title} className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <div className="text-xs text-[hsl(var(--muted-foreground))]">{event.city || ''}{event.city ? ' • ' : ''}{event.venue}</div>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold">{event.title}</h3>
        <div className="mt-2 font-medium text-[hsl(var(--accent))]">
          {hasPrice ? `From ${formatMoney(event.minPriceMinor!, event.currency)}` : 'Tickets coming soon'}
        </div>
      </div>
    </Link>
  );
}