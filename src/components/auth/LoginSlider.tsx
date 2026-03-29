'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { BigSunoUser } from '@/types';
import { ShieldCheck, X, Sparkles, Lock, Star } from 'lucide-react';

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
    <AnimatePresence>
      <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        {/* Content Card */}
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="w-full max-w-md bg-white rounded-t-[3rem] md:rounded-[3rem] relative z-10 shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Top Decorative Header */}
          <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-[#ff4d6d] to-indigo-600" />
          
          <div className="p-10 md:p-12 space-y-8">
            {/* Close Button */}
            <button 
               onClick={onClose} 
               className="absolute top-8 right-8 w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
            >
               <X size={24} />
            </button>

            {/* Title & Branding */}
            <div className="text-center space-y-6">
                <div className="relative inline-block">
                   <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border-4 border-white relative z-10 p-4">
                      <img src="/icons/image.png" alt="BigSuno" className="w-full h-full object-contain animate-pulse" />
                   </div>
                   <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-2 border-2 border-dashed border-rose-100 rounded-[2.5rem] opacity-50" 
                   />
                </div>

                <div className="space-y-2">
                   <h2 className="text-[32px] md:text-[36px] font-black text-slate-900 tracking-tighter leading-none uppercase italic">
                     Welcome to <span className="text-rose-500">BigSuno</span>
                   </h2>
                   <div className="flex items-center justify-center gap-2">
                      <div className="h-px w-6 bg-slate-200" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Secure & Anonymous Space</p>
                      <div className="h-px w-6 bg-slate-200" />
                   </div>
                </div>

                <p className="text-slate-500 text-sm font-medium leading-relaxed italic px-4">
                  "You are just one step away from connecting with an expert. Login securely to continue."
                </p>
            </div>

            {/* Google Login Button */}
            <div className="space-y-6">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-20 bg-white border-2 border-slate-100 text-slate-900 rounded-[2.5rem] font-black flex items-center justify-center gap-4 hover:border-indigo-100 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-100 disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                     <div className="w-6 h-6 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                     <span className="text-slate-400">Please wait...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
              
              {/* Security Footer Card */}
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-50">
                    <ShieldCheck className="text-emerald-500 w-6 h-6" />
                 </div>
                 <div className="text-left">
                    <div className="flex items-center gap-1.5 mb-0.5">
                       <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Privacy Safe</p>
                       <Lock size={10} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">Your consultation remains completely private</p>
                 </div>
              </div>
            </div>

            {/* Bottom Version Branding */}
            <div className="pt-2 flex flex-col items-center gap-2 opacity-30">
               <div className="flex items-center gap-3">
                  <Star size={10} className="fill-current" />
                  <span className="text-[10px] font-black tracking-[0.5em] uppercase">BigSuno v3.0</span>
                  <Star size={10} className="fill-current" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
