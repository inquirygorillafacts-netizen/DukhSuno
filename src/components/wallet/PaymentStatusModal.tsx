'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, HelpCircle, Sparkles, Receipt, ShieldCheck } from 'lucide-react';

interface PaymentStatusModalProps {
  status: 'success' | 'failed' | null;
  txnid?: string;
  amount?: string;
  onClose: () => void;
}

export default function PaymentStatusModal({ status, txnid, amount, onClose }: PaymentStatusModalProps) {
  if (!status) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />
      
      {/* Compact Card */}
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative z-10 shadow-2xl border border-slate-100"
      >
        {/* Top Accent Bar */}
        <div className={`h-2 w-full ${status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

        <div className="p-8 md:p-10 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-2 ${status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {status === 'success' ? (
                <CheckCircle2 size={40} strokeWidth={2.5} className="animate-in zoom-in duration-500" />
              ) : (
                <XCircle size={40} strokeWidth={2.5} className="animate-in zoom-in duration-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {status === 'success' ? 'Payment Success!' : 'Payment Failed'}
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px] mx-auto capitalize">
                {status === 'success' 
                  ? 'Aapka payment safal raha. Wallet balance turant update kar diya gaya hai.' 
                  : 'Dukh ki baat hai, payment process nahi ho paya. Kripya bank ki detailing check karein.'}
              </p>
            </div>
          </div>

          {/* Receipt Section */}
          <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 space-y-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 pointer-events-none">
                <Receipt size={80} />
             </div>
             
             <div className="flex justify-between items-center relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference ID</span>
               <span className="text-[11px] font-bold text-slate-900 font-mono tracking-tighter bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                 {txnid?.split('_').slice(-1)[0] || 'DS_XXXX'}
               </span>
             </div>

             <div className="flex justify-between items-center relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Credits</span>
               <div className="text-center">
                 <span className="text-2xl font-black text-slate-900 leading-none">₹{amount || '0.00'}</span>
               </div>
             </div>
          </div>

          {/* Action Footer */}
          <div className="space-y-3 pt-2">
            {status === 'success' ? (
              <button 
                onClick={onClose}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-black active:scale-95 transition-all"
              >
                <span>Perfect, Done</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button 
                  onClick={onClose}
                  className="w-full h-16 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
                >
                  <RefreshCcw size={18} />
                  <span>Try Again Now</span>
                </button>
                <button 
                  onClick={() => alert('Support connect ho raha hai...')}
                  className="w-full h-14 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-slate-400 hover:text-slate-600 transition-all"
                >
                  <HelpCircle size={16} />
                  Contact Support
                </button>
              </>
            )}
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-300">
             <ShieldCheck size={12} className="text-slate-200" />
             <span>Transaction secured by PayU SSL</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
