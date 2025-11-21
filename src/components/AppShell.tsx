'use client';

import dynamic from 'next/dynamic';

// Load Navbar only on the client to avoid any RSC boundary issues
const Navbar = dynamic(() => import('@/components/Navbar'), {
  ssr: false,
  loading: () => <div className="h-14" />, // keeps layout height stable
});

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container py-6">{children}</main>
    </>
  );
}