// ─── Firebase Client Config ─────────────────────
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/**
 * Creates a defensive proxy for service objects to provide better 
 * debugging info if environment variables are missing at build-time.
 */
const createDefensiveProxy = (name: string) => {
  return new Proxy({} as any, {
    get: (target, prop) => {
      if (typeof window !== 'undefined') {
        console.error(`🔴 Firebase ${name} Error: Attempted to access '${String(prop)}' but the configuration was missing during build. Please verify your NEXT_PUBLIC_FIREBASE_* environment variables on Netlify and re-trigger a build.`);
      }
      return target[prop];
    }
  });
};

// Initialize Firebase (prevent duplicate initialization)
// During build time on Netlify, if env vars are missing, we provide a placeholder app
const app: FirebaseApp = hasConfig 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : ({ name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false } as any);

export const auth: Auth = hasConfig ? getAuth(app) : createDefensiveProxy('Auth');
export const googleProvider = new GoogleAuthProvider();
export const db: Firestore = hasConfig ? getFirestore(app) : createDefensiveProxy('Firestore');
export const rtdb: Database = hasConfig ? getDatabase(app) : createDefensiveProxy('Database');
export { onDisconnect } from 'firebase/database';
export const storage: FirebaseStorage = hasConfig ? getStorage(app) : createDefensiveProxy('Storage');

export default app;
