import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { BigSunoUser } from '@/types';

export function useRealtimeUser(uid: string | undefined) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // optionally update local state or global auth store
        // setUser({ uid, ...data });
      }
    });

    return () => unsubscribe();
  }, [uid, setUser]);
}
