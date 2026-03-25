// ─── Firebase Client Config (Mobile) ─────────────────────
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Firebase JS SDK works in Expo
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Mobile often needs the config explicitly or from environment
const firebaseConfig = {
  apiKey: "AIzaSyA-fake-dummy-key-for-build-12345", // Placeholder: use .env in production
  authDomain: "dukhsuno-dummy.firebaseapp.com",
  databaseURL: "https://dukhsuno-dummy.firebaseio.com",
  projectId: "dukhsuno-dummy",
  storageBucket: "dukhsuno-dummy.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:abcdef1234567890", // Example Android ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export default app;
