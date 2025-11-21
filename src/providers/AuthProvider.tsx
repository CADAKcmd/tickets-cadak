'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, googleProvider }  from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  User,
} from 'firebase/auth';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Firebase not configured (e.g., missing env vars). Avoid throwing during SSR/runtime.
      setUser(null);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user,
    loading,
    async signInEmail(email, password) {
      if (!auth) throw new Error('Authentication not configured');
      await signInWithEmailAndPassword(auth, email, password);
    },
    async signUpEmail(email, password, name) {
      if (!auth) throw new Error('Authentication not configured');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
    },
    async signInGoogle() {
      if (!auth) throw new Error('Authentication not configured');
      await signInWithPopup(auth, googleProvider);
    },
    async signOut() {
      if (!auth) throw new Error('Authentication not configured');
      await fbSignOut(auth);
    },
  }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}