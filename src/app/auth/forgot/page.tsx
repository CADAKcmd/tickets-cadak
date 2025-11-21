'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useToast } from '@/components/ui/Toast';
import { X, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [online, setOnline] = useState(true);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

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

  // Simple cooldown after sending to avoid accidental spam
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const close = () => router.push('/');

  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  const onSubmit = async () => {
    try {
      setErr(null);
      setMsg(null);
      if (!online) {
        setErr('You are offline. Connect to the internet and try again.');
        return;
      }
      if (!email || !validateEmail(email)) {
        setErr('Enter a valid email address.');
        return;
      }

      setSending(true);

      if (!auth) {
        const m = 'Authentication is not configured on the server. Try again later.';
        setErr(m);
        toast({ message: m, variant: 'error' });
        return;
      }

      const methods = await fetchSignInMethodsForEmail(auth, email);
      const exists = methods && methods.length > 0;

      if (!exists) {
        const m = "We can't find your account. Please create an account or check your email.";
        setErr(m);
        toast({ message: m, variant: 'error' });
        return;
      }

      await sendPasswordResetEmail(auth, email);
      const success = `Password reset email sent to ${email}. Check your inbox.`;
      setMsg(success);
      toast({ message: 'Reset email sent', variant: 'success' });
      setCooldown(30);
    } catch (e: any) {
      const code = e?.code || '';
      const friendly =
        code === 'auth/network-request-failed'
          ? 'Network error. Check your connection and try again.'
          : code === 'auth/invalid-email'
          ? 'That email looks invalid. Please check and try again.'
          : e?.message || 'Could not send reset email. Try again.';
      setErr(friendly);
      toast({ message: friendly, variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container flex min-height[calc(100vh-2rem)] min-h-[calc(100vh-2rem)] items-center justify-center py-6">
        <div className="relative w-full max-w-md rounded-2xl border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-soft">
          {/* Close */}
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
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Forgot your password?</h1>
              <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Enter your email and we’ll send you a reset link.
              </p>
            </div>

            {!online && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                You are offline. Connect to the internet and try again.
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  className="input"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                onClick={onSubmit}
                disabled={sending || !online || cooldown > 0}
                className="btn btn-primary w-full disabled:cursor-not-allowed"
                title={!online ? 'Connect to the internet' : undefined}
              >
                {sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send reset link'}
              </button>

              <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <Link href="/auth" className="hover:underline">Back to login</Link>
                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  <Mail size={14} /> Open Gmail
                </a>
              </div>

              {msg && (
                <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {msg}
                </div>
              )}
              {err && (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}