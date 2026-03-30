'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { BigSunoUser } from '@/types';
import { Spinner } from '../ui/spinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, user, isLoading, setLoading } = useAuthStore();
  const [verifying, setVerifying] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Ref to track the active Firestore user listener
  const userListenerRef = useRef<(() => void) | null>(null);
  // Ref to track previous blocked state for auto-redirect
  const prevBlockedRef = useRef<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── CENTRALIZED REAL-TIME USER LISTENER ───
  // This is the SINGLE source of truth for user data.
  // All pages read from Zustand store — NO duplicate user listeners needed.
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // Clean up previous Firestore listener
      if (userListenerRef.current) {
        userListenerRef.current();
        userListenerRef.current = null;
      }

      if (firebaseUser) {
        setLoading(true);
        
        // ⚡ REAL-TIME LISTENER on users/{uid}
        // This replaces ALL getDoc calls. Any change to the user document
        // (block/unblock, balance, roles, plans, etc.) instantly updates the store.
        const unsubscribeUser = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = { ...docSnap.data(), uid: firebaseUser.uid } as BigSunoUser;
              setUser(userData);
              prevBlockedRef.current = userData.isBlocked;
            } else {
              // User doc doesn't exist yet (incomplete registration)
              // Don't set null — let them proceed to login/onboarding
            }
            setVerifying(false);
            setLoading(false);
          },
          (error) => {
            console.error('AuthGuard realtime listener error:', error);
            setVerifying(false);
            setLoading(false);
          }
        );

        userListenerRef.current = unsubscribeUser;
      } else {
        // NO USER Logged In
        setUser(null);
        prevBlockedRef.current = null;
        setVerifying(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (userListenerRef.current) {
        userListenerRef.current();
        userListenerRef.current = null;
      }
    };
  }, [setUser, setLoading]);

  // ─── ROUTE PROTECTION & AUTO-REDIRECT ───
  // Separated from the listener to avoid re-attaching on every pathname change.
  useEffect(() => {
    if (verifying || isLoading) return;

    const safePublicPaths = ['/login', '/', '/select-role'];
    const isPublicProfilePath = pathname.startsWith('/p/');
    const isSafe = safePublicPaths.includes(pathname) || pathname.includes('onboarding') || isPublicProfilePath;

    if (!user) {
      // Not logged in — redirect to login if on protected page
      if (!isSafe) {
        router.push('/login');
      }
      return;
    }

    // ⚡ REAL-TIME BLOCK ENFORCEMENT
    // If user gets blocked, instantly redirect to /blocked
    if (user.isBlocked && pathname !== '/blocked') {
      router.push('/blocked');
      return;
    }

    // ⚡ REAL-TIME UNBLOCK — auto-redirect away from /blocked page
    if (!user.isBlocked && pathname === '/blocked') {
      redirectToDashboard(user);
      return;
    }

    // Redirect from login/root to dashboard
    if (pathname === '/login' || pathname === '/') {
      redirectToDashboard(user);
      return;
    }

    // Path-based Role Enforcement
    if (!canAccessPath(user, pathname)) {
      redirectToDashboard(user);
      return;
    }
  }, [user, pathname, verifying, isLoading, router]);

  const canAccessPath = (u: BigSunoUser, path: string) => {
    const roles = u.roles || [];
    
    // Public profile pages are always accessible
    if (path.startsWith('/p/')) return true;
    
    // Auto-allow seeker content if roles are missing or empty
    if (roles.length === 0 && path.startsWith('/seeker')) return true;

    // Admin Check
    if (path.startsWith('/admin') && !roles.includes('admin')) return false;
    
    // Provider Check
    if (path.startsWith('/provider') && !roles.includes('provider')) return false;
    
    // Seeker Check
    if (path.startsWith('/seeker') && !roles.includes('seeker')) return false;
    
    // Role Selection Check
    const isInternalPanel = path.startsWith('/seeker') || path.startsWith('/provider');
    if (isInternalPanel && roles.length === 0 && !path.startsWith('/seeker')) return false;

    return true;
  };

  const redirectToDashboard = (u: BigSunoUser) => {
    // Default Landing is ALWAYS Seeker Panel as per user request.
    // Users can switch to Provider/Admin via the header/PanelSwitcher.
    router.push('/seeker/home');
  };

  // SILENT AUTH OPTIMIZATION:
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

  // ⚡ CRITICAL FIX: ACCESS ENFORCEMENT ⚡
  // Prevent children from mounting if the path is not accessible for the current user.
  // Instead of a hanging spinner, we redirect immediately.
  if (user && !canAccessPath(user, pathname)) {
    redirectToDashboard(user);
    return null;
  }

  return <>{children}</>;
}

