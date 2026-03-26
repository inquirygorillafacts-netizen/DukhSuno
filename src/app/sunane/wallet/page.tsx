'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Plus, Wallet, ShieldCheck, Zap, History, ChevronRight } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import React from 'react';

export default function WalletPage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUser({ ...user, ...docSnap.data() });
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const balance = user?.creditBalance || 0;
  const quickAmounts = [100, 250, 500, 1000];

  const handleAddCredits = async (amount: number) => {
    if (amount <= 0 || !user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          userId: user.uid,
          type: 'credit_reload',
        }),
      });

      const params = await res.json();
      if (params.error) throw new Error(params.error);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = process.env.NEXT_PUBLIC_PAYU_BASE_URL || 'https://secure.payu.in/_payment';

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Payment initiation failed:', err);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24">
      
      {/* 5XL Balance Display */}
      <section className="text-center pt-8 relative overflow-hidden group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-2 italic">Available Balance</span>
        <div className="flex items-center justify-center gap-2">
           <span className="text-2xl font-black text-slate-300">₹</span>
           <h2 className="text-5xl md:text-7xl font-black text-rose-600 tracking-tighter leading-none italic">
              {balance}
           </h2>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
           <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><ShieldCheck size={12} /></div>
           Securely managed by PayU India
        </p>
      </section>

      {/* Quick Reload Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Quick Reload</span>
           <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">₹1 = 1 Credit</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {quickAmounts.map((amt) => (
             <button
               key={amt}
               disabled={loading}
               onClick={() => handleAddCredits(amt)}
               className="glass bg-white border border-slate-100 p-5 rounded-3xl text-center group hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-900/5 transition-all active:scale-95 disabled:opacity-50"
             >
               <Zap size={14} className="mx-auto mb-2 text-rose-300 group-hover:text-rose-500 transition-colors" fill="currentColor" />
               <p className="text-xl font-black text-slate-800 tracking-tighter italic">₹{amt}</p>
               <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Recharge</p>
             </button>
           ))}
        </div>
      </section>

      {/* Custom Amount / Info */}
      <div className="p-6 md:p-10 glass bg-white rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
         <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner border border-rose-100/50">
               <Wallet className="text-rose-500 w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h4 className="text-lg md:text-xl font-black leading-none mb-1 uppercase tracking-tighter italic">Sab Kuch Safe Hai</h4>
               <p className="text-[9px] md:text-sm text-slate-500 font-medium leading-relaxed">Aapke credits kabhi expire nahi honge.</p>
            </div>
            <button className="bg-slate-900 text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl active:scale-95">
               Support
            </button>
         </div>
      </div>

      {/* History Preview */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Transactions</span>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1 transition-colors">
               See All <ChevronRight size={12} />
            </button>
         </div>

         <div className="space-y-4">
            <div className="glass bg-slate-50/50 p-8 rounded-3xl border-dashed border-2 border-slate-100 text-center">
               <History size={32} className="mx-auto mb-3 text-slate-200" />
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Abhi koi transaction nahi hai.</p>
            </div>
         </div>
      </section>

    </div>
  );
}
