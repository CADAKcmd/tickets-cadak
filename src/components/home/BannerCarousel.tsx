'use client';

import Image, { type StaticImageData } from 'next/image';
import ImageFade from '@/components/ui/ImageFade';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const touchStartX = useRef<number | null>(null);
  const touchMoveX = useRef<number | null>(null);

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

  // Keyboard navigation (left/right)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

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
      {/* Slides (crossfade) - responsive height using clamp to scale with viewport */}
      <div
        className="relative w-full"
        style={{ height: 'clamp(280px, 38vw, 520px)' }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches?.[0]?.clientX ?? null;
          touchMoveX.current = null;
        }}
        onTouchMove={(e) => {
          touchMoveX.current = e.touches?.[0]?.clientX ?? null;
        }}
        onTouchEnd={() => {
          if (touchStartX.current == null || touchMoveX.current == null) return;
          const delta = touchMoveX.current - touchStartX.current;
          const threshold = 40; // px
          if (delta > threshold) {
            prev();
          } else if (delta < -threshold) {
            next();
          }
          touchStartX.current = null;
          touchMoveX.current = null;
        }}
      >
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
              {/* Use ImageFade for both remote and local images to provide LQIP and fade-in */}
              <ImageFade
                src={s.src as StaticImageData | string}
                alt={(s.title as string) || `Slide ${i + 1}`}
                fill={!isRemote}
                priority={i === 0}
                sizes="100vw"
                className="h-full w-full"
              />
              {/* Dark gradient to ensure text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10" />
            </div>
          );
        })}

        {/* Overlay content with responsive padding for visibility */}
          <div className="absolute inset-0 z-10 flex items-center md:items-center">
            <div className="w-full px-3 py-6 sm:px-6 sm:py-10 md:px-12 md:py-16">
            <div className="max-w-full md:max-w-3xl mx-auto text-white">
              {active?.title ? (
                <div className="rounded-2xl border border-white/15 bg-black/35 p-4 sm:p-6 md:p-8 backdrop-blur">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15  px-3 py-1 text-xs sm:text-sm font-semibold mt-4 text-white shadow-sm backdrop-blur">
                    Discover live moments
                  </div>
                  <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight md:text-5xl">
                    {active.title}
                  </h1>
                  {active.subtitle && (
                    <p className="mt-2 max-w-xl text-white/95 text-sm sm:text-base">{active.subtitle}</p>
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
                    <button type="submit" className="btn btn-primary sm:col-span-5 btn-block">
                      Search events
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ARIA live for screen readers */}
        <div className="sr-only" aria-live="polite">
          {`Slide ${index + 1} of ${count}${active?.title ? `: ${active.title}` : ''}`}
        </div>

        {/* Controls (hide on small screens to avoid overlap; swipe handles navigation) */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="hidden md:inline-flex absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          aria-label="Next"
          onClick={next}
          className="hidden md:inline-flex absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
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