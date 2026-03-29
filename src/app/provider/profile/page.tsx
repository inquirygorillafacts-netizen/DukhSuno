'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  User, 
  Camera, 
  Sparkles, 
  Share2, 
  QrCode, 
  Heart, 
  LogOut,
  ChevronRight,
  MessageCircle,
  Clock,
  HelpCircle,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { SPECIALTY_LABELS } from '@/types';
import React, { useState } from 'react';
import PremiumShareSheet from '@/components/shared/PremiumShareSheet';

function ShareUrlBar({ uid }: { uid?: string }) {
  const [copied, setCopied] = React.useState(false);
  const host = typeof window !== 'undefined' ? window.location.host : 'bigsuno.app';
  const fullUrl = `${host}/p/${uid || ''}`;
  const displayUrl = fullUrl.length > 28 ? fullUrl.substring(0, 28) + '...' : fullUrl;

  const handleCopy = async () => {
    try {
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';
      await navigator.clipboard.writeText(`${protocol}://${fullUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <p className="flex-1 text-[9px] font-black text-slate-400 uppercase tracking-widest truncate overflow-hidden">
        {displayUrl}
      </p>
      <button 
        onClick={handleCopy}
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
          copied ? 'bg-emerald-50 text-emerald-500' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
        }`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export default function SunneProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/p/${user?.uid}`;
    if (navigator.share) {
      await navigator.share({ title: `${user?.displayName} - BigSuno`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied! ✓');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24">
      
      {/* Profile Hero Section */}
      <div className="relative mb-16">
        {/* Banner */}
        <div className="h-32 md:h-44 w-full bg-gradient-to-br from-rose-50 to-indigo-50 rounded-3xl md:rounded-[2rem] border border-white/50 shadow-inner" />
        
        {/* Avatar */}
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#c7d2fe] flex items-center justify-center text-white">
                   <User size={64} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[#ff4d6d] text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Header */}
      <div className="px-2">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
            {user?.displayName || 'Expert Provider'}
          </h3>
          {user?.isVerified ? (
            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <Sparkles size={12} className="fill-current" /> Verified
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-amber-100 animate-pulse">
              <Clock size={12} className="animate-spin-slow" /> Pending
            </div>
          )}
        </div>
        <p className="text-[#ff4d6d] font-bold italic text-sm mb-3 leading-tight">
          {user?.headline || "Dedicated to listener-driven emotional support 💙"}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-black uppercase tracking-widest">
          <span className="flex items-center gap-1 text-amber-500">★ {user?.ratingAvg?.toFixed(1) || '0.0'}</span>
          <span>• {user?.totalSessions || 0} sessions</span>
          <span>• Female</span>
        </div>
      </div>

      <div className="glass bg-white p-5 md:p-8 rounded-3xl md:rounded-[1.5rem] border border-white shadow-sm relative group">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-3">Professional Bio</span>
        <p className="text-xs md:text-sm font-medium leading-relaxed">
           I am a certified expert provider dedicated to active listening and emotional support. Feel free to share your thoughts on relationships, career, or personal challenges in a judgment-free, confidential space.
        </p>
      </div>

      {/* Specialties */}
      <div className="space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Core Expertise</span>
        <div className="flex flex-wrap gap-2">
          {(user?.specialties || ['relationship', 'stress', 'anxiety']).map((s) => (
            <span key={s} className="glass bg-white px-4 py-2 rounded-xl text-[10px] font-black border border-slate-100 flex items-center gap-2 hover:scale-105 transition-transform cursor-default">
              {SPECIALTY_LABELS[s] || s}
            </span>
          ))}
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Consultation Plans</span>
          <div className="flex gap-6">
             <button 
                onClick={() => router.push('/provider/profile/edit')} 
                className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-700 transition-colors"
             >
                Edit Profile
             </button>
             <button 
                onClick={() => router.push('/provider/profile/plans')} 
                className="text-[#ff4d6d] text-[10px] font-black uppercase tracking-widest hover:text-rose-600 transition-colors"
             >
                Edit Plans
             </button>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {(user?.plans || [
            { heading: 'Quick Session', minutes: 5, price: 49 },
            { heading: 'Standard Session', minutes: 15, price: 99 },
            { heading: 'Extended Support', minutes: 30, price: 199 }
          ]).map((plan: any) => (
            <div key={plan.heading} className="min-w-[120px] md:min-w-[150px] bg-white p-4 rounded-2xl border border-slate-100 text-center hover:border-[#ff4d6d]/30 transition-all group shadow-sm">
              <h4 className="font-bold text-[10px] mb-1 uppercase tracking-tighter">{plan.heading}</h4>
              <p className="text-[8px] text-slate-400 font-bold uppercase mb-3">{plan.minutes} min</p>
              <p className="text-lg font-black text-[#ff4d6d] group-hover:scale-110 transition-transform leading-none">₹{plan.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help & Support Section */}
      <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-emerald-50 to-indigo-50 border border-white shadow-sm overflow-hidden">
         <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                     <MessageCircle size={20} />
                  </div>
                  <div>
                     <h4 className="font-black text-sm tracking-tight uppercase">Helpline Support</h4>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Connect with community</p>
                  </div>
               </div>
               <button 
                  onClick={() => alert('Joining WhatsApp Community... 👥')}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200 active:scale-95"
               >
                  Join WhatsApp
               </button>
            </div>

               <div className="p-4 rounded-2xl bg-white/50 border border-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                     <Clock size={16} className="animate-spin-slow" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">
                     Your verification is currently under review. For priority assistance, please connect with our support team.
                  </p>
               </div>
         </div>
      </div>

      {/* Share Section */}
      <div className="glass bg-white p-6 rounded-3xl border border-white shadow-sm">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-4">Share Profile</span>
        <div className="grid grid-cols-2 gap-3 mb-3">
           <button onClick={handleShare} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#ff4d6d] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-[1.02] transition-all">
              <Share2 size={16} /> Share
           </button>
           <button onClick={() => setShowQr(true)} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
              <QrCode size={16} /> QR Code
           </button>
        </div>
        <ShareUrlBar uid={user?.uid} />
      </div>

      {/* Settings Button (for mobile users) */}
      <button 
         onClick={() => router.push('/provider/settings')} 
         className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-slate-100 transition-all shadow-sm"
      >
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
               <User size={20} className="text-slate-500" />
            </div>
            <div className="text-left">
               <h4 className="font-bold text-sm leading-tight uppercase tracking-tighter">Settings</h4>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Account & Preferences</p>
            </div>
         </div>
         <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Logout */}
      <div className="text-center pt-8">
        <button onClick={handleLogout} className="inline-flex items-center gap-3 text-[#ff4d6d] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-transform active:scale-95">
          <LogOut size={18} strokeWidth={3} /> Logout Session
        </button>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
           <Zap size={10} className="fill-current text-[#ff4d6d]/40" /> BIGSUNO v3.0
        </div>
      </div>

      {/* PREMIUM SHARE SHEET (Replaces old Modal) */}
      <PremiumShareSheet 
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        user={user}
      />

    </div>
  );
}

