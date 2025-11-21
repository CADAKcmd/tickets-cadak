'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getPayoutSettingsFS, savePayoutSettingsFS, listSellerOrdersFS, listPayoutRequestsFS, requestPayoutFS } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';
import { formatMoney } from '@/components/Currency';

export default function PayoutsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [settings, setSettings] = useState<any>({ bankName: '', accountName: '', accountNumber: '', currency: 'NGN' });
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [balanceMinor, setBalanceMinor] = useState(0);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const s = await getPayoutSettingsFS(user.uid);
      setSettings(s || { bankName: '', accountName: '', accountNumber: '', currency: 'NGN' });

      const orders = await listSellerOrdersFS(user.uid);
      const paidMinor = orders.filter(o => o.status === 'paid').reduce((sum:number,o:any)=>sum+(o.totalMinor||0),0);
      const platformFee = Math.round(paidMinor * 0.1); // 10% platform fee (adjust later)
      const reqs = await listPayoutRequestsFS(user.uid);
      const requested = reqs.filter(r => r.status !== 'rejected').reduce((s:number,r:any)=>s+(r.amountMinor||0),0);
      setBalanceMinor(Math.max(0, paidMinor - platformFee - requested));
      setRequests(reqs);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  const save = async () => {
    try {
      await savePayoutSettingsFS(user.uid, settings);
      toast({ message: 'Payout settings saved', variant: 'success' });
    } catch (e:any) {
      toast({ message: e?.message || 'Failed to save settings', variant: 'error' });
    }
  };

  const request = async () => {
    if (balanceMinor <= 0) { toast({ message: 'Nothing to payout', variant: 'error' }); return; }
    try {
      await requestPayoutFS(user.uid, balanceMinor);
      toast({ message: 'Payout requested', variant: 'success' });
      // refresh list
      const reqs = await listPayoutRequestsFS(user.uid);
      setRequests(reqs);
      setBalanceMinor(0);
    } catch (e:any) {
      toast({ message: e?.message || 'Failed to request payout', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-4 space-y-3">
          <div className="text-lg font-semibold">Payout settings</div>
          <div>
            <label className="text-sm font-medium">Bank name</label>
            <input className="input mt-1" value={settings.bankName} onChange={(e) => setSettings({ ...settings, bankName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Account name</label>
            <input className="input mt-1" value={settings.accountName} onChange={(e) => setSettings({ ...settings, accountName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Account number</label>
            <input className="input mt-1" value={settings.accountNumber} onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Currency</label>
            <select className="input mt-1" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
              {['NGN','USD','GBP','EUR'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={save}>Save settings</button>
        </div>

        <div className="card p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Estimated balance</div>
              <div className="text-2xl font-bold">{formatMoney(balanceMinor, settings.currency || 'NGN')}</div>
            </div>
            <button className="btn btn-primary" onClick={request} disabled={balanceMinor <= 0}>Request payout</button>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold">Requests</div>
            <div className="divide-y">
              {requests.length === 0 ? (
                <div className="text-sm text-[hsl(var(--muted-foreground))] py-2">No payout requests yet.</div>
              ) : requests.map(r => (
                <div key={r.id} className="py-2 text-sm flex items-center justify-between">
                  <div>{r.createdAt?.toDate?.().toLocaleString?.() || '—'}</div>
                  <div>{r.status}</div>
                  <div className="font-semibold">{formatMoney(r.amountMinor || 0, settings.currency || 'NGN')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}