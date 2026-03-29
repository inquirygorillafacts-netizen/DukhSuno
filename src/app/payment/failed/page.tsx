'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, RefreshCcw, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function FailedContent() {
  const searchParams = useSearchParams();
  const txnid = searchParams.get('txnid');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-8">
        <XCircle size={48} className="text-rose-500" />
      </div>

      <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
        Payment Failed! 💔
      </h1>
      <p className="text-slate-500 font-medium italic mb-12">
        Don't worry. If your account was debited, the amount will be automatically refunded within 24-48 hours.
      </p>

      <div className="w-full max-w-sm bg-rose-50/50 rounded-3xl border border-rose-100 p-8 space-y-4 mb-12">
        <p className="text-[12px] font-black text-rose-400 uppercase tracking-widest">Error Details</p>
        <p className="text-[14px] text-rose-900 font-bold leading-relaxed italic">
          {error === 'hash_mismatch' 
            ? 'Security verification failed. Please try again from the app.' 
            : 'The transaction was declined by your bank or the payment processor.'}
        </p>
        {txnid && (
          <p className="text-[10px] text-rose-400 font-mono">Reference: {txnid}</p>
        )}
      </div>

      <div className="flex flex-col w-full max-w-sm gap-4">
        <Link 
          href="/seeker/home" 
          className="h-16 bg-slate-900 text-white rounded-2xl font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <RefreshCcw size={20} />
          <span>Try again</span>
        </Link>
        <div className="flex gap-4">
          <Link 
             href="/seeker/home" 
             className="flex-1 h-14 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
            Back Home
          </Link>
          <button 
             onClick={() => alert('Support team is on the way! 📞')}
             className="flex-1 h-14 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <HelpCircle size={18} />
            Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}

