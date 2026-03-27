'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import RoleSelectionDrawer from '@/components/shared/RoleSelectionDrawer';
import type { BigSunoUser, Role } from '@/types';
import { Spinner } from '@/components/ui/spinner';


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

      <div className="relative z-10 flex items-center justify-center" suppressHydrationWarning>
        <Spinner size="lg" />
      </div>

      <RoleSelectionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        roles={userRoles} 
      />
    </div>
  );
}
