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
                // Auto-assign seeker if no roles
                router.push('/seeker/home');
              } else if (userData.roles.length === 1) {
                const role = userData.roles[0];
                if (role === 'provider') {
                  router.push('/provider/dashboard');
                } else if (role === 'seeker') {
                  router.push('/seeker/home');
                } else if (role === 'admin') {
                  router.push('/admin/dashboard');
                }
              } else {
                // Show role selection drawer instead of redirecting
                setIsDrawerOpen(true);
              }
            } else {
              // User exists in Auth but not Firestore -> Redirect to login to handle creation
              // or handle it here. Login page is safer as it has the full newUser template.
              router.push('/login');
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
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden bg-[#fdfcff]" suppressHydrationWarning>
      {/* Background Blobs (Master Design) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-200 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-slate-100 rounded-full blur-[120px] animate-blob-delay" />
      </div>

      <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
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

