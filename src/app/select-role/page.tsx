'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types';
import { Zap, Phone, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import React from 'react';

export default function SelectRolePage() {
  const router = useRouter();
  const { user, setUser, setActiveRole } = useAuthStore();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    
    // Safety check for user
    if (!user) {
      console.error("Auth Error: No user data found in store. Please refresh.");
      alert("Something went wrong. Please refresh the page and try again.");
      return;
    }

    setLoading(true);
    try {
      console.log("Updating role for user:", user.uid, "to:", selected);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        roles: arrayUnion(selected),
        activeRole: selected,
      });
      
      // Update both user object and explicit activeRole state
      setUser({ ...user, roles: [...(user.roles || []), selected], activeRole: selected });
      setActiveRole(selected);
      
      if (selected === 'seeker') {
        router.push('/seeker/home');
      } else {
        router.push('/onboarding/provider');
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
           <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto shadow-xl border-4 border-white p-3 mb-6">
              <img src="/logo.png" alt="BigSuno" className="w-full h-full object-contain animate-bounce" />
           </div>
           <h1 className="text-3xl font-black tracking-tight">Choose Your Path ✨</h1>
           <p className="text-slate-500 text-sm font-medium italic">"BigSuno par aapka maqsad kya hai?"</p>
        </div>

        <div className="space-y-4">
          <RoleCard 
            selected={selected === 'seeker'}
            icon={<Zap />} 
            title="Seeker" 
            subtitle="I want to talk & share" 
            onClick={() => setSelected('seeker')} 
            color="rose" 
          />
          <RoleCard 
            selected={selected === 'provider'}
            icon={<Phone />} 
            title="Provider" 
            subtitle="I offer help & guidance" 
            onClick={() => setSelected('provider')} 
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

