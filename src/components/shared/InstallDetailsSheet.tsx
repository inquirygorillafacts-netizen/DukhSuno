'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import PWAInstall from './PWAInstall';

interface InstallDetailsSheetProps {
  onClose: () => void;
}

export default function InstallDetailsSheet({ onClose }: InstallDetailsSheetProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        {/* Content Card */}
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="w-full max-w-lg bg-white rounded-t-[3.5rem] md:rounded-[3rem] relative z-10 shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Top Decorative Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-[#ff4d6d] via-rose-400 to-indigo-500" />
          
          <div className="p-8 md:p-12 space-y-8">
             {/* Close Button */}
             <button 
                onClick={onClose} 
                className="absolute top-8 right-8 w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
             >
                <X size={24} />
             </button>

             {/* Header */}
             <div className="space-y-1">
                <span className="text-[10px] font-black text-[#ff4d6d] uppercase tracking-[0.4em] mb-1 block">Premium Web App</span>
                <h3 className="text-[32px] md:text-[36px] font-black text-slate-900 tracking-tighter uppercase leading-none italic">
                  Install BigSuno
                </h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 italic">Official v3.0 Native Experience ✨</p>
             </div>

             {/* Body */}
             <div className="space-y-8">
                {/* Hero Visual Card */}
                <div className="relative group p-12 rounded-[3rem] bg-slate-900 text-white overflow-hidden shadow-2xl shadow-indigo-100 border border-slate-800">
                   <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#ff4d6d] rounded-full blur-[80px] opacity-40 animate-pulse" />
                   <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-inner">
                         <Download className="text-rose-400 animate-bounce" size={32} />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-2xl font-black tracking-tighter uppercase italic">Mobile App Flow</h4>
                         <div className="flex items-center gap-2 justify-center">
                            <ShieldCheck size={12} className="text-rose-400" />
                            <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">Safe • Private • Secure</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-4">
                   {[
                     { title: 'Home Screen Icon', desc: 'Direct access from your mobile screen.', icon: <Zap className="text-amber-500" /> },
                     { title: 'Full Screen Mode', desc: 'Immersive experience without browser bars.', icon: <CheckCircle2 className="text-emerald-500" /> },
                     { title: 'Instant Load', desc: 'Optimized performance for faster browsing.', icon: <Sparkles className="text-rose-500" /> },
                   ].map((f, i) => (
                     <div key={i} className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-slate-50 group-hover:scale-110 transition-transform">
                           {f.icon}
                        </div>
                        <div>
                           <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{f.title}</h5>
                           <p className="text-[10px] text-slate-500 font-bold tracking-tight italic">{f.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Install Action */}
                <div className="pt-2">
                   <PWAInstall 
                     renderTrigger={(onClick: () => void, isVisible: boolean) => (
                       <button 
                         onClick={() => {
                           if (isVisible) onClick();
                           else alert('App pehle se hi installed hai ya browser support nahi karta! 👍');
                         }}
                         className="w-full h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-[18px] shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transition-all active:scale-95 group hover:bg-black uppercase tracking-[0.2em]"
                       >
                          <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                          <span>Instal Now</span>
                       </button>
                     )}
                   />
                </div>

                <div className="flex flex-col items-center gap-1 opacity-20 pt-2">
                   <div className="flex items-center gap-2">
                      <Sparkles size={8} className="fill-current text-[#ff4d6d]" />
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">Designed for Performance</p>
                      <Sparkles size={8} className="fill-current text-[#ff4d6d]" />
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
