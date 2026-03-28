'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Zap, Bell, Shield, Smartphone, X, ArrowRight } from 'lucide-react';

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
      desc: "Instant loading with 2x better performance." 
    },
    { 
      icon: <Bell className="text-emerald-400" />, 
      title: "Real-time Alerts", 
      desc: "Never miss a call or message from your friends." 
    },
    { 
      icon: <Shield className="text-indigo-400" />, 
      title: "Privacy First", 
      desc: "Secure, standalone experience outside the browser." 
    },
    { 
      icon: <Smartphone className="text-rose-400" />, 
      title: "One-Tap Access", 
      desc: "Open BigSuno directly from your home screen." 
    }
  ];

  if (isInstalled) return null;

  return (
    <>
      {/* Dynamic Trigger */}
      {renderTrigger && renderTrigger(() => setShowSheet(true), isInstalled ? false : !!deferredPrompt)}

      {/* Benefits Slide-up Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowSheet(false)}
          />
          
          <div className="relative w-full max-w-[500px] bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
            
            <div className="flex items-center gap-4 mb-8">
               <div className="w-16 h-16 bg-[#ff4d6d]/10 rounded-3xl flex items-center justify-center text-[#ff4d6d] shadow-inner">
                  <Download size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">Install BigSuno App</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Premium PWA Experience v3.0</p>
                  </div>
               </div>
               <button onClick={() => setShowSheet(false)} className="ml-auto w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
               {benefits.map((b, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4 items-start">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm">
                       {b.icon}
                    </div>
                    <div className="space-y-0.5">
                       <h4 className="text-xs font-black text-slate-800 uppercase tracking-tighter">{b.title}</h4>
                       <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{b.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 flex items-center justify-between gap-6 mb-8">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#ff4d6d] flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                     +10k
                  </div>
               </div>
               <p className="flex-1 text-[11px] text-rose-500 font-black italic uppercase leading-tight tracking-tight">
                  Join 10,000+ others who love our App Experience! 💖
               </p>
            </div>

            <button
               onClick={handleInstallClick}
               className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black text-[18px] shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transition-all active:scale-95 group"
            >
               <span className="uppercase tracking-widest">Abhi Install Karein</span>
               <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
