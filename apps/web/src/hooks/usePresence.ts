'use client';

import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';

export function usePresence(platform: 'web' | 'mobile' = 'web') {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    const updatePresence = async (isOnline: boolean) => {
      try {
        await updateDoc(userRef, {
          isOnline,
          lastActive: serverTimestamp(),
          platform,
        });
      } catch (err) {
        console.error('Presence update failed:', err);
      }
    };

    // Initial online update
    updatePresence(true);

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      updatePresence(true);
    }, 30000);

    // Handling visibility change (e.g. tab hidden)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
         // Optionally set to offline if hidden for a long time, 
         // but for now we'll just let heartbeat handle it or keep it online
      } else {
         updatePresence(true);
      }
    };

    // Handling tab close / window unload
    const handleUnload = () => {
       // Cloud functions or a separate listener usually handle dead sessions better,
       // but we can try a best-effort update here.
       const blob = new Blob([JSON.stringify({ isOnline: false })], { type: 'application/json' });
       // navigator.sendBeacon is better for unloads, but requires an API endpoint.
       // We'll trust the heartbeat timing out on the server-side logic for "lastActive" check.
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      updatePresence(false);
    };
  }, [user?.uid, platform]);
}
