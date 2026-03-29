'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  Sparkles, 
  Star, 
  Clock, 
  ShieldCheck, 
  MessageCircle,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import type { BigSunoUser } from '@/types';
import { SPECIALTY_LABELS } from '@/types';
import { LoginSlider } from '@/components/auth/LoginSlider';
import { ReviewMarquee } from '@/components/profile/ReviewMarquee';

export function PublicProfileView({ provider }: { provider: BigSunoUser }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const handleCallClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      // Logic to start payment/call process
      router.push(`/seeker/home?provider=${provider.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative overflow-x-hidden">
      
      {/* Hero Banner */}
      <div className="relative h-[250px] md:h-[350px] w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        {provider.bannerUrl && (
          <img src={provider.bannerUrl} className="w-full h-full object-cover" alt="Banner" />
        )}
        
        {/* Floating Badges */}
        <div className="absolute top-6 left-6 flex gap-2">
           <div className="px-4 py-2 rounded-full glass-container border-white/40 text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${provider.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
             {provider.isAvailable ? 'Online' : 'Offline'}
           </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="glass-container border-white bg-white/90 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-900/5">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-[3.5rem] border-8 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                {provider.avatarUrl && !provider.avatarUrl.startsWith('emoji:') ? (
                  <img src={provider.avatarUrl} alt="Provider" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-8xl">
                    {provider.avatarUrl?.startsWith('emoji:') ? provider.avatarUrl.split(':')[1] : '👤'}
                  </div>
                )}
              </div>
              {provider.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white pl-4 pr-5 py-3 rounded-2xl shadow-xl border-4 border-white flex items-center gap-2">
                  <ShieldCheck size={24} fill="white" className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                    {provider.displayName}
                  </h1>
                  {provider.isVerified && (
                    <Sparkles className="text-blue-500 animate-pulse hidden md:block" size={32} />
                  )}
                </div>
                <p className="text-rose-500 text-xl font-black italic tracking-tight">
                  "{provider.headline || 'Dedicated to your personal well-being...'}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 text-sm font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 shadow-sm">
                  <Star size={16} fill="currentColor" /> {provider.ratingAvg?.toFixed(1) || '5.0'} ({provider.totalSessions || 0} reviews)
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} /> Joined {new Date(provider.registeredAt as any).getFullYear() || '2024'}
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={16} className="text-slate-400" />
                  {provider.gender || 'Expert'}
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                {(provider.specialties || []).map(s => (
                  <span key={s} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                    {SPECIALTY_LABELS[s] || s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-100">
             <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">About the Expert</h3>
                <p className="text-[17px] font-medium text-slate-600 leading-relaxed md:pr-12">
                  {provider.bio || "Hello! I am a certified expert provider. You can share any personal or professional concerns with me in a safe, judgment-free environment. Whether it's career guidance, relationship support, or life challenges, I am here to listen and support you."}
                </p>
             </div>
             <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Plans & Charges</h3>
                <div className="space-y-3">
                  {(provider.plans || []).map((plan: any) => (
                    <div key={plan.heading} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all shadow-sm">
                      <div>
                        <p className="text-[12px] font-black uppercase tracking-tighter text-slate-900">{plan.heading}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{plan.minutes} mins duration</p>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black text-rose-500">₹{plan.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Review Marquee */}
      <div className="max-w-6xl mx-auto mt-12 py-12 px-6">
        <div className="text-center mb-12 space-y-2">
           <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Client Testimonials</h4>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Real Stories from Real Users ✨</h2>
        </div>
        <ReviewMarquee providerId={provider.uid} />
      </div>

      {/* Floating Call Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-6">
        <button 
          onClick={handleCallClick}
          className="w-full h-20 bg-gradient-to-r from-rose-500 via-[#ff4d6d] to-indigo-600 rounded-[2rem] text-white font-black text-2xl shadow-[0_20px_60px_-15px_rgba(255,77,109,0.5)] flex items-center justify-center gap-4 hover:scale-[1.05] active:scale-95 transition-all group"
        >
          <Phone size={28} className="animate-pulse" />
          <span>Call Now</span>
          <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      {/* Login Slider */}
      {showLogin && <LoginSlider onClose={() => setShowLogin(false)} providerId={provider.uid} />}
    </div>
  );
}

