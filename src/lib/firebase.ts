import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
  type FirebaseApp,
} from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
export const missingFirebaseKeys = missing.map(([k]) => k);

// Only warn in the browser to avoid noisy server logs
if (typeof window !== 'undefined' && missingFirebaseKeys.length) {
  console.warn('Missing Firebase env vars:', missingFirebaseKeys.join(', '));
}

const isBrowser = typeof window !== 'undefined';

let app: FirebaseApp | null = null;
if (isBrowser && missingFirebaseKeys.length === 0) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Public flags (client-only true/false)
export const isFirebaseConfigured = !!(isBrowser && app);

// Export nullable clients; use the *OrThrow helpers where required
export const auth = (isBrowser && app ? getAuth(app) : null) as any;       // keep as any to avoid TS ripples
export const db = (isBrowser && app ? getFirestore(app) : null) as any;
export const googleProvider = isBrowser ? new GoogleAuthProvider() : null;

/**
 * Throw a helpful error if Firebase isn't configured.
 * Use these helpers in places where a non-null Auth/Firestore is required.
 */
export function getAuthOrThrow(): Auth {
  if (!auth) {
    throw new Error(
      `Firebase Auth is not configured. Missing envs: ${missingFirebaseKeys.join(', ') || 'unknown'}. ` +
        'Set the NEXT_PUBLIC_FIREBASE_* env vars and redeploy.'
    );
  }
  return auth as Auth;
}

export function getDbOrThrow(): Firestore {
  if (!db) {
    throw new Error(
      `Firestore is not configured. Missing envs: ${missingFirebaseKeys.join(', ') || 'unknown'}. ` +
        'Set the NEXT_PUBLIC_FIREBASE_* env vars and redeploy.'
    );
  }
  return db as Firestore;
}