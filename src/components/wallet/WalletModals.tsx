'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CreditCard, ShieldCheck, 
  ArrowRight, Sparkles, Loader2,
  Lock,
  Zap,
  CheckCircle2
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
          type: type,
          firstName: user.displayName || 'BigSuno User',
          email: user.email || `${user.uid}@bigsuno.internal`,
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-lg bg-white rounded-t-[3rem] md:rounded-[3rem] relative z-10 shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Header Branding */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-[#ff4d6d] to-amber-400" />

            <div className="p-8 md:p-12 space-y-8">
               {/* Close Button */}
               <button 
                  onClick={onClose} 
                  className="absolute top-8 right-8 w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95"
               >
                  <X size={24} />
               </button>

               {/* Title Section */}
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-inner">
                     <CreditCard size={32} />
                  </div>
                  <div>
                     <h2 className="text-[28px] md:text-[34px] font-black tracking-tighter text-slate-900 leading-none">
                       {type === 'add_money' ? 'Add Credits' : 'Hybrid Pay'}
                     </h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
                       {type === 'add_money' ? 'Recharge BigSuno Wallet' : 'Secure Session Payment'}
                     </p>
                  </div>
               </div>

               {/* Amount Input */}
               <div className="space-y-6">
                  <div className="space-y-3">
                     <div className="flex items-center justify-between px-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 block">Bhariye Amount (₹)</label>
                        <Zap size={14} className="text-amber-400 animate-pulse" />
                     </div>
                     <div className="relative group">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-[45px] font-black text-slate-200 group-focus-within:text-indigo-600 transition-colors">₹</span>
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full h-28 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] pl-16 pr-8 text-[45px] font-black text-slate-900 tracking-tighter focus:border-indigo-500/20 focus:bg-white focus:outline-none transition-all shadow-inner"
                        />
                     </div>
                  </div>

                  {/* Preset Values */}
                  <div className="grid grid-cols-3 gap-3">
                     {[300, 500, 1000].map(val => (
                       <button 
                         key={val} 
                         onClick={() => setAmount(val.toString())}
                         className={`h-16 rounded-2xl border-2 text-[12px] font-black transition-all ${
                            amount === val.toString() 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-indigo-600'
                         }`}
                       >
                         ₹{val}
                       </button>
                     ))}
                  </div>
               </div>

               {/* Trust Footer Card */}
               <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                        <ShieldCheck size={20} />
                     </div>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">100% Secure Transaction</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verifyed by PayU India</span>
                     </div>
                  </div>
                  <Lock className="text-slate-300 w-4 h-4" />
               </div>

               {/* Primary Action */}
               <div className="space-y-4">
                  <button 
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full h-20 bg-[#ff4d6d] text-white rounded-[2.5rem] text-[16px] uppercase tracking-[0.2em] font-black flex items-center justify-center gap-4 shadow-2xl shadow-rose-200 hover:bg-[#ff1a43] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Pay Securely Now</span>
                        <ArrowRight size={22} />
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2">
                     <CheckCircle2 size={12} className="text-emerald-500" />
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">Instant balance update after payment</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
