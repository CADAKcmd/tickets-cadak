import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
if (missing.length) {
  console.warn('Missing Firebase env vars:', missing.map(([k]) => k).join(', '));
}

let app: ReturnType<typeof initializeApp> | undefined;
if (missing.length === 0) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} else {
  app = undefined;
}

// EXPORTS you should import elsewhere
export const auth = (app ? getAuth(app) : null) as any;
export const googleProvider = new GoogleAuthProvider();
export const db = (app ? getFirestore(app) : null) as any;