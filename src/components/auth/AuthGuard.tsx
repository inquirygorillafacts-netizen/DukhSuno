'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { BigSunoUser } from '@/types';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Spinner } from '../ui/spinner';

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
          // 1. Silent persistent check: If store user matches, check blocking/roles
          if (user && user.uid === firebaseUser.uid) {
            // Check blocking
            if (user.isBlocked && pathname !== '/blocked' && !pathname.includes('onboarding')) {
                router.push('/blocked');
                finalize();
                return;
            }

            // Check if already on login/root while authenticated
            if (pathname === '/login' || pathname === '/') {
                redirectToDashboard(user);
                finalize();
                return;
            }

            // Path-based Role Enforcement
            if (!canAccessPath(user, pathname)) {
                redirectToDashboard(user);
                finalize();
                return;
            }

            finalize();
            return;
          }

          // 2. Fetch fresh user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as BigSunoUser;
            setUser(userData);
            
            // Blocking Check
            if (userData.isBlocked && pathname !== '/blocked') {
              router.push('/blocked');
              finalize();
              return;
            }

            // Redirect from login/root to dashboard
            if (pathname === '/login' || pathname === '/') {
                redirectToDashboard(userData);
                finalize();
                return;
            }

            // Onboarding Check: If no roles, redirect to selection
            if ((!userData.roles || userData.roles.length === 0) && 
                pathname !== '/select-role' && !pathname.includes('onboarding')) {
              router.push('/select-role');
            }

            // Path-based Role Enforcement
            if (!canAccessPath(userData, pathname)) {
                redirectToDashboard(userData);
            }
          } else {
            // User exists in Auth but not in Firestore (incomplete registration)
            if (pathname !== '/select-role' && !pathname.includes('onboarding')) {
              router.push('/select-role');
            }
          }
        } catch (error) {
          console.error('AuthGuard error:', error);
          if (pathname !== '/login') router.push('/login');
        } finally {
          finalize();
        }
      } else {
        // NO USER Logged In
        setUser(null);
        finalize();
        // Redirect to login if on a protected page
        if (pathname !== '/login' && pathname !== '/' && !pathname.includes('onboarding')) {
          router.push('/login');
        }
      }
    });

    const finalize = () => {
      setVerifying(false);
      setLoading(false);
    };

    const canAccessPath = (u: BigSunoUser, path: string) => {
      const roles = u.roles || [];
      if (path.startsWith('/admin') && !roles.includes('admin')) return false;
      if (path.startsWith('/sunne') && !roles.includes('sunne_wala')) return false;
      if (path.startsWith('/sunane') && !roles.includes('sunane_wala')) return false;
      return true;
    };

    const redirectToDashboard = (u: BigSunoUser) => {
      const activeRole = u.activeRole || (u.roles && u.roles[0]);
      if (activeRole === 'admin') router.push('/admin/dashboard');
      else if (activeRole === 'sunne_wala') router.push('/sunne/dashboard');
      else if (activeRole === 'sunane_wala') router.push('/sunane/home');
      else router.push('/select-role');
    };

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
        <Spinner size="md" />
      </div>
    );
  }

  // Only show the full-page guard if we LITERALLY have no user data yet and are still verifying/loading
  if ((verifying || isLoading) && !user) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return <>{children}</>;
}
