'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Wallet, History } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const txnid = searchParams.get('txnid');
  const type = searchParams.get('type');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
        <CheckCircle2 size={48} className="text-emerald-500 relative z-10" />
      </div>

      <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
        Payment Successful! 🎉
      </h1>
      <p className="text-slate-500 font-medium italic mb-12">
        Aapka payment safalta purvak prapt ho gaya hai.
      </p>

      <div className="w-full max-w-sm bg-slate-50 rounded-3xl border border-slate-100 p-8 space-y-6 mb-12">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-black uppercase tracking-widest">Transaction ID</span>
          <span className="text-slate-900 font-bold font-mono">{txnid?.slice(0, 12)}...</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 font-black uppercase tracking-widest">Type</span>
          <span className="text-slate-900 font-bold uppercase tracking-widest">{type?.replace('_', ' ') || 'Reload'}</span>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-4">
        <Link 
          href="/seeker/home" 
          className="h-16 bg-slate-900 text-white rounded-2xl font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <span>Continue calling</span>
          <ArrowRight size={20} />
        </Link>
        <div className="flex gap-4">
          <Link 
            href="/seeker/wallet" 
            className="flex-1 h-14 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Wallet size={18} />
            Wallet
          </Link>
          <Link 
            href="/seeker/history" 
            className="flex-1 h-14 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <History size={18} />
            History
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

