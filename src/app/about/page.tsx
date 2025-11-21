import type { Metadata } from 'next';
import Image from 'next/image';
import Carousel from '@/components/ui/Carousel';
import CreateEventCTA from '@/components/home/CreateEventCTA';
import { Shield, Zap, Ticket, QrCode, Users, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — CADAK',
  description: 'Learn more about CADAK.',
};

export default function AboutPage() {
  const card = 'rounded-2xl border bg-[hsl(var(--card))] p-6 shadow-soft';
  const muted = 'text-[hsl(var(--muted-foreground))]';

  // Slides use public/ paths (no imports)
  const slides = [
    <ImageSlide
      key="s1"
      src="/assets/outside.png"
      title="Ticketing that scales"
      subtitle="From small gatherings to stadium shows — CADAK is built for performance."
      priority
    />,
    <ImageSlide
      key="s2"
      src="/assets/ticket card.png"
      title="Seamless QR scanning"
      subtitle="Fast, reliable validation for smooth entry at the gate."
    />,
    <ImageSlide
      key="s3"
      src="/assets/back stay.png"
      title="Loved by organizers"
      subtitle="Simple tools, clear insights, and trusted payments."
    />,
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-10">
      {/* Hero (with image carousel) */}
      <div className="space-y-5">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About CADAK</h1>
          <p className={`mt-3 ${muted}`}>We make ticketing fast, simple, and secure.</p>
        </div>

        <Carousel slides={slides} className="w-full" rounded="rounded-3xl" />
      </div>

      {/* Quick highlights / stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value="99.9%" label="Platform uptime" />
        <Stat value="2 min" label="Avg. checkout time" />
        <Stat value="50k+" label="Tickets issued" />
        <Stat value="Realtime" label="QR validation" />
      </div>

      {/* Mission + Values */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className={card}>
          <h2 className="text-lg font-semibold">Our mission</h2>
          <p className={`mt-2 leading-relaxed ${muted}`}>
            Help organizers launch events in minutes, and give attendees a smooth checkout and entry experience.
            With CADAK, ticketing just works — from listing to scanning.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[hsl(var(--accent))]" />
              Easy event setup and ticket tiers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[hsl(var(--accent))]" />
              Secure payments and instant QR delivery
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[hsl(var(--accent))]" />
              Real-time validation at the gate
            </li>
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ValueCard icon={<Zap size={18} />} title="Speed" text="From listing to checkout in seconds." />
          <ValueCard icon={<Shield size={18} />} title="Security" text="Protected payments and QR tickets." />
          <ValueCard icon={<Ticket size={18} />} title="Simplicity" text="Clean flows for organizers and fans." />
          <ValueCard icon={<Users size={18} />} title="Support" text="We’re here when you need us." />
        </div>
      </div>

      {/* How it works */}
      <div className={card}>
        <h2 className="text-lg font-semibold">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Step n="1" title="Create">Set up your event, dates, venue, and ticket tiers.</Step>
          <Step n="2" title="Sell">Share your link, accept payments, and track orders.</Step>
          <Step n="3" title="Scan">Validate tickets with the built-in QR scanner.</Step>
        </div>
      </div>

      {/* CTA (gated like landing page) */}
      <div className={`${card} text-center`}>
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
          <Sparkles size={18} />
        </div>
        <h3 className="text-lg font-semibold">Ready to host your next event?</h3>
        <p className={`mt-1 ${muted}`}>Create your event and start selling tickets with CADAK.</p>
        <div className="mt-4 flex justify-center gap-3">
          {/* Same gated CTA as homepage; change `to` if your route differs */}
          <CreateEventCTA to="/seller/events/new" className="btn btn-primary">
            Create event
          </CreateEventCTA>
          <Link href="/explore" className="btn">Explore events</Link>
        </div>
      </div>
    </section>
  );
}

/* --- Pieces --- */

function ImageSlide({
  src,
  title,
  subtitle,
  priority,
}: {
  src: string; // public/ path
  title: string;
  subtitle: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden">
      <Image
        src={src}
        alt={title}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      {/* Strong gradient so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10" />
      <div className="absolute inset-0 flex items-center justify-center px-6 py-8">
        <div className="text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--accent))] text-white font-bold">
            C
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-white/85">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-[hsl(var(--card))] p-5 text-center shadow-soft">
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-xs text-[hsl(var(--muted-foreground))]">{label}</div>
    </div>
  );
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-[hsl(var(--card))] p-5 shadow-soft">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">{icon}</div>
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-[hsl(var(--card))] p-5">
      <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-semibold">
        {n}
      </div>
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{children}</p>
    </div>
  );
}