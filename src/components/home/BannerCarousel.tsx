'use client';

import Image, { type StaticImageData } from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, MapPin } from 'lucide-react';

type Slide = {
  src: string | StaticImageData;
  title?: string;
  subtitle?: string;
  href?: string;
};

const categories = ['all', 'music', 'sport', 'conference', 'festival', 'theatre', 'comedy'] as const;
type Category = typeof categories[number];

export default function BannerCarousel({
  slides,
  interval = 4500,
}: {
  slides: Slide[];
  interval?: number;
}) {
  const router = useRouter();

  // filters in hero
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<Category>('all');

  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (i: number) => {
      setIndex((i + count) % count);
    },
    [count]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    const id = setInterval(() => setIndex((v) => (v + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval]);

  const onSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (city.trim()) p.set('city', city.trim());
    if (category !== 'all') p.set('category', category);
    router.push(`/explore${p.toString() ? `?${p.toString()}` : ''}`);
  };

  const active = useMemo(() => slides[index], [slides, index]);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-[hsl(var(--card))] shadow-soft">
      {/* Slides (crossfade) */}
      <div className="relative h-[360px] w-full sm:h-[420px] md:h-[520px]">
        {slides.map((s, i) => {
          const isRemote = typeof s.src === 'string' && /^https?:\/\//i.test(s.src);
          return (
            <div
              key={(typeof s.src === 'string' ? s.src : `static-${i}`) + i}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={i !== index}
            >
              {isRemote ? (
                // Remote URL: use <img> to avoid next.config domain setup
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.src as string}
                  alt={(s.title as string) || `Slide ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                // Local public path "/..." or StaticImageData import
                <Image
                  src={s.src as StaticImageData | string}
                  alt={(s.title as string) || `Slide ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  quality={85}
                  className="object-cover"
                />
              )}
              {/* Dark gradient to ensure text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10" />
            </div>
          );
        })}

        {/* Overlay content with generous padding for visibility */}
        <div className="absolute inset-0 z-10 flex items-end md:items-center">
          <div className="w-full px-6 py-10 md:px-12 md:py-16">
            <div className="max-w-3xl text-white">
              {active?.title ? (
                <div className="rounded-2xl border border-white/15 bg-black/35 p-4 sm:p-6 md:p-8 backdrop-blur">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/85">
                    Discover live moments
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
                    {active.title}
                  </h1>
                  {active.subtitle && (
                    <p className="mt-2 max-w-xl text-white/85">{active.subtitle}</p>
                  )}

                  {/* Search form */}
                  <form
                    onSubmit={onSearch}
                    className="mt-4 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-5"
                  >
                    <div className="relative sm:col-span-2">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/70"
                      />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search events"
                        className="w-full rounded-lg border border-white/25 bg-white/10 px-8 py-2 text-white placeholder-white/70 outline-none backdrop-blur focus:border-white/45"
                      />
                    </div>
                    <div className="relative sm:col-span-2">
                      <MapPin
                        size={16}
                        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/70"
                      />
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full rounded-lg border border-white/25 bg-white/10 px-8 py-2 text-white placeholder-white/70 outline-none backdrop-blur focus:border-white/45"
                      />
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white outline-none backdrop-blur focus:border-white/45"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className="text-black">
                          {c}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary sm:col-span-5">
                      Search events
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Controls */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          aria-label="Next"
          onClick={next}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 w-2 rounded-full ${
                i === index ? 'bg-white' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}