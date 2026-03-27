'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { BigSunoUser } from '@/types';
import { Heart, ShieldCheck, X } from 'lucide-react';

export function LoginSlider({ onClose, providerId }: { onClose: () => void, providerId: string }) {
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
        const userData = userDoc.data() as BigSunoUser;
        setUser(userData);
        onClose(); // Close and stay on provider page
      } else {
        const newUser: Partial<BigSunoUser> = {
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
        setUser(newUser as BigSunoUser);
        router.push('/select-role'); // New users still need to select role
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-md animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md glass bg-white/95 border-white/40 sm:rounded-[3rem] rounded-t-[3rem] p-10 shadow-2xl animate-slide-up sm:animate-zoom-in relative">
        
        <button onClick={onClose} className="absolute top-6 right-8 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={24} strokeWidth={3} />
        </button>

        <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md border border-slate-50">
               <Heart className="text-rose-500 fill-current w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Dil ki Baat... <span className="text-rose-500 italic">BigSuno</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic mb-10">
              "Kisko call karna hai? Bas ek step door hain aap. Ek surakshit aur gumnam login karein."
            </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-18 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black flex items-center justify-center gap-4 hover:border-rose-200 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl shadow-slate-200/50 disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                Google se Login Karein
              </>
            )}
          </button>
          
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="text-rose-500 w-6 h-6" />
             </div>
             <div className="text-left">
                <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Privacy Safe</p>
                <p className="text-[10px] text-slate-500 font-medium">Aapka data gumnam rahega.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
