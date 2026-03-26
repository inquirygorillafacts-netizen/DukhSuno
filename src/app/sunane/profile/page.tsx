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
  Sparkles,
  Clock
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
    { label: 'प्रोफ़ाइल एडिट करें', icon: <User size={18} />, href: '/sunane/profile/edit' },
    { label: 'सेशन का इतिहास', icon: <Clock size={18} />, href: '#' },
    { label: 'सूचनाएं (Notifications)', icon: <Bell size={18} />, href: '#' },
    { label: 'गोपनीयता नीति (Privacy)', icon: <ShieldCheck size={18} />, href: '#' },
    { label: 'सहायता और संपर्क', icon: <HelpCircle size={18} />, href: '#' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24">
      
      {/* User Hero Card */}
      <section className="relative pt-6">
        <div className="glass bg-white p-5 md:p-8 rounded-3xl border border-white shadow-sm relative group overflow-hidden">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 md:w-18 md:h-18 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl shadow-inner border border-white/50">
                 {user?.avatarUrl?.includes(':') ? user.avatarUrl.split(':')[1] : '😊'}
              </div>
              <div className="flex-1">
                 <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter uppercase">{user?.displayName || 'User'}</h2>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user?.email}</p>
                 <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 text-[8px] font-black uppercase tracking-widest border border-indigo-100">
                    <Sparkles size={8} className="fill-current" /> Active Speaker
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Become a Listener Banner */}
      {!user?.roles?.includes('sunne_wala') && (
        <button 
           onClick={() => router.push('/select-role')} 
           className="w-full p-6 md:p-10 rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 flex items-center justify-between group shadow-sm hover:shadow-xl transition-all"
        >
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                 <Heart size={20} className="text-[#ff4d6d] fill-current" />
              </div>
              <div className="text-left">
                 <h4 className="text-sm md:text-base font-black text-slate-900 leading-none mb-1 uppercase tracking-tighter">Listener Bano</h4>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Suno aur paise kamao</p>
              </div>
           </div>
           <ChevronRight size={18} className="text-rose-300 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Settings Menu */}
      <section className="space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-4">Settings & Info</span>
        <div className="space-y-3">
           {menuItems.map((item) => (
             <button 
               key={item.label} 
               onClick={() => item.href !== '#' && router.push(item.href)}
               className="w-full glass bg-white p-4 rounded-2xl border border-white flex items-center gap-4 hover:border-indigo-500/20 group transition-all"
             >
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-inner">
                  {item.icon}
               </div>
               <span className="flex-1 text-sm font-black text-slate-700 uppercase tracking-tighter text-left">{item.label}</span>
               <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
             </button>
           ))}
        </div>
      </section>

      {/* Logout */}
      <div className="text-center pt-8">
        <button 
           onClick={handleLogout} 
           className="inline-flex items-center gap-3 text-rose-500 font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-transform active:scale-95"
        >
          <LogOut size={18} strokeWidth={3} /> Logout Session
        </button>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
           <Sparkles size={10} className="fill-current text-[#ff4d6d]/40" /> DUKHSUNO v3.0
        </div>
      </div>

    </div>
  );
}
