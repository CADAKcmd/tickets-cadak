'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { inviteAccessFS, listAccessForSellerFS, listAccessInvitesForUserFS, acceptAccessInviteFS, removeAccessMemberFS } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

export default function AccessManagersPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [sellerList, setSellerList] = useState<any[]>([]);
  const [myInvites, setMyInvites] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'scanner'|'manager'>('scanner');

  async function load() {
    if (!user) return;
    const ls = await listAccessForSellerFS(user.uid);
    setSellerList(ls);
    const invites = await listAccessInvitesForUserFS(user.email || '');
    setMyInvites(invites);
  }

  useEffect(() => { load(); }, [user]);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  const invite = async () => {
    if (!email) return;
    try {
      await inviteAccessFS(user.uid, user.email || '', email, role);
      toast({ message: 'Invite sent', variant: 'success' });
      setEmail('');
      await load();
    } catch (e:any) {
      toast({ message: e?.message || 'Failed to invite', variant: 'error' });
    }
  };

  const accept = async (id: string) => {
    try {
      await acceptAccessInviteFS(id, user!.uid);
      toast({ message: 'Access accepted', variant: 'success' });
      await load();
    } catch (e:any) {
      toast({ message: e?.message || 'Failed to accept', variant: 'error' });
    }
  };

  const remove = async (id: string) => {
    try {
      await removeAccessMemberFS(id);
      toast({ message: 'Removed', variant: 'success' });
      await load();
    } catch (e:any) {
      toast({ message: e?.message || 'Failed to remove', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-3">
        <div className="text-lg font-semibold">Invite staff</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="input" placeholder="Staff email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="scanner">Scanner</option>
            <option value="manager">Manager</option>
          </select>
          <button className="btn btn-primary" onClick={invite}>Invite</button>
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))]">Scanner can check-in tickets. Manager (coming soon) can edit events.</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-semibold">Your team</div>
          <div className="mt-2 divide-y">
            {sellerList.length === 0 ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">No team members yet.</div>
            ) : sellerList.map(m => (
              <div key={m.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div>{m.memberEmail}</div>
                  <div className="text-[hsl(var(--muted-foreground))]">{m.role} • {m.status}</div>
                </div>
                <button className="btn btn-ghost" onClick={() => remove(m.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-semibold">Invites for you</div>
          <div className="mt-2 divide-y">
            {myInvites.length === 0 ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">No invites.</div>
            ) : myInvites.map(m => (
              <div key={m.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div>From: {m.sellerEmail}</div>
                  <div className="text-[hsl(var(--muted-foreground))]">{m.role} • {m.status}</div>
                </div>
                {(!m.memberUid || m.status === 'pending') ? (
                  <button className="btn btn-primary" onClick={() => accept(m.id)}>Accept</button>
                ) : <div className="text-xs text-[hsl(var(--muted-foreground))]">Active</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}