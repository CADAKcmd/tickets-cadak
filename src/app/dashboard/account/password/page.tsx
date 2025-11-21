'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function PasswordPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  const onSave = async () => {
    setMsg(null);
    if (!user.email) { setMsg('Password change not available for Google-only accounts'); return; }
    try {
      setSaving(true);
      const cred = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, next);
      setMsg('Password updated.'); setCurrent(''); setNext('');
    } catch (e: any) { setMsg(e?.message || 'Error changing password.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Change Password</h1>
      <div className="card p-4 space-y-3">
        <div><label className="text-sm font-medium">Current password</label>
          <input type="password" className="input mt-1" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
        <div><label className="text-sm font-medium">New password</label>
          <input type="password" className="input mt-1" value={next} onChange={(e) => setNext(e.target.value)} /></div>
        {msg && <div className="text-sm">{msg}</div>}
        <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}