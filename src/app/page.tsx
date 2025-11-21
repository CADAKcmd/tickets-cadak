import Link from 'next/link';
import Image from 'next/image';
import TrendingEvents from '@/components/home/Trending';
import CountUp from '@/components/CountUp';
import BannerCarousel from '@/components/home/BannerCarousel';
import CreateEventCTA from '@/components/home/CreateEventCTA';
import {
  Sparkles, Music2, Trophy, Presentation, PartyPopper, Laugh
} from 'lucide-react';

export default function HomePage() {
  const slides = [
    {
      src: '/assets/party.png',
      title: 'Find your next unforgettable experience',
      subtitle: 'Music, sports, comedy, festivals and more — secure tickets, instant QR.',
    },
    {
      src: '/assets/checking.png',
      title: 'Built for fans. Loved by organizers.',
      subtitle: 'Blazing checkout, reliable scanning, clean insights.',
    },
    {
      src: '/assets/stadium.png',
      title: 'Ticketing that scales',
      subtitle: 'From small gigs to stadiums — CADAK has you covered.',
    },
  ];

  return (
    <section className="space-y-16">
      {/* HERO with image banners + search */}
      <BannerCarousel slides={slides} />

      {/* PROMO banner grid (like side banners) */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PromoCard
          href="/explore?category=music"
          title="Feel the music"
          subtitle="Live shows and concerts"
          src="/assets/african.png"
        />
        <PromoCard
          href="/explore?category=sport"
          title="Game day energy"
          subtitle="Top matches and tournaments"
          src="/assets/games.png"
        />
        <PromoCard
          href="/explore?category=comedy"
          title="Laugh out loud"
          subtitle="Stand‑up and comedy nights"
          src="/assets/comedy.png"
        />
      </section>

      {/* MARQUEE */}
      <div className="rounded-xl border p-3">
        <div className="relative overflow-hidden">
          <div className="flex animate-cadak-slide whitespace-nowrap">
            {['Afrobeat Fest', 'Tech Conference', 'Derby Night', 'Comedy Live', 'Startup Summit', 'Jazz & Chill'].map((t, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
                {t}
              </span>
            ))}
            {['Afrobeat Fest', 'Tech Conference', 'Derby Night', 'Comedy Live', 'Startup Summit', 'Jazz & Chill'].map((t, i) => (
              <span key={`d2-${i}`} className="mx-6 inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Top categories</h2>
        <div className="flex flex-wrap gap-3">
          <Category href="/explore?category=music" icon={<Music2 size={16} />} label="Music" />
          <Category href="/explore?category=sport" icon={<Trophy size={16} />} label="Sport" />
          <Category href="/explore?category=conference" icon={<Presentation size={16} />} label="Conference" />
          <Category href="/explore?category=festival" icon={<PartyPopper size={16} />} label="Festival" />
          <Category href="/explore?category=comedy" icon={<Laugh size={16} />} label="Comedy" />
        </div>
      </div>

      {/* TRENDING (live) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trending events</h2>
          <Link href="/explore" className="text-sm text-[hsl(var(--accent))] hover:underline">See all</Link>
        </div>
        <TrendingEvents limit={6} />
      </div>

      {/* HOW IT WORKS */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">How CADAK works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Step n={1} title="Discover" text="Explore trending events across music, sports, tech, and comedy." />
          <Step n={2} title="Grab tickets" text="Pay securely. Tickets are issued instantly to your email." />
          <Step n={3} title="Scan & enjoy" text="Breeze through entry with secure QR verification." />
        </div>
      </div>

      {/* WHY CADAK */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Why organizers love CADAK</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <WhyCard title="Secure QR" text="Encrypted, single‑use verification. No fakes, no duplicates." />
          <WhyCard title="Live analytics" text="Real‑time revenue and engagement. Clean and actionable." />
          <WhyCard title="NGN‑first + global" text="Paystack for NGN today, Stripe for global tomorrow." />
          <WhyCard title="Blazing UI" text="Electric Blue + Purple experience your fans will love." />
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden rounded-2xl border p-8 md:p-10">
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,theme(colors.cyan.400/.3),transparent)] blur-2xl"></div>
        <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,theme(colors.purple.400/.3),transparent)] blur-2xl"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-[hsl(var(--muted-foreground))] backdrop-blur">
            <Sparkles size={14} className="text-[hsl(var(--accent))]" />
            Ready to host?
          </div>
          <h3 className="mt-3 text-2xl font-extrabold">Host something unforgettable.</h3>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            Set up your next event in minutes. CADAK handles tickets, payments, and entry — you focus on the experience.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {/* Gated create-event button */}
            <CreateEventCTA to="/seller/events/new" className="btn btn-primary rounded-xl" />
            <Link href="/dashboard" className="btn btn-ghost rounded-xl">Go to dashboard</Link>
          </div>

          {/* Quick stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Active events" value={24} />
            <Stat label="Tickets issued" value={18000} />
            <Stat label="Cities" value={12} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- UI bits --- */

function PromoCard({
  href, src, title, subtitle,
}: { href: string; src: string; title: string; subtitle?: string }) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-2xl border bg-[hsl(var(--card))] shadow-soft">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Image src={src} alt={title} width={1200} height={800} className="h-44 w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="absolute bottom-3 left-3">
        <div className="text-white">{title}</div>
        {subtitle && <div className="text-xs text-white/80">{subtitle}</div>}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-[hsl(var(--muted-foreground))]">{label}</div>
      <div className="mt-1 text-2xl font-bold">
        <CountUp end={value} />
        {label.includes('Tickets') && <span>+</span>}
      </div>
    </div>
  );
}

function Category({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-[hsl(var(--muted))]"
    >
      <span className="text-[hsl(var(--accent))]">{icon}</span>
      {label}
    </Link>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="card p-4">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] text-sm font-bold">
        {n}
      </div>
      <div className="mt-2 text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
  );
}

function WhyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card p-4">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
  );
}