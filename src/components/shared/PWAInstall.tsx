'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Zap, Bell, Shield, Smartphone, X, ArrowRight, Heart, Star } from 'lucide-react';

interface Props {
  onInstallStarted?: () => void;
  renderTrigger?: (onClick: () => void, isVisible: boolean) => React.ReactNode;
}

export default function PWAInstall({ renderTrigger }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Hide our benefit sheet
    setShowSheet(false);
    
    // Show the browser's install prompt
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const benefits = [
    { 
      icon: <Zap className="text-amber-400" />, 
      title: "Fast & Smooth", 
      desc: "Optimized 2x performance." 
    },
    { 
      icon: <Bell className="text-emerald-400" />, 
      title: "Real-time Alerts", 
      desc: "Instant call notifications." 
    },
    { 
      icon: <Shield className="text-indigo-400" />, 
      title: "Privacy First", 
      desc: "Secure standalone experience." 
    },
    { 
      icon: <Smartphone className="text-rose-400" />, 
      title: "One-Tap Access", 
      desc: "Launch from Home Screen." 
    }
  ];

  if (isInstalled) return null;

  return (
    <>
      {/* Dynamic Trigger */}
      {renderTrigger && renderTrigger(() => setShowSheet(true), isInstalled ? false : !!deferredPrompt)}

      {/* Benefits Slide-up Sheet */}
      <AnimatePresence>
        {showSheet && (
          <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            {/* Content Card */}
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white rounded-t-[3.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 z-10"
            >
              {/* Top Branding Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-[#ff4d6d] to-indigo-600" />
              
              <div className="p-8 md:p-12 space-y-8">
                 {/* Close Button */}
                 <button 
                    onClick={() => setShowSheet(false)} 
                    className="absolute top-8 right-8 w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
                 >
                    <X size={24} />
                 </button>

                 {/* Header Branding */}
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-rose-50 rounded-[1.5rem] flex items-center justify-center text-[#ff4d6d] shadow-inner border border-rose-100">
                       <Download size={32} />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-none italic">
                         BigSuno App
                       </h3>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">Official PWA Build v3.0</p>
                       </div>
                    </div>
                 </div>

                 {/* Benefits Grid */}
                 <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {benefits.map((b, i) => (
                      <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-3 items-start group hover:bg-white hover:shadow-xl transition-all">
                         <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                            {b.icon}
                         </div>
                         <div className="space-y-0.5">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-none">{b.title}</h4>
                            <p className="text-[9px] text-slate-400 font-bold leading-tight mt-1">{b.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Social Proof Section */}
                 <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100 flex items-center justify-between gap-6 group">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="w-full h-full object-cover" />
                         </div>
                       ))}
                       <div className="w-9 h-9 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[9px] font-black text-white shadow-sm font-sans">
                          +10k
                       </div>
                    </div>
                    <p className="flex-1 text-[11px] text-indigo-600 font-black italic uppercase leading-none tracking-tight">
                       Join 10,000+ others who love our App Experience! 💖
                    </p>
                 </div>

                 {/* Primary Action Button */}
                 <div className="space-y-4">
                    <button
                       onClick={handleInstallClick}
                       className="w-full h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-[18px] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 transition-all active:scale-95 group hover:bg-black uppercase tracking-[0.2em]"
                    >
                       <span>Abhi Install Karein</span>
                       <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="flex items-center justify-center gap-3 opacity-30">
                       <Star size={10} className="fill-current text-amber-500" />
                       <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Download</span>
                       <Star size={10} className="fill-current text-amber-500" />
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
