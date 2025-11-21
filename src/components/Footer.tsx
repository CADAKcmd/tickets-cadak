'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mail, MapPin, Twitter, Facebook, Instagram, Youtube, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const year = new Date().getFullYear();
   const pathname = usePathname();
  if (pathname?.startsWith('/auth')) return null;

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    alert('Thanks! We’ll keep you posted.');
    setEmail('');
  }

  return (
    <footer className="border-t bg-[hsl(var(--card))]">
      {/* Top strip */}
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand + blurb */}
          <div>
            <Link href="/" aria-label="CADAK">
              <div className="text-xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                  CADAK
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              Discover events. Buy securely. Scan effortlessly.
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <MapPin size={16} />
              <span>Worldwide</span>
            </div>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-3">
              <a href="https://twitter.com/" target="_blank" rel="noreferrer" aria-label="Twitter"
                 className="rounded-full bg-[hsl(var(--muted))] p-2 hover:brightness-110">
                <Twitter size={16} />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook"
                 className="rounded-full bg-[hsl(var(--muted))] p-2 hover:brightness-110">
                <Facebook size={16} />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"
                 className="rounded-full bg-[hsl(var(--muted))] p-2 hover:brightness-110">
                <Instagram size={16} />
              </a>
              <a href="https://youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube"
                 className="rounded-full bg-[hsl(var(--muted))] p-2 hover:brightness-110">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Product
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/explore" className="hover:underline">Explore</Link></li>
              <li><Link href="/dashboard/events/new" className="hover:underline">Create Event</Link></li>
              <li><Link href="/dashboard/scan" className="hover:underline">Scan & Verify</Link></li>
              <li><Link href="/dashboard" className="hover:underline">Organizer Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Resources
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/support" className="hover:underline">Help Center</Link></li>
              <li><Link href="/dashboard/affiliate" className="hover:underline">Affiliate</Link></li>
              <li><Link href="/dashboard/access" className="hover:underline">Access Managers</Link></li>
              <li><Link href="/dashboard/payouts" className="hover:underline">Payouts</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Stay in the loop
            </h3>
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              Get updates on trending events and special offers.
            </p>
            <form onSubmit={subscribe} className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input flex-1"
                aria-label="Email"
              />
              <button className="btn btn-primary" type="submit">
                Subscribe
              </button>
            </form>
            <div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
              <Mail size={14} className="mr-1 inline" /> support@cadak.app
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              © {year} CADAK. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs md:justify-end">
              <Link href="/terms" className="hover:underline">Terms</Link>
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Link href="/cookies" className="hover:underline">Cookies</Link>
              <a href="/status" className="flex items-center gap-1 hover:underline">
                Status <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}