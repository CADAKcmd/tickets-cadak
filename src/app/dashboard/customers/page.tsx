'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { listCustomersFS } from '@/lib/firestore';
import Skeleton from '@/components/Skeleton';

export default function CustomersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const list = await listCustomersFS(user.uid);
      setRows(list);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter(r => !s || (r.email||'').toLowerCase().includes(s) || (r.name||'').toLowerCase().includes(s));
  }, [rows, q]);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Customers</h2>
        <input className="input" placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-[hsl(var(--muted-foreground))]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Tickets</th>
                <th className="px-4 py-3">Last order</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <tr key={i}><td className="px-4 py-3" colSpan={5}><Skeleton /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-[hsl(var(--muted-foreground))]" colSpan={5}>No customers.</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.email} className="border-t">
                    <td className="px-4 py-3">{r.name || '—'}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.orders}</td>
                    <td className="px-4 py-3">{r.tickets}</td>
                    <td className="px-4 py-3">{r.lastOrderAt?.toDate?.().toLocaleDateString?.() || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="p-4"><Skeleton className="h-6" /></div>)
          ) : filtered.length === 0 ? (
            <div className="p-4 text-[hsl(var(--muted-foreground))]">No customers.</div>
          ) : (
            filtered.map(r => (
              <div key={r.email} className="p-4">
                <div className="font-semibold">{r.name || '—'}</div>
                <div className="text-sm">{r.email}</div>
                <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Orders {r.orders} • Tickets {r.tickets}</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Last order {r.lastOrderAt?.toDate?.().toLocaleDateString?.() || '—'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}