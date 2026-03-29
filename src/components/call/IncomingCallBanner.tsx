'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Phone, PhoneOff, BellRing } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function IncomingCallBanner() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user?.uid || !user?.roles?.includes('provider')) return;

    // Evaluate listen IDs based on roles
    const listenIds = [user.uid];
    if (user.roles?.includes('admin')) {
      listenIds.push('all_admins');
    }

    // Listen for sessions where this user (or all admins) is targeted and it's currently ringing
    const q = query(
      collection(db, 'sessions'),
      where('listenerId', 'in', listenIds),
      where('status', '==', 'ringing'),
       limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setIncomingCall(callData);
        
        // Play Ringtone
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      } else {
        setIncomingCall(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, user?.roles]);

  const handleAccept = async () => {
    if (!incomingCall || !user) return;
    
    // Stop Ringtone
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      // Don't set active here! WebRTC onConnected will handle it. Just set acceptedAt
      // Crucially, lock the session to this specific admin if it was a broadcast
      await updateDoc(doc(db, 'sessions', incomingCall.id), {
        status: 'connecting',
        listenerId: user.uid,
        listenerName: user.displayName || 'Support Admin',
        listenerAvatar: user.avatarUrl || 'emoji:🛡️',
        acceptedAt: new Date()
      });
      
      router.push(`/call/${incomingCall.id}`);
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to accept call:', err);
    }
  };

  const handleReject = async () => {
    if (!incomingCall) return;

    if (audioRef.current) {
        audioRef.current.pause();
    }

    try {
      await updateDoc(doc(db, 'sessions', incomingCall.id), {
        status: 'missed',
        endedAt: new Date(),
        missedBy: 'listener'
      });
      
      // Auto-refund trigger
      fetch('/api/sessions/missed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: incomingCall.id })
      }).catch(console.error);

      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to reject call:', err);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed top-6 left-6 right-6 z-[9999] animate-slide-down max-w-lg mx-auto">
      <audio ref={audioRef} src="/ringtone.mp3" loop />
      
      <div className="glass-container bg-white/90 border-emerald-500/30 rounded-[2.5rem] p-6 shadow-2xl flex items-center gap-5 backdrop-blur-3xl overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
        
        {/* DP */}
        <div className="w-16 h-16 rounded-[1.8rem] bg-emerald-50 text-3xl flex items-center justify-center border-2 border-emerald-500/20 relative shadow-inner">
          <div className="absolute inset-0 rounded-[1.8rem] border-2 border-emerald-500 animate-ping opacity-30" />
          {incomingCall.callerAvatar?.startsWith('emoji:') ? incomingCall.callerAvatar.split(':')[1] : '👤'}
        </div>

        {/* Info */}
        <div className="flex-1">
          {incomingCall.listenerId === 'all_admins' ? (
            <div className="flex items-center gap-2 mb-1">
               <BellRing size={12} className="text-red-500 animate-bounce" />
               <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">🚨 EMERGENCY URGENT CALL</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
               <BellRing size={12} className="text-emerald-500 animate-bounce" />
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Incoming Support Request</p>
            </div>
          )}
          <p className="text-[20px] font-black text-slate-900 tracking-tighter leading-none mb-1 uppercase italic">
            {incomingCall.callerName || 'Unknown Seeker'}
          </p>
          <p className="text-[11px] text-slate-400 font-bold tracking-tight uppercase">
            {incomingCall.planMinutes || 0} Minute Session Requested
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReject} 
            className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
          >
            <PhoneOff size={24} strokeWidth={2.5} />
          </button>
          <button 
            onClick={handleAccept} 
            className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-pulse active:scale-95"
          >
            <Phone size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

