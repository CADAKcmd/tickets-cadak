import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
  type FirebaseApp,
} from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Note: do NOT import or call `dotenv` here. Next/Vercel injects env vars at build/runtime.
// Keep this module import-safe so it never throws during SSR or client bundling.

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
const missingKeys = missing.map(([k]) => k);
if (missingKeys.length) {
  console.warn('Missing Firebase env vars:', missingKeys.join(', '));
}

let app: FirebaseApp | null = null;
if (missingKeys.length === 0) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const isFirebaseConfigured = app !== null;
export const missingFirebaseKeys = missingKeys;

// Keep `auth` and `db` as `any` for backwards compatibility across the codebase.
// Prefer `getAuthOrThrow()` / `getDbOrThrow()` in new server code.
export const auth = (app ? getAuth(app) : null) as any;
export const db = (app ? getFirestore(app) : null) as any;
export const googleProvider = new GoogleAuthProvider();

export function getAuthOrThrow(): Auth {
  if (!auth) {
    throw new Error(
      `Firebase Auth is not configured. Missing envs: ${missingKeys.join(', ')}. ` +
        'Set the NEXT_PUBLIC_FIREBASE_* env vars and redeploy.'
    );
  }
  return auth;
}

export function getDbOrThrow(): Firestore {
  if (!db) {
    throw new Error(
      `Firestore is not configured. Missing envs: ${missingKeys.join(', ')}. ` +
        'Set the NEXT_PUBLIC_FIREBASE_* env vars and redeploy.'
    );
  }
  return db;
}