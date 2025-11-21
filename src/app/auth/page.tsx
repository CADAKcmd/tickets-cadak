'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { auth } from '@/lib/firebase';
import {
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { useToast } from '@/components/ui/Toast';
import { X, Eye, EyeOff, QrCode } from 'lucide-react';

// Google "G" icon
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg className="block" width={size} height={size} viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#4285F4" d="M255.9 133.5c0-10.4-.9-20.5-2.6-30.2H130v57.1h71.3c-3.1 16.6-12.5 30.6-26.6 39.9l43 33.4c25.2-23.3 38.2-57.6 38.2-100.2z"/>
      <path fill="#34A853" d="M130 261.1c35.7 0 65.7-11.8 87.6-32.2l-43-33.4c-12 8.1-27.4 12.9-44.6 12.9-34.2 0-63.2-23.1-73.6-54.1l-44.5 34.4C33 231.8 78.7 261.1 130 261.1z"/>
      <path fill="#FBBC05" d="M56.4 154.3c-2.7-8.1-4.3-16.7-4.3-25.5s1.6-17.4 4.3-25.5l-44.6-34.4C2.5 85.9 0 99.4 0 113.8s2.5 27.9 11.8 45l44.6-34.5z"/>
      <path fill="#EA4335" d="M130 50.5c19.4 0 36.9 6.7 50.7 19.8l38-38C194.9 12.1 165.7 0 130 0 78.7 0 33 29.3 11.8 68.9L56.4 103.4C66.8 72.6 95.8 50.5 130 50.5z"/>
    </svg>
  );
}

// Error mapping
function mapAuthError(e: any, online: boolean) {
  const code = e?.code || '';
  if (!online || code === 'auth/network-request-failed') return 'You are offline. Connect to the internet and try again.';
  if (code === 'auth/user-not-found') return "We can't find your account. Please create an account.";
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') return 'Incorrect email or password. Try again or reset your password.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Sign-in popup closed before completing. Try again.';
  if (code === 'auth/popup-blocked') return 'Your browser blocked the sign-in popup. Allow popups and try again.';
  if (code === 'auth/invalid-email') return 'That email looks invalid. Please check and try again.';
  return e?.message || 'Authentication failed. Please try again.';
}

