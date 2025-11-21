import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Poppins } from 'next/font/google';
import Footer from '@/components/Footer';
import AppShell from '@/components/AppShell';

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
          <Footer />
        </Providers>
      </body>
    </html>
  );
}