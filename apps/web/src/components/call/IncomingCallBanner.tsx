'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Phone, PhoneOff } from 'lucide-react';

// This component can be placed in `layout.tsx` so it listens globally
export function IncomingCallBanner() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Dummy state - in reality, listen to Firebase RTDB for incoming offers
  const [incomingCall, setIncomingCall] = useState<any>(null);

  // Auto-hide after 30s if missed
  useEffect(() => {
    if (incomingCall) {
      const timer = setTimeout(() => setIncomingCall(null), 30000);
      return () => clearTimeout(timer);
    }
  }, [incomingCall]);

  if (!incomingCall || !user?.roles?.includes('sunne_wala')) return null;

  const handleAccept = () => {
    // Jump to active call screen
    router.push(`/call/${incomingCall.sessionId}`);
    setIncomingCall(null);
  };

  const handleReject = () => {
    // Write rejection to RTDB
    setIncomingCall(null);
  };

  return (
    <div className="fixed top-6 left-6 right-6 z-50 animate-slide-down max-w-lg mx-auto">
      <div className="glass-container border-white/40 rounded-main p-5 shadow-2xl flex items-center gap-5">
        
        {/* DP */}
        <div className="w-14 h-14 rounded-full bg-accent-soft text-2xl flex items-center justify-center border-2 border-accent relative">
          <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-50" />
          {incomingCall.callerAvatar?.startsWith('emoji:') ? incomingCall.callerAvatar.split(':')[1] : '👤'}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-[11px] font-black text-accent/60 uppercase tracking-[0.3em]">Incoming Call</p>
          <p className="text-[18px] font-black text-text tracking-tight mt-0.5">{incomingCall.callerName}</p>
          <p className="text-[12px] text-text-secondary font-medium italic">{incomingCall.planMinutes} minutes session</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={handleReject} className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error hover:bg-error hover:text-white transition-all shadow-sm">
            <PhoneOff size={22} strokeWidth={2.5} />
          </button>
          <button onClick={handleAccept} className="w-12 h-12 rounded-2xl btn-primary flex items-center justify-center text-white shadow-xl shadow-accent/20 animate-pulse active:scale-95">
            <Phone size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
