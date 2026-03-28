'use client';

import React, { useState } from 'react';
import { 
  User, Wallet, History, LogOut, 
  ChevronRight, Sparkles, Shield, HelpCircle,
  Settings, PenLine, Zap, MessageSquare, ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { IntroSlides } from '@/components/onboarding/IntroSlides';

export default function MePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showIntro, setShowIntro] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isProvider = user?.roles?.includes('provider');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-8 pb-32"
    >
      {/* Profile Header */}
      <section className="flex flex-col items-center gap-4 py-8">
        <div className="relative group">
          <div 
             className="w-24 h-24 rounded-[2rem] bg-white shadow-2xl shadow-indigo-100 flex items-center justify-center text-4xl border-4 border-white overflow-hidden"
             style={{ backgroundColor: user?.avatarUrl?.split(':')[2] || '#f8fafc' }}
          >
            {user?.avatarUrl?.includes(':') ? user.avatarUrl.split(':')[1] : (user?.displayName === 'Seeker' ? '👤' : '😊')}
          </div>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            onClick={() => router.push('/me/edit')}
            className="absolute -bottom-1 -right-1 p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            <PenLine size={16} />
          </motion.div>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            {user?.displayName || 'Anonymous User'}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            {isProvider ? (user?.providerType || 'Provider') : 'Standard Account'}
          </p>
        </div>
      </section>

      {/* Balance & Status Section */}
      <section className="grid grid-cols-2 gap-4">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/seeker/wallet')}
          className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group cursor-pointer"
        >
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Wallet</span>
            <span className="text-2xl font-black tabular-nums">₹{user?.creditBalance || 0}</span>
          </div>
          <Wallet className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 group-hover:rotate-12 transition-transform" />
        </motion.div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
            <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <button 
            onClick={() => setIsAvailable(!isAvailable)}
            className="text-lg font-black text-slate-900 tracking-tight mt-1 text-left"
          >
            {isAvailable ? 'Available' : 'Invisible'}
          </button>
        </div>
      </section>

      {/* Primary Action Section */}
      {!isProvider ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowIntro(true)}
          className="w-full bg-slate-900 p-6 rounded-[2.5rem] text-white flex items-center justify-between group shadow-xl shadow-slate-200"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
              <Zap size={24} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-0.5">Start Earning</h3>
              <p className="text-[10px] opacity-60 font-medium">Earn money by helping others.</p>
            </div>
          </div>
          <ChevronRight className="opacity-40" />
        </motion.button>
      ) : (
        <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-0.5 text-indigo-900">Provider Active</h3>
                    <p className="text-[10px] text-indigo-600 font-medium">You are ready to get calls.</p>
                </div>
            </div>
        </div>
      )}

      {/* Menu List */}
      <section className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-6">Account & Settings</h4>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <MenuItem 
            icon={<User size={18} />} 
            label="Edit Business Profile" 
            subLabel="Photos, Bio & Session Rates" 
            onClick={() => router.push('/me/edit')}
          />
          <MenuItem 
            icon={<History size={18} />} 
            label="Call History" 
            subLabel="View past logs & recordings" 
            onClick={() => router.push('/history')}
          />
          <MenuItem 
            icon={<Settings size={18} />} 
            label="App Settings" 
            subLabel="Notifications & Privacy" 
          />
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-6">Support & Legal</h4>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <MenuItem 
            icon={<HelpCircle size={18} />} 
            label="Help & Support" 
            subLabel="Chat with our 24/7 team" 
          />
          <MenuItem 
            icon={<Shield size={18} />} 
            label="Privacy Center" 
            subLabel="How we keep your data safe" 
          />
          <MenuItem 
            icon={<ExternalLink size={18} />} 
            label="Legal Documents" 
            subLabel="Terms & Conditions" 
          />
        </div>
      </section>

      {/* Logout */}
      <motion.button
        whileHover={{ backgroundColor: 'rgb(254 242 242)' }}
        onClick={handleLogout}
        className="w-full p-6 rounded-[2.5rem] flex items-center gap-4 text-rose-500 font-black uppercase tracking-[0.2em] text-[10px]"
      >
        <div className="p-3 bg-rose-50 rounded-2xl">
          <LogOut size={18} />
        </div>
        Sign Out Account
      </motion.button>

      {/* Intro Overlay */}
      <AnimatePresence>
        {showIntro && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowIntro(false)} />
             <div className="relative z-10 w-full max-w-md">
                <IntroSlides 
                    onComplete={() => {
                        setShowIntro(false);
                        router.push('/onboarding/provider');
                    }} 
                />
             </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuItem({ icon, label, subLabel, onClick }: { icon: any, label: string, subLabel: string, onClick?: () => void }) {
  return (
    <motion.button 
      whileHover={{ backgroundColor: 'rgba(79, 70, 229, 0.02)' }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-6 transition-colors group"
    >
      <div className="flex items-center gap-4 text-left">
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
          {icon}
        </div>
        <div>
          <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900">{label}</h5>
          <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">{subLabel}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-300 transition-colors" />
    </motion.button>
  );
}