'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import RoleSelectionDrawer from '@/components/shared/RoleSelectionDrawer';
import type { BigSunoUser, Role } from '@/types';
import { Heart } from 'lucide-react';


export default function SplashPage() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const [show, setShow] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as BigSunoUser;
              setUser(userData);
              setUserRoles(userData.roles || []);

              if (!userData.roles || userData.roles.length === 0) {
                router.push('/select-role');
              } else if (userData.roles.length === 1) {
                const role = userData.roles[0];
                if (role === 'sunne_wala') {
                  router.push('/sunne/dashboard');
                } else if (role === 'sunane_wala') {
                  router.push('/sunane/home');
                } else if (role === 'admin') {
                  router.push('/admin/dashboard');
                }
              } else {
                // Show role selection drawer instead of redirecting
                setIsDrawerOpen(true);
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
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden" suppressHydrationWarning>

      <div className="relative z-10 flex flex-col items-center stagger-children" suppressHydrationWarning>
        {/* Unique Animated Logo (No images, pure CSS & Lucide) */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-12">
           {/* Ripple Waves */}
           <div className="absolute inset-0 rounded-full bg-accent/20 animate-ripple" />
           <div className="absolute inset-0 rounded-full bg-accent/15 animate-ripple" style={{ animationDelay: '1s' }} />
           <div className="absolute inset-0 rounded-full bg-accent/10 animate-ripple" style={{ animationDelay: '2s' }} />
           
           {/* Main Heart Container */}
           <div className="relative w-20 h-20 bg-white shadow-2xl rounded-[2rem] flex items-center justify-center animate-heartbeat">
              <Heart className="text-accent fill-current w-10 h-10" />
           </div>
        </div>

        {/* Branding */}
        <div className="text-center space-y-3" suppressHydrationWarning>
          <h1
            className="text-[54px] font-black tracking-tighter leading-none text-gradient"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            BigSuno
          </h1>
          <p
            className="text-text-secondary text-[18px] font-medium tracking-wide italic"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dil ki baat sune koi apna...
          </p>
        </div>

        {/* Premium Loader */}
        <div className="mt-16 flex gap-4" suppressHydrationWarning>
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full bg-accent/40 animate-pulse-soft"
              style={{ animationDelay: `${i * 200}ms` }} 
              suppressHydrationWarning
            />
          ))}
        </div>
      </div>

      <RoleSelectionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        roles={userRoles} 
      />
    </div>
  );
}
