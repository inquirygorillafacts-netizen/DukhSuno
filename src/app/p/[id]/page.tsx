'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PublicProfileView } from '@/components/profile/PublicProfileView';
import type { DukhSunoUser } from '@/types';

export default function PublicProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [provider, setProvider] = useState<DukhSunoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
          setProvider(docSnap.data() as DukhSunoUser);
        }
      } catch (err) {
        console.error('Error fetching provider:', err);
      } finally {
        setLoading(false);
      }
    };

    if (uid) fetchProvider();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Profile Not Found 💔</h1>
        <p className="text-slate-500 font-medium">Ye profile shayad exist nahi karti ya delete ho gayi hai.</p>
      </div>
    );
  }

  return <PublicProfileView provider={provider} />;
}
