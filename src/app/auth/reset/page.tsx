'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { useToast } from '@/components/ui/Toast';
import { X } from 'lucide-react';

export default function ResetPasswordPage() {
  const oobCode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('oobCode') || '' : '';
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);

  // Track online/offline
  useEffect(() => {
    const initial = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOnline(initial);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Verify action code
  useEffect(() => {
    (async () => {
      try {
        setChecking(true);
        if (!oobCode) {
          setError('Invalid password reset link.');
          return;
        }
        if (!auth) {
          setError('Authentication is not configured on the server.');
          return;
        }
        const mail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(mail);
      } catch (e: any) {
        const code = e?.code || '';
        const friendly =
          code === 'auth/expired-action-code'
            ? 'This reset link has expired. Request a new one.'
            : code === 'auth/invalid-action-code'
            ? 'This reset link is invalid. Request a new one.'
            : 'Could not verify the reset link.';
        setError(friendly);
      } finally {
        setChecking(false);
      }
    })();
  }, [oobCode]);

  const close = () => router.push('/');

  const submit = async () => {
    try {
      setError(null);
      if (!online) {
        setError('You are offline. Connect to the internet and try again.');
        return;
      }
      if (!pw || pw.length < 6) {
        setError('Choose a stronger password (at least 6 characters).');
        return;
      }
      if (pw !== pw2) {
        setError('Passwords do not match.');
        return;
      }
      setSaving(true);
      if (!auth) {
        setError('Authentication is not configured on the server.');
        return;
      }
      await confirmPasswordReset(auth, oobCode, pw);
      toast({ message: 'Password updated. You can log in now.', variant: 'success' });
      router.push('/auth');
    } catch (e: any) {
      const code = e?.code || '';
      const friendly =
        code === 'auth/weak-password'
          ? 'Choose a stronger password.'
          : code === 'auth/expired-action-code'
          ? 'This reset link has expired. Request a new one.'
          : code === 'auth/invalid-action-code'
          ? 'This reset link is invalid. Request a new one.'
          : e?.message || 'Could not reset password. Try again.';
      setError(friendly);
      toast({ message: friendly, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container flex min-h-[calc(100vh-2rem)] items-center justify-center py-6">
        <div className="relative w-full max-w-md rounded-2xl border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-soft">
          <button
            className="absolute right-3 top-3 rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            aria-label="Close"
            type="button"
            onClick={close}
          >
            <X size={18} />
          </button>

          <div className="px-8 pb-8 pt-10">
            <div className="mx-auto mb-4 flex w-full flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--accent))] text-white font-bold">
                C
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Reset your password</h1>
              <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
                {checking
                  ? 'Checking your reset link…'
                  : email
                  ? `Reset password for ${email}`
                  : 'Use the latest link from your email.'}
              </p>
            </div>

            {!online && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                You are offline. Connect to the internet and try again.
              </div>
            )}

            {error && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">New password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Enter a new password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  disabled={checking || !email}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Confirm new password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Re-enter new password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  disabled={checking || !email}
                />
              </div>

              <button
                onClick={submit}
                disabled={checking || !email || saving || !online}
                className="btn btn-primary w-full disabled:cursor-not-allowed"
              >
                {saving ? 'Updating…' : 'Update password'}
              </button>

              <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <Link href="/auth/forgot" className="hover:underline">Request another link</Link>
                <Link href="/auth" className="hover:underline">Back to login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}