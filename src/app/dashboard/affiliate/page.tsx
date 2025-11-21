'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { createAffiliateCodeFS, listAffiliateCodesFS } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

export default function AffiliatePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [codes, setCodes] = useState<any[]>([]);
  const [code, setCode] = useState('');

  async function load() {
    if (!user) return;
    const list = await listAffiliateCodesFS(user.uid);
    setCodes(list);
  }
  useEffect(() => { load(); }, [user]);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  const create = async () => {
    if (!code) return;
    try {
      await createAffiliateCodeFS(user.uid, code);
      toast({ message: 'Code created', variant: 'success' });
      setCode('');
      await load();
    } catch (e:any) {
      toast({ message: e?.message || 'Failed to create', variant: 'error' });
    }
  };

  const share = async (c: string) => {
    const url = `${window.location.origin}/explore?ref=${encodeURIComponent(c)}`;
    try {
      if (navigator.share) await navigator.share({ title: 'CADAK', url });
      else { await navigator.clipboard.writeText(url); toast({ message: 'Link copied', variant: 'success' }); }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-3">
        <div className="text-lg font-semibold">Create code</div>
        <div className="flex gap-2">
          <input className="input" placeholder="e.g., ABU-10" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <button className="btn btn-primary" onClick={create}>Create</button>
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))]">Share link will carry ?ref=CODE. We’ll attribute orders in the next step.</div>
      </div>

      <div className="card p-4">
        <div className="text-sm font-semibold">Your codes</div>
        <div className="mt-2 divide-y">
          {codes.length === 0 ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">No codes yet.</div>
          ) : codes.map(c => (
            <div key={c.id} className="py-2 flex items-center justify-between text-sm">
              <div>{c.code}</div>
              <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={() => share(c.code)}>Copy/Share</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}