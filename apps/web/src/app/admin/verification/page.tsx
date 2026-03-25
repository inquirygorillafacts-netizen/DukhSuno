'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { 
    ShieldCheck, 
    XCircle, 
    CheckCircle, 
    User, 
    Loader2, 
    AlertCircle,
    Phone,
    UserCircle,
    PhoneIncoming
} from 'lucide-react';

interface Listener {
  uid: string;
  displayName: string;
  headline: string;
  bio: string;
  phoneNumber: string;
  isVerified: boolean;
  verificationStatus: string;
  avatarUrl: string;
}

export default function OwnerVerificationPage() {
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('verificationStatus', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Listener));
      setListeners(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (uid: string, status: 'verified' | 'rejected') => {
    setActingId(uid);
    try {
      const res = await fetch('/api/verify/listener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listenerId: uid, status })
      });
      if (!res.ok) throw new Error('Update failed');
    } catch (err) {
      console.error(err);
      alert('Action failed! Console check karein.');
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <div className="p-10 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Queue...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verification Queue</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Users waiting for manual approval to become "Sunne Wale".</p>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-2">
             <AlertCircle size={14} className="text-amber-600" />
             <span className="text-[10px] font-black uppercase text-amber-700">{listeners.length} Pending Approval</span>
          </div>
      </div>

      {listeners.length === 0 ? (
        <div className="p-20 text-center rounded-[40px] border-2 border-dashed border-slate-100 bg-white shadow-inner flex flex-col items-center">
            <ShieldCheck size={48} className="text-emerald-100 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px]">All Clean!</p>
            <p className="text-slate-300 text-xs font-medium mt-1 uppercase tracking-widest">No pending applications at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {listeners.map((l) => (
            <div key={l.uid} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              
              <div className="w-24 h-24 rounded-[2rem] bg-primary/5 border-2 border-primary/20 flex items-center justify-center text-4xl shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                {l.avatarUrl?.startsWith('avatar:') ? l.avatarUrl.split(':')[1] : '👤'}
              </div>
              
              <div className="flex-1 text-center lg:text-left min-w-0 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{l.displayName}</h3>
                    <div className="flex items-center justify-center lg:justify-start gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                        <Phone size={10} strokeWidth={3} /> {l.phoneNumber || 'NO_PH'}
                    </div>
                </div>
                <p className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-3">{l.headline || 'No Headline'}</p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 text-xs font-medium leading-relaxed italic">
                    "{l.bio || 'User has not provided a biography yet.'}"
                </div>
              </div>

              <div className="flex lg:flex-col gap-3 shrink-0 relative z-10 w-full lg:w-auto">
                 <button 
                   onClick={() => handleAction(l.uid, 'verified')}
                   disabled={actingId === l.uid}
                   className="flex-1 lg:h-14 lg:w-44 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                   {actingId === l.uid ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} strokeWidth={3} /> Verify Now</>}
                 </button>
                 <button 
                   onClick={() => handleAction(l.uid, 'rejected')}
                   disabled={actingId === l.uid}
                   className="flex-1 lg:h-14 lg:w-44 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                   <XCircle size={16} strokeWidth={3} /> Reject
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
