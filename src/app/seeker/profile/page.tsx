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
  Clock,
  ExternalLink
} from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LegalSheet from '@/components/shared/LegalSheet';
import SupportSheet from '@/components/shared/SupportSheet';

export default function SunaneProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'support' | 'legal' | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      window.location.href = '/login'; // Use direct window redirect for cleanest clean-slate
    } catch (error) {
       console.error("Logout Error:", error);
       logout();
       router.push('/login');
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3000);
  };

  const menuItems = [
    { label: 'Notifications', icon: <Bell size={18} />, onClick: handleNotificationClick, badge: 'Soon' },
    { label: 'Privacy Policy', icon: <ShieldCheck size={18} />, onClick: () => setActiveSheet('legal') },
    { label: 'Help & Support', icon: <HelpCircle size={18} />, onClick: () => setActiveSheet('support') },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24 px-4 overflow-x-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[6000] bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 w-[90%] max-w-sm"
          >
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0">
                <Bell size={16} className="animate-ring" />
             </div>
             <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">Coming Soon!</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Personalized notifications arrive in v3.1 🚀</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Hero Card */}
      <section className="relative pt-6">
        <div className="glass bg-white p-6 md:p-8 rounded-[2.5rem] border border-white shadow-sm relative group overflow-hidden">
           <div className="absolute -right-10 -top-10 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
           <div className="flex items-center gap-6 relative z-10">
              <div 
                 className="w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center text-4xl shadow-md border-4 border-white/50 overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
                 style={{ backgroundColor: user?.avatarUrl?.split(':')[2] || '#f3f4f6' }}
              >
                 {user?.avatarUrl?.includes(':') ? user.avatarUrl.split(':')[1] : '😊'}
              </div>
              <div className="flex-1 min-w-0">
                 <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase truncate">{user?.displayName || 'Seeker User'}</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] truncate opacity-60 italic">{user?.email}</p>
                 <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                    <Sparkles size={14} className="fill-current animate-pulse" /> Official Seeker
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Settings Menu */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-4">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Account Portal</span>
           <div className="h-px w-20 bg-slate-100" />
        </div>
        <div className="space-y-3">
           {menuItems.map((item) => (
             <button 
               key={item.label} 
               onClick={item.onClick}
               className="w-full glass bg-white p-5 rounded-3xl border border-white flex items-center gap-5 hover:border-indigo-500/20 group transition-all active:scale-98 shadow-sm hover:shadow-xl"
             >
               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-inner border border-slate-50 group-hover:bg-white group-hover:scale-110 transition-transform">
                  {item.icon}
               </div>
               <div className="flex-1 text-left">
                  <span className="text-[15px] font-black text-slate-700 uppercase tracking-tighter block leading-none">{item.label}</span>
                  {item.badge && <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest mt-1 block">Live in next update</span>}
               </div>
               <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
             </button>
           ))}
        </div>
      </section>

      {/* Version Card & Logout */}
      <div className="pt-8 space-y-8 flex flex-col items-center">
        <button 
           onClick={handleLogout} 
           className="h-16 px-10 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-slate-200 hover:bg-black active:scale-95 transition-all group"
        >
          <LogOut size={18} className="text-rose-400 group-hover:-translate-x-1 transition-transform" />
          <span>Security Logout</span>
        </button>

        <div className="flex flex-col items-center gap-2">
           <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-slate-200" />
              <Sparkles size={12} className="text-rose-500 fill-current opacity-40" />
              <div className="h-px w-8 bg-slate-200" />
           </div>
           <p className="text-[9px] font-black text-slate-300 tracking-[0.6em] uppercase italic">BigSuno Global Standard v3.0</p>
        </div>
      </div>

      {/* Sheets Integration */}
      <AnimatePresence>
         {activeSheet === 'legal' && (
            <LegalSheet onClose={() => setActiveSheet(null)} />
         )}
         {activeSheet === 'support' && (
            <SupportSheet onClose={() => setActiveSheet(null)} />
         )}
      </AnimatePresence>

    </div>
  );
}

