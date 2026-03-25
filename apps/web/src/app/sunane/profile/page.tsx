'use client';

import { useAuthStore } from '@/stores/auth-store';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  Bell, 
  HelpCircle, 
  Info,
  Heart,
  Sparkles
} from 'lucide-react';
import React from 'react';

export default function SunaneProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  const menuItems = [
    { label: 'Session History', icon: <User size={18} />, href: '#' },
    { label: 'Notifications', icon: <Bell size={18} />, href: '#' },
    { label: 'Privacy Policy', icon: <ShieldCheck size={18} />, href: '#' },
    { label: 'Help & Support', icon: <HelpCircle size={18} />, href: '#' },
    { label: 'About DukhSuno', icon: <Info size={18} />, href: '#' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24">
      
      {/* User Hero Card */}
      <section className="relative pt-8">
        <div className="glass bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-white dark:border-white/10 shadow-sm relative group overflow-hidden">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center text-4xl shadow-inner border border-white/50">
                 {user?.avatarUrl?.includes(':') ? user.avatarUrl.split(':')[1] : '😊'}
              </div>
              <div className="flex-1">
                 <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{user?.displayName || 'User'}</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user?.email}</p>
                 <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                    <Sparkles size={10} className="fill-current" /> Active Speaker
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Become a Listener Banner */}
      {!user?.roles?.includes('sunne_wala') && (
        <button 
           onClick={() => router.push('/select-role')} 
           className="w-full p-8 rounded-[3rem] bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-transparent border border-rose-100 dark:border-rose-900/30 flex items-center justify-between group shadow-sm hover:shadow-xl transition-all"
        >
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                 <Heart size={28} className="text-[#ff4d6d] fill-current" />
              </div>
              <div className="text-left">
                 <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tighter">Listener Bano</h4>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Suno aur paise kamao</p>
              </div>
           </div>
           <ChevronRight size={24} className="text-rose-300 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Settings Menu */}
      <section className="space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-4">Settings & Info</span>
        <div className="space-y-3">
           {menuItems.map((item) => (
             <button 
               key={item.label} 
               className="w-full glass bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-white dark:border-white/10 flex items-center gap-5 hover:border-indigo-500/20 group transition-all"
             >
               <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-inner">
                  {item.icon}
               </div>
               <span className="flex-1 text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter text-left">{item.label}</span>
               <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
             </button>
           ))}
        </div>
      </section>

      {/* Logout */}
      <div className="text-center pt-8">
        <button 
           onClick={handleLogout} 
           className="inline-flex items-center gap-3 text-rose-500 dark:text-rose-400 font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-transform active:scale-95"
        >
          <LogOut size={18} strokeWidth={3} /> Logout Session
        </button>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">
           <Sparkles size={10} className="fill-current text-[#ff4d6d]/40" /> DUKHSUNO v3.0
        </div>
      </div>

    </div>
  );
}
