'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { 
  IndianRupee, 
  PhoneIncoming, 
  Star, 
  Sparkles,
  PhoneOff,
  History,
  Radio
} from 'lucide-react';
import Link from 'next/link';
import { doc, updateDoc, onSnapshot, query, collection, where, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session } from '@/types';
import React from 'react';

export default function SunneDashboardPage() {
  const { user, setUser } = useAuthStore();
  const [isLive, setIsLive] = useState(user?.isAvailable || false);
  const [isToggling, setIsToggling] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // User profile listener
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({ ...user, ...data });
        setIsLive(data.isAvailable);
      }
    });

    // Pending call listener
    const qPending = query(
      collection(db, 'sessions'),
      where('listenerId', '==', user.uid),
      where('status', '==', 'pending'),
      limit(1)
    );
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      if (!snapshot.empty) {
        router.push(`/call/${snapshot.docs[0].id}`);
      }
    });

    // All calls listener
    const qAll = query(
      collection(db, 'sessions'),
      where('listenerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5) // Just a few for the simplified dashboard view
    );
    const unsubscribeAll = onSnapshot(qAll, (snapshot) => {
      const allSessions = snapshot.docs.map(doc => ({ sessionId: doc.id, ...doc.data() } as any));
      setSessions(allSessions);
    });

    return () => {
      unsubscribeUser();
      unsubscribePending();
      unsubscribeAll();
    };
  }, [user?.uid]);

  const toggleLive = async () => {
    if (!user || isToggling) return;
    setIsToggling(true);
    const newStatus = !isLive;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), { isAvailable: newStatus });
      setIsLive(newStatus);
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2">
      
      {/* Live Toggle Section */}
      <section className="p-6 md:p-10 glass bg-white rounded-3xl border border-white shadow-sm relative group overflow-hidden">
        <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-[100px] transition-colors duration-1000 ${isLive ? 'bg-green-500/10' : 'bg-slate-500/5'}`} />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1 shadow-rose-200">
              {isLive ? 'Aap Online Hain' : 'Abhi Offline Hain'}
            </h3>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium tracking-tight">
              {isLive ? 'Taiyaar rahiye, koi bhi dost jud sakta hai.' : 'Calls pane ke liye online jayein.'}
            </p>
          </div>

          <button 
            onClick={toggleLive}
            disabled={isToggling}
            className={`relative w-16 h-8 md:w-20 md:h-10 rounded-full transition-all duration-500 p-1.5 ${isLive ? 'bg-emerald-500/20 ring-4 ring-emerald-500/10' : 'bg-slate-100'}`}
          >
            <div className={`w-5 h-5 md:w-7 md:h-7 rounded-full shadow-lg transform transition-all duration-500 flex items-center justify-center ${isLive ? 'translate-x-8 md:translate-x-10 bg-emerald-500' : 'translate-x-0 bg-white'}`}>
              {isToggling ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Radio size={isLive ? 14 : 12} className={isLive ? 'text-white' : 'text-slate-300'} />
              )}
            </div>
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <StatBox 
          label="Today's Earnings" 
          value={`₹${user?.totalEarnings || 0}`} 
          icon={<IndianRupee />} 
          color="emerald"
        />
        <StatBox 
          label="Success Rate" 
          value="98%" 
          icon={<Sparkles />} 
          color="indigo"
          trend="+2%"
        />
        <StatBox 
          label="Total Calls" 
          value={user?.totalSessions || 0} 
          icon={<PhoneIncoming />} 
          color="slate"
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Recent History Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Recent Sessions</span>
           </div>
           <Link href="/sunne/calls" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
              View All
           </Link>
        </div>

        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.sessionId} className="glass bg-white p-4 rounded-3xl border border-white flex items-center justify-between hover:scale-[1.01] transition-transform group">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <PhoneIncoming size={16} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Session #{session.sessionId.slice(-4).toUpperCase()}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {(session.createdAt as any)?.toDate 
                          ? (session.createdAt as any).toDate().toLocaleDateString() 
                          : new Date(session.createdAt).toLocaleDateString()}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-base font-black text-emerald-600 tracking-tighter italic">₹{session.listenerEarned || 0}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{Math.floor((session.durationSeconds || 0) / 60)} mins</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-[3rem] border border-slate-100 bg-slate-50/30">
               <History size={40} className="mx-auto mb-4 text-slate-200" />
               <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest leading-loose italic">Abhi koi call history nahi hai.<br/>Doston ka wait karein!</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Banner */}
      <div className="p-6 md:p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
                <h4 className="text-lg md:text-xl font-black tracking-tighter uppercase mb-2">Aapka Support Zaruri Hai ❤️</h4>
                <p className="text-[10px] md:text-sm text-slate-400 font-medium leading-relaxed">Koshish karein ki har call attend ho sake. Aapka support kisi ki life badal sakta hai.</p>
            </div>
            <button onClick={() => alert('Community Guidelines are being updated! 📜')} className="bg-emerald-500 text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95">
               Guidelines Padhein
            </button>
         </div>
      </div>

    </div>
  );
}

function StatBox({ label, value, icon, color, trend, className = "" }: any) {
  const colorMap: any = {
    rose: 'text-rose-500 bg-rose-50',
    amber: 'text-amber-500 bg-amber-50',
    indigo: 'text-indigo-500 bg-indigo-50',
    emerald: 'text-emerald-500 bg-emerald-50',
    slate: 'text-slate-500 bg-slate-50'
  };

  return (
    <div className={`glass bg-white p-4 md:p-6 rounded-3xl md:rounded-[2rem] border border-white shadow-sm hover:shadow-xl transition-all group ${className}`}>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 shadow-inner ${colorMap[color]}`}>
        {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
      </div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-end gap-1.5">
           <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter leading-none">{value}</h4>
           {trend && <span className="text-[9px] font-black text-green-500 mb-0.5 leading-none">{trend}</span>}
        </div>
      </div>
    </div>
  );
}
