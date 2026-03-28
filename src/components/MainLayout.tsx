'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import WelcomeTour from './shared/WelcomeTour';
import { Spinner } from './ui/spinner';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { showTour, setShowTour } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTourClose = () => {
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfcff] transition-colors duration-500 overflow-x-hidden relative" suppressHydrationWarning>
      <AuroraBackground />
      
      {!mounted ? (
        <main className="flex-1 flex items-center justify-center h-screen w-full relative z-[2000]">
          <Spinner size="md" />
        </main>
      ) : (
        <>
          {children}

          {/* Global Welcome Tour */}
          {showTour && (
            <WelcomeTour 
              role="seeker"
              onClose={handleTourClose} 
            />
          )}
        </>
      )}
    </div>
  );
}

const AuroraBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-[0.15]" suppressHydrationWarning>
    <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-400 rounded-full blur-[120px] animate-blob" suppressHydrationWarning />
    <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-slate-600 rounded-full blur-[120px] animate-blob-delay" suppressHydrationWarning />
    <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-400 rounded-full blur-[120px] animate-blob opacity-50" suppressHydrationWarning />
  </div>
);
