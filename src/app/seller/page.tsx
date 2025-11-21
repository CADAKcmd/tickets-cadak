'use client';

import Link from 'next/link';
import RequireAuth from '@/components/RequireAuth';

export default function SellerPage() {
  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <Link href="/seller/events/new" className="btn btn-primary">Create Event</Link>
        </div>

        <div className="card p-4">
          <p>Welcome! Create your first event to get started.</p>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">
            After publishing, your event appears on Explore for buyers.
          </p>
        </div>
      </div>
    </RequireAuth>
  );
}2