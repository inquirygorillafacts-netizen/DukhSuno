'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import RoleSelectionDrawer from '@/components/shared/RoleSelectionDrawer';
import type { Role } from '@/types';
import { Spinner } from '@/components/ui/spinner';


export default function SplashPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [hasRedirected, setHasRedirected] = useState(false);

  // ⚡ READS FROM ZUSTAND STORE — AuthGuard's centralized onSnapshot listener
  // provides the user data. ZERO extra Firestore reads from the splash page.
  useEffect(() => {
    // Wait for AuthGuard to finish loading
    if (isLoading) return;
    if (hasRedirected) return;

    // Give splash 1.5s minimum display for premium feel
    const timer = setTimeout(() => {
      if (!user) {
        // Not logged in
        router.push('/login');
        setHasRedirected(true);
        return;
      }

      const roles = user.roles || [];

      if (roles.length === 0) {
        // Auto-assign seeker if no roles
        router.push('/seeker/home');
        setHasRedirected(true);
      } else {
        // Directly push based on activeRole or role hierarchy without drawer
        const nextRole = user.activeRole || (roles.includes('admin') ? 'admin' : (roles.includes('provider') ? 'provider' : 'seeker'));
        if (nextRole === 'admin') router.push('/admin/dashboard');
        else if (nextRole === 'provider') router.push('/provider/dashboard');
        else router.push('/seeker/home');
        setHasRedirected(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, isLoading, router, hasRedirected]);

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
    </div>
  );
}

