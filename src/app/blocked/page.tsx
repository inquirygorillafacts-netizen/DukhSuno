'use client';

import React from 'react';
import { Ban, ShieldAlert, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function BlockedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-jakarta">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Icon Header */}
        <div className="mb-10 relative inline-block">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center">
            <Ban size={48} className="text-rose-500" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
          Aap Blocked Hain <br />
          <span className="text-rose-500">Account Restricted</span>
        </h1>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium italic">
          "Humne aapke account mein sandigdh gatividhi (suspicious activity) dekhi hai, isiliye aapka access temporarily rok diya gaya hai."
        </p>

        <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 mb-10 text-left">
          <div className="flex items-center gap-3 mb-3">
             <ShieldAlert size={18} className="text-rose-500" />
             <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Suraksha Chetavani</span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Agar aapko lagta hai ki yeh galti se hua hai, toh kripya DukhSuno Management se contact karein. Aapka screen data aur calling features freeze kar diye gaye hain.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <a
            href="https://wa.me/918302829465?text=Hello%20DukhSuno%20Team,%20mera%20account%20block%20ho%20gaya%20hai.%20Kripya%20meri%20sadaayta%20karein."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Help on WhatsApp
          </a>

          <button
            onClick={handleSignOut}
            className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
          >
            <LogOut size={16} /> Sign Out (Logout)
          </button>
        </div>
      </div>

      <p className="mt-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
        DukhSuno Security System v1.0
      </p>
    </div>
  );
}
