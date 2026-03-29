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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
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
      setUserRoles(roles);

      if (roles.length === 0) {
        // Auto-assign seeker if no roles
        router.push('/seeker/home');
        setHasRedirected(true);
      } else if (roles.length === 1) {
        const role = roles[0];
        if (role === 'provider') {
          router.push('/provider/dashboard');
        } else if (role === 'seeker') {
          router.push('/seeker/home');
        } else if (role === 'admin') {
          router.push('/admin/dashboard');
        }
        setHasRedirected(true);
      } else {
        // Multiple roles — show role selection drawer
        setIsDrawerOpen(true);
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

      <RoleSelectionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        roles={userRoles} 
      />
    </div>
  );
}

