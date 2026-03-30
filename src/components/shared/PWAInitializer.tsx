'use client';

import { useEffect } from 'react';
import { usePWAStore } from '@/stores/pwa-store';

export function PWAInitializer() {
  const { setDeferredPrompt, setStandalone, setInstalled } = usePWAStore();

  useEffect(() => {
    // 1. Check Initial Standalone Status
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      setStandalone(!!isStandalone);
      
      // Also mark as installed if standalone
      if (isStandalone) setInstalled(true);
    };

    checkStandalone();

    // 2. Listen for 'beforeinstallprompt' (The browser's install event)
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log('PWA: beforeinstallprompt event captured');
    };

    // 3. Listen for 'appinstalled' (User successfully installed)
    const handleAppInstalled = () => {
      setInstalled(true);
      console.log('PWA: App successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, setStandalone, setInstalled]);

  return null; // This component doesn't render anything
}
