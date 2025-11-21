import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, MessageSquare, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact — CADAK',
  description: 'Get in touch with the CADAK team.',
};

export default function ContactPage() {
  const card = 'rounded-2xl border bg-[hsl(var(--card))] p-6 shadow-soft';

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Contact CADAK
        </h1>
        <p className="mt-3 text-[hsl(var(--muted-foreground))]">
          We’re here to help with support, partnerships, and general questions.
        </p>
      </header>

      {/* Info + Form */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: contact options */}
        <div className="space-y-4">
          <div className={card}>
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <Mail size={18} /> Email support
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              For help with purchases, events, or your account.
            </p>
            <a
              href="mailto:support@cadak.app"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-[hsl(var(--muted))]"
            >
              support@cadak.app
            </a>
          </div>

          <div className={card}>
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <MessageSquare size={18} /> Partnerships
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Sponsorships, collaborations, and sales inquiries.
            </p>
            <a
              href="mailto:partnerships@cadak.app"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-[hsl(var(--muted))]"
            >
              partnerships@cadak.app
            </a>
          </div>

          <div className={card}>
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <Phone size={18} /> Call hours
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Mon–Fri, 9:00–17:00 (WAT)
            </p>
            <p className="mt-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-lg border px-3 py-2">
                <Clock size={16} /> +234 (000) 000 0000
              </span>
            </p>
          </div>

          <div className={card}>
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <MapPin size={18} /> Office
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Lagos, Nigeria
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border">
              <iframe
                title="CADAK office map"
                className="h-56 w-full"
                referrerPolicy="no-referrer-when-downgrade"
                loading="lazy"
                src="https://www.google.com/maps?q=Lagos%2C%20Nigeria&output=embed"
              />
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className={card}>
          <h2 className="text-lg font-semibold">Send us a message</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Fill out the form and our team will get back to you.
          </p>

          {/* Simple mailto form (no backend required) */}
          <form
            className="mt-4 space-y-3"
            action="mailto:support@cadak.app"
            method="post"
            encType="text/plain"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input className="input" name="name" placeholder="Your name" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input className="input" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <input className="input" name="subject" placeholder="How can we help?" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea className="input min-h-[120px]" name="message" placeholder="Write your message..." required />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Send message
            </button>

            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Tip: You can also email us directly at support@cadak.app
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}