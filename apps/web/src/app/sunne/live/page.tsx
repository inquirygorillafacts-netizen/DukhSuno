'use client';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SunneLivePage() {
  const { user, setUser } = useAuthStore();
  const [isLive, setIsLive] = useState(user?.isAvailable || false);
  const [toggling, setToggling] = useState(false);

  const toggleLive = async () => {
    if (!user) return;
    setToggling(true);
    const newState = !isLive;
    try {
      await updateDoc(doc(db, 'users', user.uid), { isAvailable: newState });
      setIsLive(newState);
      setUser({ ...user, isAvailable: newState });
    } catch (e) {
      console.error(e);
    }
    setToggling(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Big Toggle */}
      <div className="animate-fade-in text-center">
        <button onClick={toggleLive} disabled={toggling}
          className={`w-40 h-40 rounded-full flex items-center justify-center text-5xl transition-all duration-300 ${
            isLive ? 'bg-success text-white shadow-lg animate-pulse-green' : 'bg-surface-2 text-text-muted border-2 border-border'
          }`}>
          {toggling ? (
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : isLive ? '🟢' : '⚪'}
        </button>

        <h2 className="mt-6 text-[24px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {isLive ? 'Aap Live Hain! 🎉' : 'Offline Hain'}
        </h2>
        <p className="mt-2 text-text-muted text-[14px]">
          {isLive ? 'Sunane wale aapko dekh sakte hain. Calls aa sakti hain.' : 'Live hone ke liye button dabao.'}
        </p>
      </div>

      {isLive && (
        <div className="mt-8 p-4 rounded-2xl bg-success-soft border border-success/20 w-full max-w-sm animate-fade-in-up">
          <p className="text-[13px] text-success font-medium text-center">
            💡 App band mat karo — taki call aa sake
          </p>
        </div>
      )}
    </div>
  );
}
