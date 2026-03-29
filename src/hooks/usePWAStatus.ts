'use client';

import { useState, useEffect } from 'react';

export function usePWAStatus() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the page is opened in standalone mode
    const checkStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      
      setIsStandalone(!!isStandaloneMode);
    };

    checkStatus();
    
    // Listen for changes (though unlikely to change within a session)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStatus);
    
    return () => mediaQuery.removeEventListener('change', checkStatus);
  }, []);

  return { isStandalone };
}
