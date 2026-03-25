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
  ChevronRight
} from 'lucide-react';
import { SPECIALTY_LABELS } from '@/types';
import React from 'react';

export default function SunneProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  const handleShare = async () => {
    const url = `dukhsuno.app/${user?.username || user?.uid}`;
    if (navigator.share) {
      await navigator.share({ title: `${user?.displayName} - DukhSuno`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied! ✓');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24">
      
      {/* Profile Hero Section */}
      <div className="relative mb-16">
        {/* Banner */}
        <div className="h-40 md:h-56 w-full bg-gradient-to-br from-rose-50 to-indigo-50 dark:from-rose-950/20 dark:to-indigo-950/20 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/50 dark:border-white/5 shadow-inner" />
        
        {/* Avatar */}
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-[#0a0a0c] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#c7d2fe] flex items-center justify-center text-white">
                   <User size={64} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-10 h-10 bg-[#ff4d6d] text-white rounded-full flex items-center justify-center border-4 border-white dark:border-[#0a0a0c] shadow-lg hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Header */}
      <div className="px-2">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {user?.displayName || 'Listener'}
          </h3>
          {user?.isVerified && (
            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30">
              <Sparkles size={12} className="fill-current" /> Verified
            </div>
          )}
        </div>
        <p className="text-[#ff4d6d] font-bold italic text-lg mb-4 leading-tight">
          {user?.headline || "Aapki dost hu, sab sunti hu 💙"}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-black uppercase tracking-widest">
          <span className="flex items-center gap-1 text-amber-500">★ {user?.ratingAvg?.toFixed(1) || '0.0'}</span>
          <span>• {user?.totalSessions || 0} sessions</span>
          <span>• Female</span>
        </div>
      </div>

      {/* Bio Card */}
      <div className="glass bg-white dark:bg-white/5 p-7 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white dark:border-white/10 shadow-sm relative group">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-4">Mera Bio</span>
        <p className="text-sm md:text-base font-medium leading-relaxed dark:text-slate-300">
           Main ek acchi listener hu. Aap apni koi bhi baat share kar sakte hain — bina judge hue. Relationship, career, ya life — sab ke baare mein baat karein.
        </p>
      </div>

      {/* Specialties */}
      <div className="space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Main Expert Hu</span>
        <div className="flex flex-wrap gap-2.5">
          {(user?.specialties || ['relationship', 'stress', 'anxiety']).map((s) => (
            <span key={s} className="glass bg-white dark:bg-white/5 px-6 py-3 rounded-full text-xs font-black border border-slate-100 dark:border-white/10 flex items-center gap-2 hover:scale-105 transition-transform cursor-default dark:text-white">
              {SPECIALTY_LABELS[s] || s}
            </span>
          ))}
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mere Plans</span>
          <button className="text-[#ff4d6d] text-[10px] font-black uppercase tracking-widest hover:underline">Edit Plans</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {(user?.plans || [
            { heading: 'Chhoti Baat', minutes: 5, price: 49 },
            { heading: 'Lambi Baat', minutes: 15, price: 99 },
            { heading: 'Dill Khol Ke', minutes: 30, price: 199 }
          ]).map((plan: any) => (
            <div key={plan.heading} className="min-w-[140px] md:min-w-[180px] bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 text-center hover:border-[#ff4d6d]/30 transition-all group shadow-sm">
              <h4 className="font-bold text-xs mb-1 dark:text-white uppercase tracking-tighter">{plan.heading}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-4">{plan.minutes} min</p>
              <p className="text-xl font-black text-[#ff4d6d] group-hover:scale-110 transition-transform leading-none">₹{plan.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share Section */}
      <div className="glass bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-white dark:border-white/10 shadow-sm">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-6">Profile Share Karein</span>
        <div className="grid grid-cols-2 gap-4 mb-4">
           <button onClick={handleShare} className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#ff4d6d] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-100 dark:shadow-none hover:scale-[1.02] transition-all">
              <Share2 size={18} /> Share
           </button>
           <button className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-all">
              <QrCode size={18} /> QR Code
           </button>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">dukhsuno.app/{user?.username || user?.uid}</p>
        </div>
      </div>

      {/* Role Switcher */}
      <button onClick={() => router.push('/select-role')} className="w-full p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between group">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
               <User size={24} className="text-indigo-500" />
            </div>
            <div className="text-left">
               <h4 className="font-bold dark:text-white leading-tight uppercase tracking-tighter">Sunane Wala Bano</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Apna dukh share karein</p>
            </div>
         </div>
         <ChevronRight size={20} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Logout */}
      <div className="text-center pt-8">
        <button onClick={handleLogout} className="inline-flex items-center gap-3 text-[#ff4d6d] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-transform active:scale-95">
          <LogOut size={18} strokeWidth={3} /> Logout Session
        </button>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">
           <Heart size={10} className="fill-current text-[#ff4d6d]/40" /> DUKHSUNO v3.0
        </div>
      </div>

    </div>
  );
}
