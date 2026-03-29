'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types';
import { 
  ShieldCheck, 
  ChevronRight, 
  X,
  Zap,
  Sparkles,
  LayoutGrid,
  ShieldAlert
} from 'lucide-react';

interface RoleSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
}

export default function RoleSelectionDrawer({ isOpen, onClose, roles }: RoleSelectionDrawerProps) {
  const router = useRouter();
  const { user, setActiveRole } = useAuthStore();

  useEffect(() => {
    if (isOpen && roles.length === 1) {
      handleChoose(roles[0]);
    }
  }, [isOpen, roles]);

  const handleChoose = async (role: Role) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { activeRole: role });
      setActiveRole(role);
      
      let targetPath = '/';
      if (role === 'seeker') targetPath = '/seeker/home';
      else if (role === 'provider') targetPath = '/provider/dashboard';
      else if (role === 'admin') targetPath = '/admin/dashboard';
      
      router.push(targetPath);
      onClose();
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const PANEL_OPTIONS = [
    { 
      id: 'seeker' as Role,
      name: "Client Portal", 
      subtitle: "Professional Consultations",
      icon: ShieldCheck, 
      color: "text-[#ff4d6d]", 
      bg: "bg-rose-50",
      border: "border-rose-100",
      description: "Talk to experts privately & securely"
    },
    { 
      id: 'provider' as Role,
      name: "Expert Hub", 
      subtitle: "Business Management",
      icon: Zap, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      description: "Manage your consulting business"
    },
    { 
      id: 'admin' as Role,
      name: "Control Center", 
      subtitle: "System Administration",
      icon: ShieldAlert, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      border: "border-amber-100",
      description: "Platform oversight & monitoring"
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          {/* Content Card */}
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full max-w-lg bg-white rounded-t-[3.5rem] md:rounded-[3rem] relative z-10 shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Top Branding Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-[#ff4d6d] to-indigo-600" />
            
            <div className="p-10 md:p-12 space-y-8">
               {/* Close Button */}
               <button 
                  onClick={onClose} 
                  className="absolute top-8 right-8 w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
               >
                  <X size={24} />
               </button>

               {/* Header Section */}
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50">
                        <LayoutGrid className="text-indigo-600" size={24} />
                     </div>
                     <div>
                        <h2 className="text-[32px] md:text-[36px] font-black text-slate-900 tracking-tighter leading-none uppercase italic">
                          Switch Portal
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                          Choose your workspace ✨
                        </p>
                     </div>
                  </div>
               </div>

               {/* Role Options */}
               <div className="space-y-4">
                  {PANEL_OPTIONS.filter(opt => roles.includes(opt.id)).map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleChoose(option.id)}
                      className="w-full group relative flex items-center gap-6 p-6 rounded-[2.5rem] border-2 bg-white border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl shadow-slate-100"
                    >
                      <div className={`w-16 h-16 rounded-2xl ${option.bg} flex items-center justify-center ${option.color} transition-transform group-hover:scale-110 shadow-inner overflow-hidden border border-white`}>
                        <option.icon size={30} strokeWidth={2.5} />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h4 className="font-black text-xl text-slate-900 leading-tight uppercase tracking-tighter italic">{option.name}</h4>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 text-slate-400 group-hover:text-indigo-500 transition-colors">
                           {option.description}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={20} />
                      </div>
                    </button>
                  ))}
               </div>

               {/* Footer */}
               <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="flex items-center gap-3">
                     <Sparkles size={12} className="text-[#ff4d6d] opacity-40" />
                     <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">
                       Powered by BigSuno v3.0
                     </p>
                     <Sparkles size={12} className="text-[#ff4d6d] opacity-40" />
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
