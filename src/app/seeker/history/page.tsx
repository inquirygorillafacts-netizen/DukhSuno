'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { 
  PhoneOutgoing, 
  PhoneOff, 
  History,
  Filter,
  Activity,
  AlertCircle,
  Clock
} from 'lucide-react';
import { query, collection, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session } from '@/types';
import React from 'react';

export default function SeekerHistoryPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Filter sessions where the user is the caller (userId)
    const qAll = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
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
    const isMissed = ['missed', 'cancelled_by_listener', 'timeout', 'rejected'].includes(session.status || '');
    const isCompleted = session.status === 'completed' || session.status === 'active';
    
    // Calculate display duration or status
    let durationText = 'Missed';
    if (session.durationSeconds || session.actualDurationSeconds) {
        const secs = session.actualDurationSeconds || session.durationSeconds || 0;
        durationText = `${Math.floor(secs / 60)} mins`;
    } else if (session.status === 'completed') {
        durationText = 'Completed';
    } else if (session.status === 'timeout') {
        durationText = 'No Answer';
    } else if (session.status === 'rejected') {
        durationText = 'Rejected';
    }

    return (
      <div key={session.sessionId} className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-sm flex items-center gap-5 hover:shadow-lg transition-all active:scale-[0.98] group">
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 ${isMissed ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
          {isMissed ? <PhoneOff size={22} /> : <PhoneOutgoing size={22} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-black truncate text-base text-slate-800 uppercase tracking-tighter">Talk #{session.sessionId.slice(-4).toUpperCase()}</h4>
            {isCompleted ? (
                <p className="font-black text-base text-slate-900">-₹{session.creditsUsed || 0}</p>
            ) : (
                <p className="font-black text-[10px] text-slate-300 uppercase tracking-widest line-through">₹{session.creditsUsed || 0}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className={`text-[10px] font-black uppercase tracking-widest ${isMissed ? 'text-rose-400' : 'text-slate-400'}`}>
              {durationText} · {(session.createdAt as any)?.toDate ? (session.createdAt as any).toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'}
            </p>
            {session.status === 'active' && (
                <span className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest animate-pulse">
                  Active
                </span>
            )}
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

  // Only sum credits for truly billed sessions
  const totalSpent = sessions
    .filter(s => s.status === 'completed' || s.status === 'active')
    .reduce((acc, curr) => acc + (curr.creditsUsed || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
      <div className="flex items-center justify-between px-2">
         <div className="grid grid-cols-2 gap-4 w-full">
            <StatSmall 
              label="Total Consults" 
              value={sessions.filter(s => s.status === 'completed' || s.status === 'active').length.toString()} 
              color="slate" 
              icon={<Clock size={16} />}
            />
            <StatSmall 
                label="Total Spent" 
                value={`₹${totalSpent}`} 
                color="indigo" 
                icon={<AlertCircle size={16} />}
            />
         </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Consultation Logs</span>
          <Filter size={16} className="text-slate-300 cursor-pointer hover:text-indigo-600 transition-colors" />
        </div>
        
        <div className="space-y-3 pb-24">
          {loading ? (
             <div className="p-20 text-center bg-white/40 backdrop-blur-sm rounded-[2.5rem] border-dashed border-2 border-slate-200 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading History...</p>
             </div>
          ) : sessions.length > 0 ? (
            sessions.map(renderCallCard)
          ) : (
            <div className="p-20 text-center bg-white/40 backdrop-blur-sm rounded-[2.5rem] border-dashed border-2 border-slate-100">
              <Activity className="mx-auto mb-4 text-slate-200" size={48} strokeWidth={1.5} />
              <p className="text-slate-500 font-bold text-sm tracking-tight">No consultations found yet.</p>
              <p className="text-slate-400 text-xs mt-1">Your past calls will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatSmall = ({ label, value, color, icon }: { label: string, value: string, color: 'slate' | 'indigo', icon: React.ReactNode }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm text-center relative overflow-hidden group">
    <div className={`absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-150 duration-700 ${color === 'indigo' ? 'text-indigo-600' : 'text-slate-800'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 64 })}
    </div>
    <p className={`text-4xl font-black tracking-tighter italic ${color === 'indigo' ? 'text-indigo-700' : 'text-slate-900'}`}>{value}</p>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);
