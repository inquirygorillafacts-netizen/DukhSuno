'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role } from '@/types';
import { Heart, Phone, ChevronRight } from 'lucide-react';
import React from 'react';

export default function ChooseRolePage() {
  const router = useRouter();
  const { user, setActiveRole } = useAuthStore();

  const handleChoose = async (role: Role) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { activeRole: role });
    setActiveRole(role);
    router.push(role === 'sunane_wala' ? '/sunane/home' : '/sunne/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-[#fdfcff] dark:bg-[#0a0a0c]">
      {/* Aurora Background (Master Design) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-200 dark:bg-rose-900/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 dark:bg-rose-950/20 rounded-full blur-[120px] animate-blob-delay" />
      </div>

      <div className="w-full max-w-[460px] glass bg-white/70 dark:bg-white/5 rounded-[3.5rem] p-10 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-8">
        <h2 className="text-3xl font-black mb-2 tracking-tight dark:text-white">Who are you today?</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-12 italic">
          "Choose how you'd like to connect"
        </p>
        
        <div className="space-y-4">
          <RoleCard 
            icon={<Heart />} 
            title="Speaker" 
            subtitle="I need to talk" 
            onClick={() => handleChoose('sunane_wala')} 
            color="rose" 
          />
          <RoleCard 
            icon={<Phone />} 
            title="Listener" 
            subtitle="I want to listen" 
            onClick={() => handleChoose('sunne_wala')} 
            color="indigo" 
          />
        </div>
      </div>
    </div>
  );
}

const RoleCard = ({ icon, title, subtitle, onClick, color }: { icon: React.ReactNode, title: string, subtitle: string, onClick: () => void, color: 'rose' | 'indigo' }) => (
  <div onClick={onClick} className="glass bg-white dark:bg-white/5 p-7 rounded-[2.5rem] border border-white dark:border-white/10 cursor-pointer flex items-center gap-5 hover:shadow-xl transition-all group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${color === 'rose' ? 'bg-rose-50 text-[#ff4d6d]' : 'bg-indigo-50 text-indigo-500'}`}>
      {React.cloneElement(icon as any, { size: 24 })}
    </div>
    <div className="text-left flex-1">
      <h4 className="font-bold text-lg dark:text-white leading-tight">{title}</h4>
      <p className="text-[10px] text-[#ff4d6d] font-black uppercase tracking-widest mt-0.5">{subtitle}</p>
    </div>
    <ChevronRight className="text-slate-300" size={20} />
  </div>
);
