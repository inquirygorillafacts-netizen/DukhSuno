'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { DukhSunoUser } from '@/types';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, user, isLoading, setLoading } = useAuthStore();
  const [verifying, setVerifying] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // If we already have the user in store, we can skip the fetch for speed
          if (user && user.uid === firebaseUser.uid) {
            setVerifying(false);
            setLoading(false);
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as DukhSunoUser;
            setUser(userData);
            
            // Onboarding Check: If no roles, redirect to selection
            if ((!userData.roles || userData.roles.length === 0) && pathname !== '/select-role' && !pathname.includes('onboarding')) {
              router.push('/select-role');
            }
          } else {
            // User exists in Auth but not in Firestore (shouldn't happen often)
            router.push('/select-role');
          }
        } catch (error) {
          console.error('AuthGuard error:', error);
          router.push('/login');
        } finally {
          setVerifying(false);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        setVerifying(false);
        // Only redirect if we are not on a public page
        if (pathname !== '/login' && pathname !== '/' && !pathname.includes('onboarding')) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router, setUser, setLoading, user]);

  // SILENT AUTH OPTIMIZATION:
  // If we already have a user in the store (from persistence), we show the content immediately.
  // The useEffect will handle redirection in the background if the session is actually invalid.
  // This makes navigation feel "Instant" instead of showing a loading screen every time.
  if (!mounted) {
    return (
      <div 
        className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center font-jakarta"
        suppressHydrationWarning
      >
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">DukhSuno...</p>
      </div>
    );
  }

  // Only show the full-page guard if we LITERALLY have no user data yet and are still verifying/loading
  if ((verifying || isLoading) && !user) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 flex items-center justify-center mb-8">
           <div className="absolute inset-0 rounded-full bg-accent/20 animate-ripple" />
           <div className="absolute inset-0 rounded-full bg-accent/10 animate-ripple" style={{ animationDelay: '1s' }} />
           <div className="relative w-16 h-16 bg-white shadow-xl rounded-[1.5rem] flex items-center justify-center animate-heartbeat">
              <Heart className="text-accent fill-current w-8 h-8" />
           </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Suraksha Jaanch...</p>
      </div>
    );
  }

  return <>{children}</>;
}
