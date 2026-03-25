'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { DukhSunoUser } from '@/types';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as DukhSunoUser;
        setUser(userData);

        if (userData.roles?.length === 0) {
          router.push('/select-role');
        } else if (userData.roles?.length === 1) {
          if (userData.activeRole === 'sunne_wala') {
            router.push('/sunne/dashboard');
          } else {
            router.push('/sunane/home');
          }
        } else {
          router.push('/choose-role');
        }
      } else {
        const newUser: Partial<DukhSunoUser> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          avatarUrl: firebaseUser.photoURL || '',
          bannerUrl: '',
          roles: [],
          creditBalance: 0,
          totalCallMinutes: 0,
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
        });
        setUser(newUser as DukhSunoUser);
        router.push('/select-role');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#fdfcff] dark:bg-[#0a0a0c]">
      {/* Background Blobs (Master Design) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-200 dark:bg-rose-900/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 dark:bg-rose-950/20 rounded-full blur-[120px] animate-blob-delay" />
      </div>

      <div className="w-full max-w-[420px] glass bg-white/70 dark:bg-white/5 rounded-[3.5rem] p-12 shadow-2xl text-center relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md border border-slate-50">
          <Heart className="text-[#ff4d6d] fill-current w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter dark:text-white">
          Dukh<span className="text-[#ff4d6d] italic font-serif" style={{ fontFamily: 'var(--font-branding)' }}>Suno</span>
        </h1>
        
        <p className="text-slate-500 text-sm mt-3 font-medium">
          Welcome back to your safe space
        </p>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-15 bg-[#1e2330] dark:bg-white text-white dark:text-[#1e2330] rounded-full mt-10 font-bold flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".8"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity=".7"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity=".9"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p className="mt-10 text-[10px] text-slate-300 font-black uppercase tracking-widest leading-relaxed">
          Privacy is Sacred
        </p>
      </div>
    </div>
  );
}
