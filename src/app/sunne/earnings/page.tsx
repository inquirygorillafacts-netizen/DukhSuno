'use client';

import { useAuthStore } from '@/stores/auth-store';
import { IndianRupee, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import React from 'react';

export default function SunneEarningsPage() {
  const { user } = useAuthStore();

  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    // Simplified for this task, I'll use the standard onSnapshot
    const { query, collection, where, orderBy, limit, onSnapshot } = require('firebase/firestore');
    const { db } = require('@/lib/firebase');

    const fireQ = query(
      collection(db, 'sessions'),
      where('listenerId', '==', user.uid),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(fireQ, (snapshot: any) => {
      const list = snapshot.docs.map((doc: any) => ({ sessionId: doc.id, ...doc.data() }));
      setSessions(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2">
      {/* Balance Card - MASTER DESIGN STYLE */}
      <div className="glass bg-white p-6 md:p-10 rounded-3xl text-center relative overflow-hidden border border-white shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ff4d6d] to-rose-300"></div>
        <p className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-3 mt-3">Available Balance</p>
        <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-none inline-flex items-center justify-center">
          <IndianRupee className="w-8 h-8 md:w-12 md:h-12 text-[#ff4d6d]/20 -mr-1 md:-mr-2" strokeWidth={3} />
          <span>{user?.availableBalance || 0}</span>
        </h3>
        <button onClick={() => alert('Withdrawal request system is being finalized! 💸')} className="w-full py-4 rounded-xl bg-[#ff4d6d] text-white font-black text-sm shadow-xl shadow-rose-200 hover:bg-rose-500 transition-all active:scale-95 hover:-translate-y-1 flex items-center justify-center gap-3 uppercase tracking-widest">
           <ArrowUpRight size={18} strokeWidth={3} />
           Withdraw to UPI
        </button>
        <p className="text-[9px] text-slate-400 mt-6 font-bold uppercase tracking-widest">Min withdrawal: ₹100</p>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass bg-white p-4 rounded-2xl border border-white text-center">
           <p className="text-lg font-black tracking-tighter">₹{user?.totalEarnings || 0}</p>
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Earned</p>
        </div>
        <div className="glass bg-white p-4 rounded-2xl border border-white text-center">
           <p className="text-lg font-black text-emerald-500 tracking-tighter">₹0</p>
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending</p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Transaction History</span>
        </div>
        <div className="space-y-3 pb-24">
          {loading ? (
            <div className="p-6 text-center animate-pulse uppercase text-[9px] font-black tracking-widest text-slate-400">Loading History...</div>
          ) : sessions.map((item: any) => (
            <div key={item.sessionId} className="glass bg-white p-4 rounded-2xl border border-white flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={18} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-xs uppercase tracking-tighter">Session Completed</h5>
                <p className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">
                    {(item.createdAt as any)?.toDate 
                        ? (item.createdAt as any).toDate().toLocaleString() 
                        : 'Recent'} · {Math.floor((item.durationSeconds || 0) / 60)} min
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-base text-emerald-500 tracking-tighter">+₹{item.listenerEarned || 0}</p>
              </div>
            </div>
          ))}
          
          {!loading && sessions.length === 0 && (
            <div className="p-12 text-center glass rounded-[3rem] bg-white/40 border border-white mt-6 border-dashed opacity-50">
              <Sparkles className="w-8 h-8 text-[#ff4d6d]/30 mx-auto mb-3" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aapka passbook bahut saaf hai ✨</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
