'use client';

import React, { useState } from 'react';
import { 
  X, CreditCard, ShieldCheck, 
  ArrowRight, Sparkles, Loader2 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'add_money' | 'hybrid_pay';
  amountNeeded?: number;
}

export default function WalletModals({ isOpen, onClose, type, amountNeeded = 300 }: WalletModalProps) {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState(amountNeeded.toString());
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!user?.uid) return;
    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount < 5) return alert('Kripya ₹5 se zyada amount bhariye.');

    setLoading(true);
    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payAmount,
          userId: user.uid,
          type: type, // Passed correctly now
          firstName: user.displayName || 'BigSuno User',
          email: user.email || 'user@bigsuno.app',
          productInfo: type === 'add_money' ? 'Wallet Topup' : 'Session Payment'
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Create hidden form and submit to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.url;

      Object.entries(data.params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error(err);
      alert('Payment initialization failed: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center animate-fade-in shadow-2xl">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="w-full max-w-lg bg-white rounded-t-[3.5rem] p-8 md:p-12 relative z-10 animate-slide-up border-t border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
          <X size={20} />
        </button>

        <div className="space-y-8">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-inner">
                 <CreditCard size={28} />
              </div>
              <div>
                 <h2 className="text-2xl font-black tracking-tighter text-slate-900">
                   {type === 'add_money' ? 'Add Credits' : 'Hybrid Pay'}
                 </h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                   {type === 'add_money' ? 'Recharge BigSuno Wallet' : 'Secure Session Payment'}
                 </p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6 block">Bhariye Amount (₹)</label>
                 <div className="relative group">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-indigo-600 transition-colors">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-[2rem] pl-14 pr-8 text-4xl font-black text-slate-900 focus:border-indigo-500/20 focus:bg-white focus:outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 {[300, 500, 1000].map(val => (
                   <button 
                     key={val} 
                     onClick={() => setAmount(val.toString())}
                     className={`py-5 rounded-2xl border-2 text-[11px] font-black transition-all ${amount === val.toString() ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-indigo-600'}`}
                   >
                     ₹{val}
                   </button>
                 ))}
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                    <ShieldCheck size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">100% Secure via PayU India</span>
              </div>
              <Sparkles className="text-amber-400 w-4 h-4 animate-pulse" />
           </div>

           <button 
             onClick={handlePay}
             disabled={loading}
             className="w-full h-20 bg-slate-900 text-white rounded-[2rem] text-[11px] uppercase tracking-[0.3em] font-black flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:bg-black active:scale-95 transition-all disabled:opacity-50"
           >
             {loading ? (
               <Loader2 className="w-6 h-6 animate-spin" />
             ) : (
               <>
                 <span>Pay Securely Now</span>
                 <ArrowRight size={20} />
               </>
             )}
           </button>
           
           <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">By paying you agree to BigSuno Terms & Conditions</p>
        </div>
      </div>
    </div>
  );
}
