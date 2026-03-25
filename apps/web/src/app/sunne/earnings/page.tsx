'use client';

import { useAuthStore } from '@/stores/auth-store';
import { IndianRupee, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import React from 'react';

export default function SunneEarningsPage() {
  const { user } = useAuthStore();

  const earningsHistory = [
    { caller: 'Ek dost', time: 'Aaj, 12:30 PM', duration: '8 min', amount: 80 },
    { caller: 'Ek dost', time: 'Aaj, 11:15 AM', duration: '15 min', amount: 120 },
    { caller: 'Ek dost', time: 'Kal, 5:00 PM', duration: '30 min', amount: 200 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
      {/* Balance Card - MASTER DESIGN STYLE */}
      <div className="glass bg-white dark:bg-white/5 p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] text-center relative overflow-hidden border border-white dark:border-white/10 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ff4d6d] to-rose-300"></div>
        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-4 mt-4">Available Balance</p>
        <h3 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter leading-none inline-flex items-center justify-center">
          <IndianRupee className="w-10 h-10 md:w-16 md:h-16 text-[#ff4d6d]/20 -mr-2 md:-mr-4" strokeWidth={3} />
          <span>{user?.availableBalance || 0}</span>
        </h3>
        <button className="w-full py-6 rounded-3xl bg-[#ff4d6d] text-white font-black text-lg shadow-2xl shadow-rose-200 dark:shadow-none hover:bg-rose-500 transition-all active:scale-95 hover:-translate-y-1 flex items-center justify-center gap-3 uppercase tracking-widest">
           <ArrowUpRight size={24} strokeWidth={3} />
           Withdraw to UPI
        </button>
        <p className="text-[10px] text-slate-400 mt-8 font-bold uppercase tracking-widest">Minimum withdrawal: ₹100</p>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-white dark:border-white/10 text-center">
           <p className="text-2xl font-black dark:text-white tracking-tighter">₹{user?.totalEarnings || 0}</p>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Earned</p>
        </div>
        <div className="glass bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-white dark:border-white/10 text-center">
           <p className="text-2xl font-black text-emerald-500 tracking-tighter">₹0</p>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending</p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Transaction History</span>
        </div>
        <div className="space-y-3 pb-24">
          {earningsHistory.map((item, i) => (
            <div key={i} className="glass bg-white dark:bg-white/5 p-5 rounded-[2rem] border border-white dark:border-white/10 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={22} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-sm dark:text-white uppercase tracking-tighter">{item.caller}</h5>
                <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">{item.time} · {item.duration}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-emerald-500 tracking-tighter">+₹{item.amount}</p>
              </div>
            </div>
          ))}
          
          <div className="p-12 text-center glass rounded-[3rem] bg-white/40 dark:bg-white/5 border border-white dark:border-white/10 mt-6 border-dashed opacity-50">
            <Sparkles className="w-8 h-8 text-[#ff4d6d]/30 mx-auto mb-3" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aapka passbook bahut saaf hai ✨</p>
          </div>
        </div>
      </div>
    </div>
  );
}
