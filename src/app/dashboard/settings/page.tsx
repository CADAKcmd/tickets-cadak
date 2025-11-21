'use client';

import { useAuth } from '@/providers/AuthProvider';

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="text-sm font-semibold">Account</div>
        <div className="mt-3 text-sm">Signed in as: <span className="font-medium">{user?.email}</span></div>
      </div>
      <div className="card p-4">
        <div className="text-sm font-semibold">Organization</div>
        <div className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Add your organization details here.</div>
      </div>
    </div>
  );
}