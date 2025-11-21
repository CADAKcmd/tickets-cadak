'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { listPublishedEventsFS } from '@/lib/firestore';
import type { Event } from '@/lib/types';
import EventCard from '@/components/EventCard';
import {
  Search, MapPin, Wand2, Music, Trophy, Mic, PartyPopper,
  Clapperboard, Laugh, Shuffle, Calendar
} from 'lucide-react';

const categories = ['all','music','sport','conference','festival','theatre','comedy'] as const;
type Category = typeof categories[number];
function isCategory(v: string | null): v is Category {
  return v !== null && (categories as readonly string[]).includes(v);
}

export default function ExplorePage() {
  const router = useRouter();
  const sp = useSearchParams();

  // raw data
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // filters (controlled)
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [sort, setSort] = useState<'soon' | 'new'>('soon');

  // hydrate from URL once
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated) return;
    const q_ = sp.get('q') || '';
    const city_ = sp.get('city') || '';
    const cat_ = sp.get('category');
    const sort_ = sp.get('sort');
    setQ(q_);
    setCity(city_);
    setCategory(isCategory(cat_) ? cat_ : 'all');
    setSort(sort_ === 'new' ? 'new' : 'soon');
    setHydrated(true);
  }, [sp, hydrated]);

  // keep URL in sync with filters (no history spam)
  useEffect(() => {
    if (!hydrated) return;
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (city.trim()) p.set('city', city.trim());
    if (category !== 'all') p.set('category', category);
    if (sort !== 'soon') p.set('sort', sort);
    const qs = p.toString();
    router.replace(qs ? `/explore?${qs}` : '/explore', { scroll: false });
  }, [hydrated, q, city, category, sort, router]);

  // fetch once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await listPublishedEventsFS();
        setAllEvents(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // derived
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const cl = city.trim().toLowerCase();

    const byFilter = allEvents.filter((e: any) => {
      if (category !== 'all' && e.category !== category) return false;

      if (ql) {
        const hay = `${e.title ?? ''} ${e.description ?? ''}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }

      if (cl) {
        const cc = `${e.city ?? ''}`.toLowerCase();
        if (!cc.includes(cl)) return false;
      }
      return true;
    });

    const getStart = (e: any) => {
      const raw = e?.startAt ?? e?.startDate ?? e?.date;
      const d = typeof raw === 'number' ? new Date(raw) : new Date(raw || 0);
      return d.getTime() || Number.MAX_SAFE_INTEGER;
    };

    if (sort === 'soon') return byFilter.slice().sort((a, b) => getStart(a) - getStart(b));

    // 'new'
    return byFilter.slice().sort((a: any, b: any) => {
      const aa = a?.createdAt ?? 0;
      const bb = b?.createdAt ?? 0;
      return new Date(bb).getTime() - new Date(aa).getTime();
    });
  }, [allEvents, q, city, category, sort]);

  const randomSurprise = () => {
    if (!filtered.length) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    router.push(`/event/${(pick as any).id}`);
  };

  const iconFor = (c: Category) => {
    switch (c) {
      case 'music': return <Music size={16} />;
      case 'sport': return <Trophy size={16} />;
      case 'conference': return <Mic size={16} />;
      case 'festival': return <PartyPopper size={16} />;
      case 'theatre': return <Clapperboard size={16} />;
      case 'comedy': return <Laugh size={16} />;
      default: return <Wand2 size={16} />;
    }
  };

  const topCities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of allEvents as any[]) {
      const c = (e.city || '').trim();
      if (!c) continue;
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);
  }, [allEvents]);

  return (
    <div className="space-y-8">
      {/* Hero-like filter card */}
      <section className="relative overflow-hidden rounded-3xl border bg-[hsl(var(--card))] p-6 shadow-soft">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--muted))]" />
        <div className="absolute -right-16 bottom-6 h-56 w-56 rounded-full bg-[hsl(var(--muted))]" />
        <div className="relative z-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--accent))] text-white font-bold">
              C
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Explore Events</h1>
            <p className="max-w-2xl text-[hsl(var(--muted-foreground))]">
              Discover music, sports, comedy, festivals and more. Find your next unforgettable experience.
            </p>
          </div>

          {/* Filters row */}
          <div className="mx-auto mt-5 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-5">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search size={16} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                className="input pl-8"
                placeholder="Search events"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {/* City */}
            <div className="relative sm:col-span-2">
              <MapPin size={16} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                className="input pl-8"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSort('soon')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-[hsl(var(--muted))] ${sort === 'soon' ? 'bg-[hsl(var(--muted))]' : ''}`}
              >
                <Calendar size={14} /> Soonest
              </button>
              <button
                type="button"
                onClick={() => setSort('new')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-[hsl(var(--muted))] ${sort === 'new' ? 'bg-[hsl(var(--muted))]' : ''}`}
              >
                New
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="mx-auto mt-4 flex max-w-4xl snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
            {categories.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition
                    ${active ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}
                  `}
                >
                  <span className="inline-flex items-center gap-2">
                    {iconFor(c)} <span className="capitalize">{c}</span>
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => { setQ(''); setCity(''); setCategory('all'); setSort('soon'); }}
              className="ml-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            >
              Clear
            </button>

            <button
              onClick={randomSurprise}
              className="ml-auto whitespace-nowrap rounded-full border px-3 py-1.5 text-sm hover:bg-[hsl(var(--muted))]"
              title="I’m feeling lucky"
            >
              <span className="inline-flex items-center gap-2">
                <Shuffle size={14} /> Surprise me
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Result meta */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          {loading ? 'Loading…' : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState onReset={() => { setQ(''); setCity(''); setCategory('all'); setSort('soon'); }} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => <EventCard key={(e as any).id} event={e} />)}
        </div>
      )}

      {/* Popular cities quick picks */}
      {topCities.length > 0 && (
        <section className="rounded-2xl border bg-[hsl(var(--card))] p-4 shadow-soft">
          <div className="text-sm font-semibold">Popular cities</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {topCities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className="rounded-full border px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- UI bits ---------- */

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border bg-[hsl(var(--card))] shadow-soft">
          <div className="h-40 w-full rounded-t-2xl bg-[hsl(var(--muted))]" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/5 rounded bg-[hsl(var(--muted))]" />
            <div className="h-3 w-2/5 rounded bg-[hsl(var(--muted))]" />
            <div className="h-3 w-4/5 rounded bg-[hsl(var(--muted))]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border bg-[hsl(var(--card))] p-8 text-center shadow-soft">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
        <Wand2 size={18} />
      </div>
      <div className="text-lg font-semibold">No events found</div>
      <p className="mt-1 text-[hsl(var(--muted-foreground))]">
        Try a different search, switch category, or explore nearby cities.
      </p>
      <button onClick={onReset} className="btn btn-primary mt-4">Reset filters</button>
    </div>
  );
}