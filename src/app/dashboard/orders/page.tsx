'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { listSellerOrdersFS } from '@/lib/firestore';
import { formatMoney } from '@/components/Currency';
import Skeleton from '@/components/Skeleton';

type OrderStatus = 'all' | 'paid' | 'pending' | 'refunded' | 'failed';

export default function OrdersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const list = await listSellerOrdersFS(user.uid);
      setRows(list);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter(r => {
      if (status !== 'all' && r.status !== status) return false;
      if (s && !(r.id?.toLowerCase().includes(s)
        || (r.buyerEmail||'').toLowerCase().includes(s)
        || (r.buyerName||'').toLowerCase().includes(s)
        || (r.eventTitle||'').toLowerCase().includes(s))) return false;
      return true;
    });
  }, [rows, q, status]);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Orders</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="Search orders, buyers…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-[hsl(var(--muted-foreground))]">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <tr key={i}><td className="px-4 py-3" colSpan={7}><Skeleton /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-[hsl(var(--muted-foreground))]" colSpan={7}>No orders</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{r.id}</td>
                    <td className="px-4 py-3">{r.buyerName || '—'}<div className="text-xs text-[hsl(var(--muted-foreground))]">{r.buyerEmail}</div></td>
                    <td className="px-4 py-3">{r.eventTitle || '—'}</td>
                    <td className="px-4 py-3">{(r.items || []).reduce((s:number,it:any)=>s+(it.quantity||0),0)}</td>
                    <td className="px-4 py-3 font-semibold">{formatMoney(r.totalMinor || 0, r.currency || 'NGN')}</td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3">{r.createdAt?.toDate?.().toLocaleString?.() || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* mobile */}
        <div className="md:hidden divide-y">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="p-4"><Skeleton className="h-6" /></div>)
          ) : filtered.length === 0 ? (
            <div className="p-4 text-[hsl(var(--muted-foreground))]">No orders</div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">{r.id}</div><div className="text-xs">{r.status}</div>
                </div>
                <div className="mt-1 font-semibold">{r.eventTitle || '—'}</div>
                <div className="text-sm">{r.buyerName || '—'} • {r.buyerEmail}</div>
                <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{r.createdAt?.toDate?.().toLocaleString?.() || '—'}</div>
                <div className="mt-1 font-semibold">{formatMoney(r.totalMinor || 0, r.currency || 'NGN')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}