export default function AuthPage() {
  const [sp, setSp] = useState(() =>
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  );
  const next = sp.get('next') || '/dashboard';
  const router = useRouter();
  const { signInEmail, signUpEmail, signInGoogle, loading, user } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [errCode, setErrCode] = useState<string | null>(null);

  const [online, setOnline] = useState(true);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);

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

  // Respect query: /auth?mode=signup or mode=signin
  useEffect(() => {
    const m = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : null;
    if (m === 'signup' || m === 'signin') setMode(m);
  }, []);

  // Update URL when switching mode (keep next param)
  const setModeParam = useCallback((m: 'signin' | 'signup') => {
    setMode(m);
    const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    p.set('mode', m);
    if (next) p.set('next', next);
    router.replace(`/auth?${p.toString()}`, { scroll: false });
  }, [next, router]);

  // Redirect only when verified
  useEffect(() => {
    if (user && user.emailVerified) router.replace(next);
  }, [user, next, router]);

  const close = () => {
    if (typeof window !== 'undefined' && window.opener) window.close();
    else router.push('/');
  };

  const emailExists = async (addr: string) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, addr);
      return (methods && methods.length > 0) || false;
    } catch {
      return false;
    }
  };

  const submit = async () => {
    try {
      setErr(null);
      setErrCode(null);

      if (!online) {
        const msg = 'You are offline. Connect to the internet and try again.';
        setErr(msg);
        toast({ message: msg, variant: 'error' });
        return;
      }
      if (!email) {
        setErr('Enter your email.');
        return;
      }

      if (mode === 'signin') {
        if (!password) {
          setErr('Enter your password.');
          return;
        }
        const exists = await emailExists(email);
        if (!exists) {
          const msg = "We can't find your account. Please create an account.";
          setErr(msg);
          setErrCode('auth/user-not-found');
          toast({ message: msg, variant: 'error' });
          return;
        }

        await signInEmail(email, password);

        if (auth.currentUser && !auth.currentUser.emailVerified) {
          setAwaitingVerification(true);
          const msg = `We sent a verification email to ${auth.currentUser.email}. Verify and click "I've verified".`;
          setErr(msg);
          toast({ message: 'Verification email sent. Check your inbox.', variant: 'success' });
        } else {
          toast({ message: 'Welcome back!', variant: 'success' });
          router.replace(next);
        }
      } else {
        if (!name.trim()) {
          setErr('Enter your name to create an account.');
          return;
        }
        const exists = await emailExists(email);
        if (exists) {
          const msg = 'An account already exists for this email. Please log in instead.';
          setErr(msg);
          toast({ message: msg, variant: 'error' });
          return;
        }

        await signUpEmail(email, password, name);

        if (auth.currentUser && !auth.currentUser.emailVerified) {
          try {
            setSendingVerify(true);
            await sendEmailVerification(auth.currentUser);
            setAwaitingVerification(true);
            const msg = `Verification email sent to ${auth.currentUser.email}. Check your email (e.g., Gmail app), then click "I've verified".`;
            setErr(msg);
            toast({ message: 'Verification email sent.', variant: 'success' });
          } finally {
            setSendingVerify(false);
          }
        } else {
          toast({ message: 'Account created!', variant: 'success' });
          router.replace(next);
        }
      }
    } catch (e: any) {
      const msg = mapAuthError(e, online);
      setErr(msg);
      setErrCode(e?.code || null);
      toast({ message: msg, variant: 'error' });
    }
  };

  const resendVerification = async () => {
    try {
      if (!auth.currentUser) {
        setErr('Please log in again to resend verification.');
        return;
      }
      setSendingVerify(true);
      await sendEmailVerification(auth.currentUser);
      setErr(`Verification email re-sent to ${auth.currentUser.email}.`);
      toast({ message: 'Verification email re-sent.', variant: 'success' });
    } catch (e: any) {
      const msg = mapAuthError(e, online);
      setErr(msg);
      toast({ message: msg, variant: 'error' });
    } finally {
      setSendingVerify(false);
    }
  };

  const iVerified = async () => {
    try {
      if (!auth.currentUser) {
        setErr('Please log in to continue.');
        return;
      }
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setAwaitingVerification(false);
        setErr(null);
        toast({ message: 'Email verified. Welcome to CADAK!', variant: 'success' });
        router.replace(next);
      } else {
        setErr('Still not verified. Open your email and click the verification link, then try again.');
      }
    } catch {
      setErr('Could not refresh verification status. Try again.');
    }
  };

  const showCreateCTA = useMemo(
    () => mode === 'signin' && (errCode === 'auth/user-not-found' || (err || '').toLowerCase().includes('create')),
    [mode, errCode, err]
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container flex min-h-[calc(100vh-2rem)] items-center justify-center py-6">
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

          {/* Content */}
          <div className="px-8 pb-8 pt-10">
            <div className="mx-auto mb-4 flex w-full flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--accent))] text-white font-bold">
                C
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Welcome to CADAK</h1>
            </div>

            {/* Offline banner */}
            {!online && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                You are offline. Connect to the internet and try again.
              </div>
            )}

            {/* Awaiting verification banner */}
            {awaitingVerification && (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {err || 'Please verify your email from your email app, then continue.'}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={resendVerification} disabled={sendingVerify}>
                    {sendingVerify ? 'Sending…' : 'Resend email'}
                  </button>
                  <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Open Gmail
                  </a>
                  <button type="button" className="btn btn-primary btn-sm" onClick={iVerified}>
                    I’ve verified
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    placeholder="Password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label="Toggle password"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/auth/forgot" className="text-sm text-[hsl(var(--accent))] hover:underline">
                  Forgot your password?
                </Link>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {mode === 'signin' ? (
                    <>
                      No account?{' '}
                      <button className="font-medium text-[hsl(var(--accent))] hover:underline" onClick={() => setModeParam('signup')}>
                        Create one
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button className="font-medium text-[hsl(var(--accent))] hover:underline" onClick={() => setModeParam('signin')}>
                        Log in
                      </button>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={submit}
                disabled={loading || !online}
                className="btn btn-primary mt-1 w-full rounded-xl py-2.5 font-semibold disabled:cursor-not-allowed"
                title={!online ? 'Connect to the internet' : undefined}
              >
                {mode === 'signin' ? 'Log in' : 'Create account'}
              </button>

              {/* Helpful CTA if the account doesn't exist */}
              {showCreateCTA && mode === 'signin' && (
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  We can’t find your account.{' '}
                  <button className="font-medium text-[hsl(var(--accent))] hover:underline" onClick={() => setModeParam('signup')}>
                    Create one
                  </button>
                  .
                </div>
              )}

              <div className="my-2 flex items-center gap-3">
                <div className="h-px flex-1 bg-[hsl(var(--border))]" />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">OR</span>
                <div className="h-px flex-1 bg-[hsl(var(--border))]" />
              </div>

              {/* Google button */}
              <div className="relative">
                <button
                  onClick={async () => {
                    try {
                      setErr(null);
                      setErrCode(null);
                      if (!online) {
                        const msg = 'You are offline. Connect to the internet and try again.';
                        setErr(msg);
                        toast({ message: msg, variant: 'error' });
                        return;
                      }
                      await signInGoogle();
                      toast({ message: 'Signed in with Google', variant: 'success' });
                      router.replace(next);
                    } catch (e: any) {
                      const msg = mapAuthError(e, online);
                      setErr(msg);
                      setErrCode(e?.code || null);
                      toast({ message: msg, variant: 'error' });
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed"
                  type="button"
                  aria-label="Continue with Google"
                  disabled={!online}
                  title={!online ? 'Connect to the internet' : undefined}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center">
                    <GoogleG size={18} />
                  </span>
                  <span className="text-sm font-medium leading-none">Continue with Google</span>
                </button>
              </div>

              {/* QR code button */}
              <button
                onClick={() => router.push('/scan')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm hover:bg-[hsl(var(--muted))]"
                type="button"
              >
                <QrCode size={18} className="shrink-0" />
                <span className="leading-none">Use QR code</span>
              </button>

              {/* Inline error/notice (hidden when showing the verification banner) */}
              {err && !awaitingVerification && (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert" aria-live="polite">
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