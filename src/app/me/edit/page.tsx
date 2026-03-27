'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Save, Camera, 
  Trash2, Plus, X, 
  Zap, Clock, Wallet 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<any[]>(user?.plans || [
    { heading: 'Short Chat', minutes: 5, price: 150 },
    { heading: 'Standard Session', minutes: 15, price: 400 }
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex items-center justify-between">
        <button onClick={() => router.back()} className="p-3 glass rounded-2xl text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-widest">Professional Info</h1>
        <button className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-neon hover:scale-105 active:scale-95 transition-all">
          <Save size={20} />
        </button>
      </header>

      {/* Avatar & Branding Section */}
      <section className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-primary/50 transition-all overflow-hidden">
             <div className="text-5xl">👤</div>
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-2xl text-primary-foreground shadow-neon">
            <Camera size={18} />
          </button>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Tap to update avatar</p>
      </section>

      {/* Basic Info Form */}
      <section className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-4">Headline & Bio</h4>
        <div className="space-y-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-4">Headline</label>
              <input 
                type="text" 
                defaultValue={user?.headline || "Expert Guidance & Support"}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-medium focus:border-primary/50 outline-none transition-all"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-4">Full Bio</label>
              <textarea 
                rows={4}
                defaultValue={user?.bio || "Describe your expertise and how you can help others..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none"
              />
           </div>
        </div>
      </section>

      {/* Plan Management */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Session Plans</h4>
          <button className="p-2 glass rounded-xl text-primary hover:bg-primary/10 transition-all">
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-4">
           {plans.map((plan, idx) => (
             <div key={idx} className="glass p-6 rounded-[2rem] border border-white/5 space-y-4 relative group">
                <button className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <X size={14} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Plan Name</label>
                      <input type="text" defaultValue={plan.heading} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold" />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Minutes</label>
                        <input type="number" defaultValue={plan.minutes} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Price (₹)</label>
                        <input type="number" defaultValue={plan.price} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold" />
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-8 border-t border-white/5">
        <button className="w-full flex items-center justify-between p-6 rounded-[2rem] border border-red-500/10 text-red-500/50 hover:bg-red-500/5 hover:text-red-500 transition-all group">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors">
                <Trash2 size={20} />
              </div>
              <div className="text-left">
                <h5 className="text-[10px] font-black uppercase tracking-widest mb-1">Permanently Delete Account</h5>
                <p className="text-[8px] opacity-60 font-medium">All data, earnings, and history will be cleared.</p>
              </div>
           </div>
        </button>
      </section>
    </div>
  );
}
