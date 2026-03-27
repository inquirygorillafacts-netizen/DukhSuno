'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types';
import { Heart, Phone, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import React from 'react';

export default function SelectRolePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected || !user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        roles: arrayUnion(selected),
        activeRole: selected,
      });
      setUser({ ...user, roles: [...(user.roles || []), selected], activeRole: selected });
      if (selected === 'sunane_wala') {
        router.push('/onboarding/sunane');
      } else {
        router.push('/onboarding/sunne');
      }
    } catch (error) {
      console.error('Error setting role:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-[#fdfcff]">
      {/* Aurora Background (Master Design) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-200 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] animate-blob-delay" />
      </div>

      <div className="w-full max-w-[480px] glass bg-white/70 rounded-[3.5rem] p-10 shadow-2xl space-y-10 animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center space-y-4">
           <div className="w-16 h-16 rounded-3xl glass bg-white flex items-center justify-center text-[#ff4d6d] mx-auto shadow-sm mb-6">
              <Heart size={32} fill="currentColor" strokeWidth={0} />
           </div>
           <h1 className="text-3xl font-black tracking-tight">Choose Your Path ✨</h1>
           <p className="text-slate-500 text-sm font-medium italic">"BigSuno par aapka maqsad kya hai?"</p>
        </div>

        <div className="space-y-4">
          <RoleCard 
            selected={selected === 'sunane_wala'}
            icon={<Heart />} 
            title="Speaker" 
            subtitle="I need to talk" 
            onClick={() => setSelected('sunane_wala')} 
            color="rose" 
          />
          <RoleCard 
            selected={selected === 'sunne_wala'}
            icon={<Phone />} 
            title="Listener" 
            subtitle="I want to listen" 
            onClick={() => setSelected('sunne_wala')} 
            color="indigo" 
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full h-15 btn-rose rounded-full shadow-xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 group uppercase tracking-widest text-sm font-black"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Aage Badhein</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const RoleCard = ({ icon, title, subtitle, onClick, color, selected }: { icon: React.ReactNode, title: string, subtitle: string, onClick: () => void, color: 'rose' | 'indigo', selected: boolean }) => (
  <div 
    onClick={onClick} 
    className={`glass p-7 rounded-[2.5rem] border cursor-pointer flex items-center gap-5 transition-all group ${
      selected ? 'border-[#ff4d6d] bg-white ring-2 ring-[#ff4d6d]/10' : 'border-white'
    }`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
      selected ? 'bg-[#ff4d6d] text-white' : (color === 'rose' ? 'bg-rose-50 text-[#ff4d6d]' : 'bg-indigo-50 text-indigo-500')
    }`}>
      {React.cloneElement(icon as any, { size: 24 })}
    </div>
    <div className="text-left flex-1">
      <h4 className="font-bold text-lg leading-tight">{title}</h4>
      <p className="text-[10px] text-[#ff4d6d] font-black uppercase tracking-widest mt-0.5">{subtitle}</p>
    </div>
    {selected ? (
      <CheckCircle2 className="text-[#ff4d6d]" size={24} />
    ) : (
      <ChevronRight className="text-slate-200" size={20} />
    )}
  </div>
);
