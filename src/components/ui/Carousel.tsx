'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
  slides: React.ReactNode[];
  className?: string;
  autoplay?: boolean;
  interval?: number; // ms
  rounded?: string;  // e.g., "rounded-2xl"
};

export default function Carousel({
  slides,
  className,
  autoplay = true,
  interval = 3500,
  rounded = 'rounded-2xl',
}: CarouselProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const goTo = useCallback((i: number) => {
    const wrap = ref.current;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const next = Math.max(0, Math.min(slides.length - 1, i));
    wrap.scrollTo({ left: next * w, behavior: 'smooth' });
    setIndex(next);
  }, [slides.length]);

  const next = useCallback(() => goTo((index + 1) % slides.length), [goTo, index, slides.length]);
  const prev = useCallback(() => goTo((index - 1 + slides.length) % slides.length), [goTo, index, slides.length]);

  // update index on manual scroll
  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;

    const onScroll = () => {
      const w = wrap.clientWidth || 1;
      const i = Math.round(wrap.scrollLeft / w);
      setIndex(i);
    };
    wrap.addEventListener('scroll', onScroll, { passive: true });
    return () => wrap.removeEventListener('scroll', onScroll);
  }, []);

  // autoplay
  useEffect(() => {
    if (!autoplay || hovered) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoplay, hovered, next, interval]);

  return (
    <div
      className={`relative border bg-[hsl(var(--card))] shadow-soft ${rounded} ${className || ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="region"
      aria-roledescription="carousel"
    >
      <div
        ref={ref}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ scrollbarWidth: 'none' }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="min-w-full snap-center">
            {slide}
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-[hsl(var(--card))]/70 p-2 backdrop-blur hover:bg-[hsl(var(--muted))]"
        onClick={prev}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-[hsl(var(--card))]/70 p-2 backdrop-blur hover:bg-[hsl(var(--muted))]"
        onClick={next}
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`pointer-events-auto h-2 w-2 rounded-full transition
              ${i === index ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted-foreground))]/50'}`}
          />
        ))}
      </div>
    </div>
  );
}