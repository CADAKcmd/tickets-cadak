import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Poppins } from 'next/font/google';
import Footer from '@/components/Footer';
import AppShell from '@/components/AppShell';
import React from 'react';
import { db, auth } from '@/lib/firebase';

function EnvNotice() {
  // Show notice when firebase env not configured
  const missing = !db || !auth;
  if (!missing) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-lg border bg-amber-50 px-4 py-2 text-sm text-amber-800 shadow">
      Warning: Firebase is not configured — some features (auth, database, payments) are disabled. Configure env vars to enable.
    </div>
  );
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'CADAK — Tickets',
  description: 'Discover events. Buy tickets securely.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${poppins.variable} font-sans bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
          <EnvNotice />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}