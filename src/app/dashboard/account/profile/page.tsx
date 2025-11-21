'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getProfileFS, upsertProfileFS, type Profile } from '@/lib/firestore';
import ImageUploader from '@/components/ImageUploader';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<Profile | null>(null);
  const [useDescOnEvents, setUseDescOnEvents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const prof = await getProfileFS(user.uid);
      setP(prof ?? { uid: user.uid, name: user.displayName ?? '', about: '', phone: '', socials: {}, avatarUrl: '' });
      setLoading(false);
    })();
  }, [user]);

  if (!user) return <div className="card p-4">Please sign in.</div>;
  if (loading || !p) return <div className="card p-4">Loading…</div>;

  const save = async () => {
    try {
      setSaving(true);
      await upsertProfileFS(user.uid, {
        name: p.name, about: p.about, phone: p.phone, avatarUrl: p.avatarUrl, socials: p.socials, useDescOnEvents,
      } as any);
      toast({ message: 'Profile saved', variant: 'success' });
    } catch (e: any) {
      toast({ message: e?.message || 'Failed to save profile', variant: 'error' });
    } finally { setSaving(false); }
  };

  const onAvatarChange = async (url: string) => {
    setP({ ...p, avatarUrl: url });
    try {
      await upsertProfileFS(user.uid, { avatarUrl: url });
      toast({ message: 'Photo updated', variant: 'success' });
    } catch (e: any) {
      toast({ message: e?.message || 'Failed to update photo', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-4 space-y-3">
          <div className="aspect-square w-40 overflow-hidden rounded-xl border bg-[hsl(var(--muted))]">
            {p.avatarUrl ? <img src={p.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : null}
          </div>
          <ImageUploader value={p.avatarUrl} onChange={onAvatarChange} target="profile" />
          <div className="font-semibold">{p.name || user.displayName || user.email}</div>
        </div>

        <div className="lg:col-span-2 card p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Organizer Name</label>
            <input className="input mt-1" value={p.name || ''} onChange={(e) => setP({ ...p, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">About Organizer</label>
            <textarea className="input mt-1" rows={5} value={p.about || ''} onChange={(e) => setP({ ...p, about: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input id="useDesc" type="checkbox" checked={useDescOnEvents} onChange={(e) => setUseDescOnEvents(e.target.checked)} />
            <label htmlFor="useDesc" className="text-sm">Use this description on my event pages</label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="text-sm font-medium">Phone Number</label>
              <input className="input mt-1" value={p.phone || ''} onChange={(e) => setP({ ...p, phone: e.target.value })} />
            </div>
            <div><label className="text-sm font-medium">Facebook</label>
              <input className="input mt-1" value={p.socials?.facebook || ''} onChange={(e) => setP({ ...p, socials: { ...p.socials, facebook: e.target.value } })} />
            </div>
            <div><label className="text-sm font-medium">Twitter</label>
              <input className="input mt-1" value={p.socials?.twitter || ''} onChange={(e) => setP({ ...p, socials: { ...p.socials, twitter: e.target.value } })} />
            </div>
            <div><label className="text-sm font-medium">Instagram</label>
              <input className="input mt-1" value={p.socials?.instagram || ''} onChange={(e) => setP({ ...p, socials: { ...p.socials, instagram: e.target.value } })} />
            </div>
          </div>

          <div className="pt-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}