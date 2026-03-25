'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { DukhSunoUser } from '@/types';


export default function SplashPage() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as DukhSunoUser;
              setUser(userData);

              if (!userData.roles || userData.roles.length === 0) {
                router.push('/select-role');
              } else if (userData.roles.length === 1) {
                if (userData.activeRole === 'sunne_wala') {
                  router.push('/sunne/dashboard');
                } else {
                  router.push('/sunane/home');
                }
              } else {
                router.push('/choose-role');
              }
            } else {
              router.push('/select-role');
            }
          } catch {
            router.push('/login');
          }
        } else {
          setUser(null);
          setLoading(false);
          router.push('/login');
        }
        unsubscribe();
      });
    }, 2000); // 2s splash for premium feel

    return () => clearTimeout(timer);
  }, [router, setUser, setLoading]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden">

      <div className="relative z-10 flex flex-col items-center stagger-children">
        {/* Animated Logo */}
        <div className="w-24 h-24 rounded-main glass-container flex items-center justify-center animate-pulse-soft mb-8 overflow-hidden p-4 relative">
           <Image 
             src="/logo.png" 
             alt="DukhSuno Logo" 
             fill
             className="object-contain p-4"
             priority
           />
        </div>

        {/* Branding */}
        <div className="text-center space-y-3">
          <h1
            className="text-[54px] font-black tracking-tighter leading-none text-gradient"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            DukhSuno
          </h1>
          <p
            className="text-text-secondary text-[18px] font-medium tracking-wide italic"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dil ki baat sune koi apna...
          </p>
        </div>

        {/* Premium Loader */}
        <div className="mt-16 flex gap-4">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full bg-accent/40 animate-pulse-soft"
              style={{ animationDelay: `${i * 200}ms` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
