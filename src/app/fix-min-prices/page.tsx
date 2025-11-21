'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function FixMinPrices() {
  const [log, setLog] = useState<string>('');

  async function run() {
    setLog('Running…');
    const eventsSnap = await getDocs(collection(db, 'events'));
    let updated = 0;
    for (const ev of eventsSnap.docs) {
      const evData = ev.data() as any;
      const ttSnap = await getDocs(collection(db, 'events', ev.id, 'ticketTypes'));
      const prices = ttSnap.docs.map(d => (d.data() as any).priceMinor).filter((n) => Number.isFinite(n));
      const minPriceMinor = prices.length ? Math.min(...prices) : null;
      if ((evData.minPriceMinor ?? null) !== (minPriceMinor ?? null)) {
        await updateDoc(doc(db, 'events', ev.id), { minPriceMinor });
        updated++;
      }
    }
    setLog(`Done. Updated ${updated} event(s).`);
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Fix min prices</h1>
      <button className="btn btn-primary" onClick={run}>Run backfill</button>
      <div className="card p-3 text-sm">{log || 'Idle'}</div>
    </div>
  );
}