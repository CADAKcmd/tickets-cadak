'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { Event } from '@/lib/types';
import { updateEventFS, deleteEventFS } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

export default function MyEventsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setErr(null); setLoading(true);
    try {
      const qy = query(collection(db, 'events'), where('sellerId', '==', user.uid), orderBy('startAt', 'desc'));
      const snap = await getDocs(qy);
      setEvents(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Event[]);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load events');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [user]);

  if (!user) return <div className="card p-4">Sign in</div>;

  const onDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteEventFS(confirmId, user.uid);
      toast({ message: 'Event deleted', variant: 'success' });
      setConfirmId(null);
      await load();
    } catch (e: any) {
      toast({ message: e?.message || 'Failed to delete event', variant: 'error' });
      setConfirmId(null);
    }
  };

  const onPublish = async (id: string, to: 'published' | 'draft') => {
    try {
      await updateEventFS(id, { status: to });
      toast({ message: to === 'published' ? 'Event published' : 'Event set to draft', variant: 'success' });
      await load();
    } catch (e: any) {
      toast({ message: e?.message || 'Failed to update event', variant: 'error' });
    }
  };

  const tryMakeIndexLink = (msg: string) => {
    const m = msg.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/i);
    if (!m) return msg;
    return (
      <span>
        This query requires an index. <a className="underline" href={m[0]} target="_blank" rel="noreferrer">Click here to create it</a>, wait until it’s “Enabled”, then refresh.
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Events</h2>
        <Link href="/dashboard/events/new" className="btn btn-primary">Create Event</Link>
      </div>

      <div className="card divide-y">
        {loading ? (
          <div className="p-4">Loading…</div>
        ) : err ? (
          <div className="p-4 text-red-500 text-sm">{tryMakeIndexLink(err)}</div>
        ) : events.length === 0 ? (
          <div className="p-4 text-[hsl(var(--muted-foreground))]">No events yet.</div>
        ) : (
          events.map((e) => (
            <div key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{e.city} • {new Date(e.startAt).toLocaleString()}</div>
                <div className="mt-1 inline-flex rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs">{e.status}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/event/${e.id}`} className="btn btn-ghost">View</Link>
                {e.status === 'published'
                  ? <button onClick={() => onPublish(e.id, 'draft')} className="btn btn-ghost">Unpublish</button>
                  : <button onClick={() => onPublish(e.id, 'published')} className="btn btn-primary">Publish</button>}
                <button onClick={() => setConfirmId(e.id)} className="btn btn-ghost">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete this event?"
        body="This will remove the event and its ticket types."
        confirmText="Delete"
        onConfirm={onDelete}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}