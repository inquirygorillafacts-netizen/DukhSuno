'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { 
  IndianRupee, TrendingUp, ArrowUpRight, Sparkles, 
  Upload, X, CheckCircle2, History as HistoryIcon, 
  AlertCircle, XCircle, Clock
} from 'lucide-react';
import { 
  query, collection, where, orderBy, limit, onSnapshot, 
  doc, updateDoc, serverTimestamp, runTransaction 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function uploadToImgBB(file: File): Promise<string> {
   const formData = new FormData();
   formData.append('image', file);
   const res = await fetch('/api/upload-qr', {
      method: 'POST',
      body: formData,
   });
   const data = await res.json();
   if (data.url) return data.url;
   throw new Error(data.error || 'Upload failed');
}

export default function SunneEarningsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'sessions' | 'withdrawals'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(99);

  // States
  const [showSetup, setShowSetup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lock body scroll
  useEffect(() => {
     if (showSetup || showWithdraw) document.body.style.overflow = 'hidden';
     else document.body.style.overflow = 'unset';
     return () => { document.body.style.overflow = 'unset'; };
  }, [showSetup, showWithdraw]);

  useEffect(() => {
    if (!user) return;

    // Fetch Platform Config
    const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
       if (snap.exists()) {
          setMinWithdrawalAmount(snap.data().minWithdrawalAmount || 99);
       }
    });

    // Sessions History
    const fireQ = query(
      collection(db, 'sessions'),
      where('listenerId', '==', user.uid),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribeSessions = onSnapshot(fireQ, (snapshot) => {
      setSessions(snapshot.docs.map((doc) => ({ sessionId: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Withdrawals History
    const wReqs = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribeWithdrawals = onSnapshot(wReqs, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribeConfig();
      unsubscribeSessions();
      unsubscribeWithdrawals();
    };
  }, [user?.uid]);

  const handleQrUpload = async () => {
      if (!qrFile || !user) return;
      setUploading(true);
      try {
         const url = await uploadToImgBB(qrFile);
         await updateDoc(doc(db, 'users', user.uid), { paymentQrUrl: url });
         setShowSetup(false);
         setQrFile(null);
         setQrPreview(null);
      } catch (err) {
         setErrorMsg('QR upload failed. Please try again.');
      } finally {
         setUploading(false);
      }
   };

   const handleWithdrawClick = () => {
     if (!user?.paymentQrUrl) {
       setShowSetup(true);
     } else {
       setShowWithdraw(true);
     }
   };

   const handleWithdrawRequest = async () => {
      if (!user) return;
      setErrorMsg(null);
      
      const amount = Number(withdrawAmount);
      if (isNaN(amount) || amount < minWithdrawalAmount) {
         setErrorMsg(`Minimum withdrawal is ₹${minWithdrawalAmount}`);
         return;
      }
      if (amount > (user.availableBalance || 0)) {
         setErrorMsg('Insufficient available balance');
         return;
      }

      setUploading(true);
      try {
         await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("User not found");
            
            const currentBal = userDoc.data().availableBalance || 0;
            if (currentBal < amount) throw new Error("Insufficient balance");

            transaction.update(userRef, {
               availableBalance: currentBal - amount
            });

            const withdrawRef = doc(collection(db, 'withdrawals'));
            transaction.set(withdrawRef, {
               userId: user.uid,
               userName: user.displayName,
               userPhone: user.phone || '',
               amount: amount,
               status: 'pending',
               paymentQrUrl: user.paymentQrUrl,
               createdAt: serverTimestamp(),
               updatedAt: serverTimestamp()
            });
         });
         
         setShowWithdraw(false);
         setWithdrawAmount('');
         setActiveTab('withdrawals'); // switch tab automatically
      } catch (err: any) {
         setErrorMsg(err.message || 'Withdrawal request failed');
      } finally {
         setUploading(false);
      }
   };

   const pendingWithdrawalsAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-20">
      
      {/* ─── BALANCE CARD ─── */}
      <div className="glass bg-white p-6 md:p-10 rounded-3xl text-center relative overflow-hidden border border-white shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ff4d6d] to-rose-300"></div>
        <p className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-3 mt-3">Available Balance</p>
        <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-none inline-flex items-center justify-center">
          <IndianRupee className="w-8 h-8 md:w-12 md:h-12 text-[#ff4d6d]/20 -mr-1 md:-mr-2" strokeWidth={3} />
          <span>{user?.availableBalance || 0}</span>
        </h3>
        <button 
          onClick={handleWithdrawClick} 
          className="w-full py-4 rounded-xl bg-[#ff4d6d] text-white font-black text-sm shadow-xl shadow-rose-200 hover:bg-rose-500 transition-all active:scale-95 hover:-translate-y-1 flex items-center justify-center gap-3 uppercase tracking-widest group"
        >
           <ArrowUpRight size={18} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           Withdraw to UPI
        </button>
        <div className="flex items-center justify-between text-[9px] mt-6 font-bold uppercase tracking-widest text-slate-400">
           <span>Min withdrawal: ₹{minWithdrawalAmount}</span>
           {user?.paymentQrUrl ? (
             <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10} /> UPI Setup Done</span>
           ) : (
             <span className="text-rose-500 flex items-center gap-1"><AlertCircle size={10} /> Action Required</span>
           )}
        </div>
      </div>

      {/* ─── STATS GRID ─── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass bg-white p-4 rounded-2xl border border-white text-center">
           <p className="text-lg font-black tracking-tighter">₹{user?.totalEarnings || 0}</p>
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Earned</p>
        </div>
        <div className="glass bg-white p-4 rounded-2xl border border-white text-center">
           <p className="text-lg font-black text-amber-500 tracking-tighter">₹{pendingWithdrawalsAmount}</p>
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Request</p>
        </div>
      </div>

      {/* ─── TABS & HISTORY ─── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-xl">
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'sessions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Sessions Earnings
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'withdrawals' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
          >
            Withdrawals
          </button>
        </div>

        <div className="space-y-3 pb-24 mt-4">
          {loading ? (
            <div className="p-6 text-center animate-pulse uppercase text-[9px] font-black tracking-widest text-slate-400">Loading passbook...</div>
          ) : activeTab === 'sessions' ? (
            sessions.map((item: any) => (
              <div key={item.sessionId} className="glass bg-white p-4 rounded-2xl border border-white flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs uppercase tracking-tighter truncate">Call Income</h5>
                  <p className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">
                      {(item.createdAt as any)?.toDate 
                          ? (item.createdAt as any).toDate().toLocaleString() 
                          : 'Recent'} · {Math.floor((item.durationSeconds || 0) / 60)} min
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-base text-emerald-500 tracking-tighter">+₹{item.listenerEarned || item.providerEarned || 0}</p>
                </div>
              </div>
            ))
          ) : (
            withdrawals.map((req: any) => {
               // Determine visual state based on explicit logic user asked
               let isCompleted = req.status === 'completed' || req.status === 'paid';
               let isRejected = req.status === 'declined' || req.status === 'rejected';
               let isPending = req.status === 'pending';
               
               let statusColor = "text-amber-500";
               let bgColor = "bg-amber-50";
               let Icon = Clock;
               let statusText = "Requested";

               if (isCompleted) {
                  statusColor = "text-emerald-500";
                  bgColor = "bg-emerald-50";
                  Icon = CheckCircle2;
                  statusText = "Withdrawn";
               } else if (isRejected) {
                  statusColor = "text-rose-500";
                  bgColor = "bg-rose-50";
                  Icon = XCircle;
                  statusText = "Rejected";
               }

               return (
                  <div key={req.id} className="glass bg-white p-4 rounded-2xl border border-white flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${bgColor} ${statusColor} flex items-center justify-center shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs uppercase tracking-tighter truncate">Withdrawal</h5>
                        <p className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">
                            {(req.createdAt as any)?.toDate ? (req.createdAt as any).toDate().toLocaleString() : 'Recent'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-black text-base tracking-tighter ${statusColor}`}>
                          -₹{req.amount}
                        </p>
                      </div>
                    </div>
                    {/* Status Badge & Rejection Note */}
                    <div className="flex flex-col items-end gap-1 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${bgColor} ${statusColor}`}>
                           {statusText}
                        </span>
                        {isRejected && req.reason && (
                           <div className="w-full bg-rose-50/50 p-2 rounded-lg mt-1 border border-rose-100 flex items-start gap-2">
                             <AlertCircle size={12} className="text-rose-600 shrink-0 mt-0.5" />
                             <p className="text-[9px] font-bold text-rose-600 leading-tight">Note: {req.reason}</p>
                           </div>
                        )}
                    </div>
                  </div>
               );
            })
          )}
          
          {!loading && activeTab === 'sessions' && sessions.length === 0 && (
            <div className="p-10 text-center glass rounded-[3rem] bg-slate-50 border border-slate-100 border-dashed">
              <Sparkles className="w-8 h-8 text-indigo-300 mx-auto mb-3" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No sessions yet ✨</p>
            </div>
          )}
          
          {!loading && activeTab === 'withdrawals' && withdrawals.length === 0 && (
            <div className="p-10 text-center glass rounded-[3rem] bg-slate-50 border border-slate-100 border-dashed">
              <HistoryIcon className="w-8 h-8 text-rose-300 mx-auto mb-3" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No withdrawal history</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: WITHDRAWAL REQUEST ─── */}
      {showWithdraw && (
         <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 pb-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-t-[3rem] md:rounded-[2.5rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-10">
               <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                     <ArrowUpRight size={24} />
                  </div>
                  <button onClick={() => setShowWithdraw(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors">
                     <X size={20} />
                  </button>
               </div>
               
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Enter Amount</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-8">Available: ₹{user?.availableBalance || 0}</p>
               
               <div className="relative mb-6">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                  <input
                     type="number"
                     placeholder="0"
                     value={withdrawAmount}
                     onChange={(e) => setWithdrawAmount(e.target.value)}
                     className="w-full bg-slate-50 h-20 rounded-[1.5rem] px-14 text-4xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-50 border border-transparent focus:border-rose-100 transition-all font-sans"
                  />
               </div>

               {errorMsg && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center mb-6 bg-rose-50 p-3 rounded-xl">{errorMsg}</p>}

               <button
                  onClick={handleWithdrawRequest}
                  disabled={uploading || !withdrawAmount}
                  className="w-full h-14 bg-slate-900 hover:bg-rose-600 disabled:opacity-50 text-white rounded-[1.25rem] font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 transition-colors"
               >
                  {uploading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <>Request Payout <ArrowUpRight size={16} /></>
                  )}
               </button>
            </div>
         </div>
      )}

      {/* ─── MODAL: QR SETUP ─── */}
      {showSetup && (
         <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 pb-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-t-[3rem] md:rounded-[2.5rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-10">
               <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                     <CheckCircle2 size={24} />
                  </div>
                  <button onClick={() => { setShowSetup(false); setQrFile(null); setQrPreview(null); }} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors">
                     <X size={20} />
                  </button>
               </div>
               
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Setup UPI</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-8">Upload QR Code to receive payments</p>
               
               <div className="w-full aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer">
                  {qrPreview ? (
                     <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain p-4" />
                  ) : (
                     <>
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 mb-3 transition-colors" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover:text-emerald-600">Tap to Upload</span>
                     </>
                  )}
                  <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                           setQrFile(file);
                           setQrPreview(URL.createObjectURL(file));
                        }
                     }}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                  />
               </div>

               {errorMsg && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center mt-6 p-2 bg-rose-50 rounded-lg">{errorMsg}</p>}

               <button
                  onClick={handleQrUpload}
                  disabled={uploading || !qrFile}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-[1.25rem] font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 transition-colors mt-8"
               >
                  {uploading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <>Save QR Code <CheckCircle2 size={16} /></>
                  )}
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
