'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { 
  PhoneIncoming, 
  PhoneOff, 
  Star, 
  History,
  Filter
} from 'lucide-react';
import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session } from '@/types';
import React from 'react';

export default function SunneCallsPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const qAll = query(
      collection(db, 'sessions'),
      where('listenerId', '==', user.uid), // Database field
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(qAll, (snapshot) => {
      const allSessions = snapshot.docs.map(doc => ({ sessionId: doc.id, ...doc.data() } as Session));
      setSessions(allSessions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const renderCallCard = (session: Session) => {
    const isMissed = session.status === 'missed';
    return (
      <div key={session.sessionId} className="glass bg-white p-5 rounded-[2.5rem] border border-white flex items-center gap-5 hover:shadow-xl transition-all active:scale-[0.98] group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${isMissed ? 'bg-rose-50 text-[#ff4d6d]' : 'bg-emerald-50 text-emerald-500'}`}>
          {isMissed ? <PhoneOff size={22} /> : <PhoneIncoming size={22} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h4 className="font-bold truncate text-lg text-slate-800 uppercase tracking-tighter">Session #{session.sessionId.slice(-4).toUpperCase()}</h4>
            <p className="font-black text-lg text-[#ff4d6d]">₹{session.listenerEarned || session.providerEarned || 0}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {session.durationSeconds ? `${Math.floor(session.durationSeconds / 60)} min` : 'Missed'} · {(session.createdAt as any)?.toDate ? (session.createdAt as any).toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'}
            </p>
            {session.rating && (
              <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-black tracking-tighter shadow-sm border border-amber-100">
                ★ {session.rating}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
      <div className="flex items-center justify-between px-2">
         <div className="grid grid-cols-2 gap-4 w-full">
            <StatSmall label="Total Calls" value={sessions.length.toString()} color="slate" />
            <StatSmall label="Completed" value={sessions.filter(s => s.status === 'completed').length.toString()} color="emerald" />
         </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">All Time History</span>
          <Filter size={16} className="text-slate-300 cursor-pointer hover:text-[#ff4d6d] transition-colors" />
        </div>
        
        <div className="space-y-3 pb-24">
          {loading ? (
             <div className="p-20 text-center glass bg-white/40 rounded-[2.5rem] border-dashed border-2 border-slate-200 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Logs...</p>
             </div>
          ) : sessions.length > 0 ? (
            sessions.map(renderCallCard)
          ) : (
            <div className="p-20 text-center glass bg-white/40 rounded-[2.5rem] border-dashed border-2 border-slate-100">
              <History className="mx-auto mb-4 text-slate-100" size={64} strokeWidth={1} />
              <p className="text-slate-400 font-medium italic">Abhi tak koi activity nahi hui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatSmall = ({ label, value, color }: { label: string, value: string, color: 'slate' | 'emerald' }) => (
  <div className="glass bg-white p-6 rounded-[2rem] border border-white shadow-sm text-center">
    <p className={`text-3xl font-black tracking-tighter ${color === 'emerald' ? 'text-emerald-500' : 'text-slate-900'}`}>{value}</p>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);
