'use client';

import React from 'react';
import { X, Download, ShieldCheck, Zap, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import PWAInstall from './PWAInstall';

interface InstallDetailsSheetProps {
  onClose: () => void;
}

export default function InstallDetailsSheet({ onClose }: InstallDetailsSheetProps) {
  return (
    <div className="fixed inset-0 z-[2200] flex items-end justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-500">
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
      />
      
      <div className="w-full max-w-[500px] bg-white rounded-t-[3.5rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-full duration-500 pb-12">
        {/* Banner Decoration */}
        <div className="h-2 bg-gradient-to-r from-[#ff4d6d] via-rose-400 to-indigo-400" />

        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#ff4d6d] uppercase tracking-[0.4em] mb-1">Premium Web App</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Install BigSuno ✨</h3>
           </div>
           <button 
             onClick={onClose} 
             className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
           >
              <X size={24} />
           </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
           {/* Visual Section */}
           <div className="relative group p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden shadow-2xl">
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#ff4d6d] rounded-full blur-[80px] opacity-40 animate-pulse" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                 <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/20">
                    <Download className="text-rose-400" size={32} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-black tracking-tighter italic">Mobile App Experience</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Safe • Anonymous • Fast</p>
                 </div>
              </div>
           </div>

           {/* Features Grid */}
           <div className="grid grid-cols-1 gap-4">
              {[
                { title: 'Home Screen Access', desc: 'Bina browser khole direct home screen se open karein.', icon: <Zap className="text-amber-500" /> },
                { title: 'Full Screen Mode', desc: 'Poora mobile app jaisa experience, bina kisi URL bar ke.', icon: <ShieldCheck className="text-blue-500" /> },
                { title: 'Faster Performance', desc: 'Offline support aur faster loading speeds.', icon: <Sparkles className="text-rose-500" /> },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      {f.icon}
                   </div>
                   <div>
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{f.title}</h5>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{f.desc}</p>
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
                    className="w-full h-20 bg-[#ff4d6d] text-white rounded-[2rem] font-black text-[17px] shadow-2xl shadow-rose-200 flex items-center justify-center gap-4 transition-all active:scale-95 group"
                  >
                     <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                     <span className="uppercase tracking-widest">Install BigSuno App</span>
                  </button>
                )}
              />
           </div>

           <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest leading-loose italic">
              100% Secure & Lightweight<br />
              v3.0 Official Premium Build
           </p>
        </div>
      </div>
    </div>
  );
}
