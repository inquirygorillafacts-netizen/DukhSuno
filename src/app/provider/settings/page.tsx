'use client';

import { useAuthStore } from '@/stores/auth-store';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Lock, 
  Eye, 
  HelpCircle, 
  ChevronRight, 
  LogOut,
  Moon,
  Shield,
  QrCode
} from 'lucide-react';
import React from 'react';

export default function SunneSettingsPage() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24 px-4">
      <div className="px-2 pt-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">सेटिंग्स (Settings)</h1>
        <p className="text-slate-500 font-medium italic">अपना अकाउंट और प्रेफरेंस मैनेज करें।</p>
      </div>

      <div className="space-y-4">
        <SectionHeader title="अकाउंट और सुरक्षा" />
        <SettingsLink icon={<Lock size={18} />} label="पासवर्ड बदलें" />
        <SettingsLink icon={<Shield size={18} />} label="टू-फैक्टर ऑथेंटिकेशन" badge="जरूरी" />
        <SettingsLink 
           icon={<QrCode size={18} />} 
           label="पेमेंट सेटिंग्स (Payout Setup)" 
           onClick={() => router.push('/provider/settings/payment')}
        />
      </div>

      <div className="space-y-4">
        <SectionHeader title="पसंद (Preferences)" />
        <SettingsLink icon={<Bell size={18} />} label="नोटिफिकेशन सेटिंग्स" />
        <SettingsLink icon={<Eye size={18} />} label="प्राइवेसी और विजिबिलिटी" />
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 transition-colors"><Moon size={18} /></div>
              <span className="font-bold text-sm text-slate-700">डार्क मोड (Dark Mode)</span>
           </div>
           <div className="w-12 h-6 bg-slate-100 rounded-full p-1 flex items-center">
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionHeader title="सपोर्ट (Support)" />
        <SettingsLink icon={<HelpCircle size={18} />} label="हेल्प सेंटर और FAQ" />
        <SettingsLink icon={<Shield size={18} />} label="नियम और शर्तें" />
      </div>

      <div className="pt-6">
        <button 
          onClick={handleLogout}
          className="w-full p-5 rounded-[1.5rem] bg-rose-50 text-rose-600 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 border border-rose-100 hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
        >
          <LogOut size={16} /> BigSuno से लॉगआउट करें
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{title}</h3>
  );
}

function SettingsLink({ icon, label, badge, onClick }: { icon: any, label: string, badge?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{icon}</div>
        <span className="font-bold text-sm text-slate-700">{label}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-md border border-indigo-100">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
