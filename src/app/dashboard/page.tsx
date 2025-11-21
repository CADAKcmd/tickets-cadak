'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getSellerStatsFS } from '@/lib/firestore';
import { SparklineArea, Bars } from '@/components/charts/SimpleCharts';

function toK(minor: number, currency: string) {
  const amt = minor / 100;
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amt);
}

export default function OverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [currency, setCurrency] = useState('NGN');

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const s = await getSellerStatsFS(user.uid);
      setStats(s);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  const labels = useMemo(() => {
    if (!stats?.startDate) return [];
    const out: string[] = [];
    const start = new Date(stats.startDate);
    for (let i = 0; i < (stats.dailyRevenue?.length || 0); i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      out.push(`${d.getMonth()+1}/${d.getDate()}`);
    }
    return out;
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Revenue</div>
          <div className="mt-1 text-2xl font-bold">{loading ? '—' : toK(stats.revenueMinor || 0, currency)}</div>
          {!loading && <SparklineArea data={(stats.dailyRevenue || []).map((n: number) => n/100)} />}
        </div>
        <div className="card p-4">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Tickets sold</div>
          <div className="mt-1 text-2xl font-bold">{loading ? '—' : stats.ticketsSold}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Active events</div>
          <div className="mt-1 text-2xl font-bold">{loading ? '—' : stats.activeEvents}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Orders (30d)</div>
          <div className="mt-1 text-2xl font-bold">{loading ? '—' : (stats.dailyOrders || []).reduce((s:number,n:number)=>s+n,0)}</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm font-semibold">Revenue (last 30 days)</div>
        {!loading && <Bars values={(stats.dailyRevenue || []).map((n:number)=>Math.round(n/100))} labels={labels} className="w-full h-56 mt-2" />}
      </div>
    </div>
  );
}