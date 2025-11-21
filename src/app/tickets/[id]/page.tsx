'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'react-qr-code';

export default function TicketViewPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [t, setT] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!id || !user) return;
      setLoading(true);
      const snap = await getDoc(doc(db, 'tickets', id));
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.buyerId === user.uid || data.sellerId === user.uid) setT({ id, ...data });
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (!user) return <div className="card p-4">Please sign in.</div>;
  if (!id) return <div className="card p-4">Invalid ticket.</div>;
  if (loading) return <div className="card p-4">Loading…</div>;
  if (!t) return <div className="card p-4">Ticket not found.</div>;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="card p-4 text-center">
        <div className="text-sm text-[hsl(var(--muted-foreground))]">{t.eventTitle}</div>
        <div className="text-lg font-semibold">{t.typeName}</div>
        <div className="mt-2">
          <span className={`badge ${t.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {t.status === 'checked_in' ? 'Checked in' : 'Unused'}
          </span>
        </div>
        <div className="mt-4 flex justify-center p-4 bg-[hsl(var(--card))]">
          <QRCode value={t.qrPayload} size={180} />
        </div>
        <div className="mt-2 break-all text-xs text-[hsl(var(--muted-foreground))]">ID: {t.id}</div>
      </div>
    </div>
  );
}