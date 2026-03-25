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
    <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-2">
      
      {/* Live Toggle Section */}
      <section className="p-8 md:p-12 glass bg-white dark:bg-white/5 rounded-[3rem] border border-white dark:border-white/10 shadow-sm relative group overflow-hidden">
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] transition-colors duration-1000 ${isLive ? 'bg-green-500/10' : 'bg-slate-500/5'}`} />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-2 italic">
              {isLive ? 'Aap Online Hain' : 'Abhi Offline Hain'}
            </h3>
            <p className="text-xs md:text-sm text-slate-500 font-medium tracking-tight">
              {isLive ? 'Taiyaar rahiye, koi bhi dost jud sakta hai.' : 'Calls pane ke liye online jayein.'}
            </p>
          </div>

          <button 
            onClick={toggleLive}
            disabled={isToggling}
            className={`relative w-24 h-12 md:w-32 md:h-16 rounded-full transition-all duration-500 p-2 ${isLive ? 'bg-emerald-500/20 ring-4 ring-emerald-500/10' : 'bg-slate-100 dark:bg-white/10'}`}
          >
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full shadow-xl transform transition-all duration-500 flex items-center justify-center ${isLive ? 'translate-x-12 md:translate-x-16 bg-emerald-500' : 'translate-x-0 bg-white dark:bg-slate-800'}`}>
              {isToggling ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Radio size={isLive ? 24 : 20} className={isLive ? 'text-white' : 'text-slate-300'} />
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
              <div key={session.sessionId} className="glass bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-white dark:border-white/10 flex items-center justify-between hover:scale-[1.01] transition-transform group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10 group-hover:text-emerald-600 transition-colors">
                      <PhoneIncoming size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Session #{session.sessionId.slice(-4).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {(session.createdAt as any)?.toDate 
                          ? (session.createdAt as any).toDate().toLocaleDateString() 
                          : new Date(session.createdAt).toLocaleDateString()}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-lg font-black text-emerald-600 tracking-tighter italic">₹{session.listenerEarned || 0}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{Math.floor((session.durationSeconds || 0) / 60)} mins</p>
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
      <div className="p-8 md:p-12 rounded-[3.5rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md">
                <h4 className="text-2xl md:text-3xl font-black tracking-tighter uppercase mb-2">Aapka Support Zaruri Hai ❤️</h4>
                <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">Koshish karein ki har call attend ho sake. Aapki ek baat kisi ka din badal sakti hai. Professional rahein aur dil se sunein.</p>
            </div>
            <button className="bg-emerald-500 text-white px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95">
               Guidelines Padhein
            </button>
         </div>
      </div>

    </div>
  );
}

function StatBox({ label, value, icon, color, trend, className = "" }: any) {
  const colorMap: any = {
    rose: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    slate: 'text-slate-500 bg-slate-50 dark:bg-slate-900/20'
  };

  return (
    <div className={`glass bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white dark:border-white/10 shadow-sm hover:shadow-xl transition-all group ${className}`}>
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[1.8rem] flex items-center justify-center mb-6 shadow-inner ${colorMap[color]}`}>
        {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-end gap-2">
           <h4 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{value}</h4>
           {trend && <span className="text-[10px] font-black text-green-500 mb-1 leading-none">{trend}</span>}
        </div>
      </div>
    </div>
  );
}
