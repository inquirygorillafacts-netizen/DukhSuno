'use client';


import { useState, useEffect, ReactElement, cloneElement } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
   IndianRupee,
   ArrowUpRight,
   ArrowDownLeft,
   Clock,
   CheckCircle2,
   XCircle,
   Wallet,
   Plus,
   QrCode,
   Settings,
   ChevronRight,
   History,
   AlertCircle,
   Image as ImageIcon,
   Upload,
   X,
   Share2,
   Minus,
   ShieldCheck
} from 'lucide-react';
import {
   doc,
   updateDoc,
   onSnapshot,
   query,
   collection,
   where,
   orderBy,
   limit,
   addDoc,
   serverTimestamp,
   runTransaction
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

export default function WalletPage() {
   const { user, setUser } = useAuthStore();
   const [activeTab, setActiveTab] = useState<'transactions' | 'requests'>('transactions');
   const [transactions, setTransactions] = useState<any[]>([]);
   const [requests, setRequests] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
   const [commission, setCommission] = useState(0.10); // 10% Platform Fee (Updated)
   const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(99); // New default 99

   // Withdrawal States
   const [showSetup, setShowSetup] = useState(false);
   const [showWithdraw, setShowWithdraw] = useState(false);
   const [qrFile, setQrFile] = useState<File | null>(null);
   const [qrPreview, setQrPreview] = useState<string | null>(null);
   const [uploading, setUploading] = useState(false);
   const [withdrawAmount, setWithdrawAmount] = useState('');
   const [errorMsg, setErrorMsg] = useState<string | null>(null);

   const router = useRouter();

   // Lock body scroll when modal is open
   useEffect(() => {
      if (showSetup || showWithdraw) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [showSetup, showWithdraw]);

   useEffect(() => {
      if (!user) return;

      // Listen to User for real-time balance
      const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
         if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({ ...user, ...data });
         }
      });

      // Listen to Transactions
      const qTrans = query(
         collection(db, 'transactions'),
         where('userId', '==', user.uid),
         orderBy('createdAt', 'desc'),
         limit(20)
      );
      const unsubscribeTrans = onSnapshot(qTrans, (snap) => {
         setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Listen to Withdrawal Requests
      const qReqs = query(
         collection(db, 'withdrawals'),
         where('userId', '==', user.uid),
         orderBy('createdAt', 'desc'),
         limit(20)
      );
      const unsubscribeReqs = onSnapshot(qReqs, (snap) => {
         setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Fetch Platform Config
      const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
         if (snap.exists()) {
            const data = snap.data();
            setCommission(data.defaultCommissionRate || 0.10); // Updated to 10% fallback
            setMinWithdrawalAmount(data.minWithdrawalAmount || 99);
         }
      });

      return () => {
         unsubscribeUser();
         unsubscribeTrans();
         unsubscribeReqs();
         unsubscribeConfig();
      };
   }, [user?.uid]);

   const handleQrUpload = async () => {
      if (!qrFile || !user) return;
      setUploading(true);
      try {
         const url = await uploadToImgBB(qrFile);
         await updateDoc(doc(db, 'users', user.uid), {
            paymentQrUrl: url
         });
         setShowSetup(false);
         setQrFile(null);
         setQrPreview(null);
      } catch (err) {
         setErrorMsg('QR upload failed. Please try again.');
      } finally {
         setUploading(false);
      }
   };

   const handleDeleteQr = async () => {
      if (!user || !window.confirm("Are you sure you want to delete your payout QR? You won't be able to withdraw until you upload a new one.")) return;
      setUploading(true);
      try {
         await updateDoc(doc(db, 'users', user.uid), {
            paymentQrUrl: ''
         });
         setQrPreview(null);
         setQrFile(null);
      } catch (err) {
         setErrorMsg('Failed to delete QR.');
      } finally {
         setUploading(false);
      }
   };

   const handleWithdrawRequest = async () => {
      const amount = parseFloat(withdrawAmount);
      if (!user || isNaN(amount) || amount < minWithdrawalAmount) {
         setErrorMsg(`Min withdrawal is ₹${minWithdrawalAmount}.`);
         return;
      }

      setLoading(true);
      try {
         const { getDocs, query, collection, where, writeBatch, doc, serverTimestamp, runTransaction } = await import('firebase/firestore');
         const { db } = await import('@/lib/firebase');

         // 1. Fetch all pending transactions for this user
         const q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('type', '==', 'earning'),
            where('status', '==', 'pending')
         );
         const querySnapshot = await getDocs(q);
         const pendingTxns = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

         if (pendingTxns.length === 0) {
            throw new Error("No pending earnings available to withdraw.");
         }

         // Calculate totals from the specific transactions
         const totalGross = pendingTxns.reduce((acc, tx: any) => acc + (tx.amount || 0), 0);
         const totalNet = pendingTxns.reduce((acc, tx: any) => acc + (tx.listenerAmount || tx.providerAmount || 0), 0);
         const totalFee = totalGross - totalNet;
         const transactionIds = pendingTxns.map(tx => tx.id);

         // 2. Perform atomic update
         await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw "User not found!";

            const currentBalance = userDoc.data().availableBalance || 0;

            // Create Withdrawal Request
            const withdrawRef = doc(collection(db, 'withdrawals'));
            const requestId = withdrawRef.id;

            transaction.set(withdrawRef, {
               id: requestId,
               userId: user.uid,
               userName: user.displayName || 'Unnamed',
               amount: totalGross,
               platformFee: totalFee,
               netAmount: totalNet,
               transactionIds: transactionIds,
               status: 'pending',
               qrUrl: (user as any).paymentQrUrl,
               createdAt: serverTimestamp()
            });

            // Update all associated transactions to 'requested'
            pendingTxns.forEach(tx => {
               const txRef = doc(db, 'transactions', tx.id);
               transaction.update(txRef, {
                  status: 'requested',
                  withdrawalRequestId: requestId
               });
            });

            // Deduct from availableBalance in User Doc
            transaction.update(userRef, {
               availableBalance: Math.max(0, currentBalance - totalNet)
            });

            // Add a 'Withdrawing' log transaction (optional but helpful for UI)
            const logRef = doc(collection(db, 'transactions'));
            transaction.set(logRef, {
               userId: user.uid,
               amount: totalNet,
               type: 'withdrawal',
               status: 'pending',
               withdrawalRequestId: requestId,
               description: `Withdrawal request for ${transactionIds.length} sessions`,
               createdAt: serverTimestamp()
            });
         });

         setShowWithdraw(false);
         setWithdrawAmount('');
         setErrorMsg(null);
      } catch (err: any) {
         setErrorMsg(err.message || err.toString());
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-24">

         {/* 5XL Balance Display (Centered like Seeker) */}
         <section className="text-center pt-8 relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-2 italic">Available Balance</span>
            <div className="flex items-center justify-center gap-2">
               <span className="text-2xl font-black text-slate-300">₹</span>
               <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic">
                  {user?.availableBalance?.toLocaleString() || '0'}
               </h2>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
               <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><ShieldCheck size={12} /></div>
               Net Earnings ready to Withdraw
            </div>

            <button
               onClick={() => (user as any)?.paymentQrUrl ? setShowWithdraw(true) : setShowSetup(true)}
               className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto"
            >
               Request Withdrawal <ArrowUpRight size={16} />
            </button>
         </section>

         {/* Earning Stats Grid (Matching Seeker's Quick Reload Grid) */}
         <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Earning Statistics</span>
               <button onClick={() => setShowSetup(true)} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                  <Settings size={12} /> Payout Method
               </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="glass bg-white border border-slate-100 p-5 rounded-3xl text-center group">
                  <Plus size={14} className="mx-auto mb-2 text-emerald-400" />
                  <p className="text-xl font-black text-slate-800 tracking-tighter italic">₹{(user as any)?.todayEarnings || 0}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Today</p>
               </div>
               <div className="glass bg-white border border-slate-100 p-5 rounded-3xl text-center group">
                  <History size={14} className="mx-auto mb-2 text-indigo-400" />
                  <p className="text-xl font-black text-slate-800 tracking-tighter italic">₹{user?.totalEarnings || 0}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Lifetime</p>
               </div>
               <div className="glass bg-white border border-slate-100 p-5 rounded-3xl text-center group">
                  <Clock size={14} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-xl font-black text-slate-800 tracking-tighter italic">{requests.filter(r => r.status === 'pending').length}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pending</p>
               </div>
               <div className="glass bg-white border border-slate-100 p-5 rounded-3xl text-center group">
                  <CheckCircle2 size={14} className="mx-auto mb-2 text-indigo-400" />
                  <p className="text-xl font-black text-slate-800 tracking-tighter italic">{transactions.filter(t => t.type === 'earning').length}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total Calls</p>
               </div>
            </div>
         </section>

         {/* UPI QR Status (Matching Seeker's Financial Security Box) */}
         {!(user as any)?.paymentQrUrl ? (
            <div onClick={() => setShowSetup(true)} className="p-6 md:p-10 glass bg-rose-50 rounded-3xl border border-rose-100 shadow-sm relative group overflow-hidden cursor-pointer">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl" />
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg text-rose-500">
                     <QrCode className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <h4 className="text-lg md:text-xl font-black text-rose-900 leading-none mb-1 uppercase tracking-tighter italic">Setup Payout Method</h4>
                     <p className="text-[9px] md:text-sm text-rose-600 font-medium leading-relaxed">Please upload your UPI QR code to receive your earnings secure and fast.</p>
                  </div>
                  <ChevronRight className="text-rose-300 hidden md:block" />
               </div>
            </div>
         ) : (
            <div className="p-6 md:p-10 glass bg-white rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner border border-slate-200/50">
                     <Wallet className="text-slate-900 w-8 h-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <h4 className="text-lg md:text-xl font-black leading-none mb-1 uppercase tracking-tighter italic">Financial Integrity</h4>
                     <p className="text-[9px] md:text-sm text-slate-500 font-medium leading-relaxed">Your earnings are verified, secure, and ready for withdrawal anytime.</p>
                  </div>
               </div>
            </div>
         )}

         {/* History Tabs & List */}
         <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                     onClick={() => setActiveTab('transactions')}
                     className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'transactions' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                  >
                     History
                  </button>
                  <button
                     onClick={() => setActiveTab('requests')}
                     className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                  >
                     Withdrawals
                  </button>
               </div>
            </div>

            <div className="space-y-4">
               {activeTab === 'transactions' ? (
                  transactions.length > 0 ? (
                     transactions.map((t) => (
                        <div key={t.id} className="p-5 rounded-3xl bg-white border border-slate-50 flex items-center justify-between hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'earning' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                                 {t.type === 'earning' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
                                    {t.type === 'earning' ? 'Call Earnings' : 'Withdrawal'}
                                 </p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                    {(t.createdAt as any)?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                 </p>
                              </div>
                           </div>
                           <p className={`text-base font-black italic tracking-tighter ${t.type === 'earning' ? 'text-emerald-500' : 'text-slate-900'}`}>
                              {t.type === 'earning' ? '+' : '-'}₹{t.amount}
                           </p>
                        </div>
                     ))
                  ) : (
                     <EmptyState icon={<History />} text="No transaction history." />
                  )
               ) : (
                  requests.length > 0 ? (
                     requests.map((r) => (
                        <div key={r.id} className="p-5 rounded-3xl bg-white border border-slate-50 flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
                                    r.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                                 }`}>
                                 {r.status === 'completed' ? <CheckCircle2 size={18} /> :
                                    r.status === 'rejected' ? <XCircle size={18} /> : <Clock size={18} />}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
                                    Cashout Request
                                 </p>
                                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                    {r.status.toUpperCase()} • Net: ₹{r.netAmount || (r.amount - Math.floor(r.amount * commission))}
                                 </p>
                              </div>
                           </div>
                           <p className="text-base font-black italic tracking-tighter text-slate-900">₹{r.amount}</p>
                        </div>
                     ))
                  ) : (
                     <EmptyState icon={<Wallet />} text="No withdrawal requests." />
                  )
               )}
            </div>
         </section>

         {/* Sheet Overlays */}
         {showSetup && (
            <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
               <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-10 duration-500 relative shadow-2xl">
                  <button onClick={() => { setShowSetup(false); setQrPreview(null); setQrFile(null); }} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                     <X size={20} />
                  </button>

                  <div className="text-center space-y-2">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Payout Method</h2>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-loose">Upload your UPI QR code to receive payments securely.</p>
                  </div>

                  <div className="relative group">
                     <input id="qr-input" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setQrFile(file); setQrPreview(URL.createObjectURL(file)); }
                     }} />

                     {qrPreview || (user as any)?.paymentQrUrl ? (
                        <div className="space-y-6">
                           <div className="relative rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-xl aspect-square">
                              <img src={qrPreview || (user as any)?.paymentQrUrl} className="w-full h-full object-cover" alt="QR" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                 <button onClick={() => document.getElementById('qr-input')?.click()} className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-110 transition-transform">
                                    <Upload size={14} /> Change
                                 </button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div onClick={() => !uploading && document.getElementById('qr-input')?.click()} className="w-full aspect-square rounded-[2.5rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-4 hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-inner"><ImageIcon size={32} /></div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select QR Image</p>
                        </div>
                     )}
                  </div>

                  {qrFile && (
                     <button disabled={uploading} onClick={handleQrUpload} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[14px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-50">
                        {uploading ? 'Uploading...' : 'Save QR Details ✨'}
                     </button>
                  )}
               </div>
            </div>
         )}

         {showWithdraw && (
            <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
               <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-10 duration-500 relative shadow-2xl">
                  <button onClick={() => setShowWithdraw(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                     <X size={20} />
                  </button>

                  <div className="text-center space-y-2">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Withdraw Funds</h2>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Minimum withdrawal is ₹{minWithdrawalAmount}</p>
                  </div>

                  <div className="relative group">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
                     <input
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0"
                        className="w-full h-24 pl-14 pr-6 rounded-3xl bg-slate-50 border border-slate-100 text-3xl font-black tracking-tighter placeholder:text-slate-200 focus:bg-white focus:border-indigo-200 outline-none transition-all shadow-inner"
                     />
                  </div>

                  <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 space-y-3">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Fee ({(commission * 100).toFixed(0)}%)</span>
                        <span>-₹{Math.floor((parseInt(withdrawAmount) || 0) * commission)}</span>
                     </div>
                     <div className="h-px bg-indigo-100" />
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Receive</span>
                        <span className="text-2xl font-black text-indigo-600 tracking-tighter italic">₹{(parseInt(withdrawAmount) || 0) - Math.floor((parseInt(withdrawAmount) || 0) * commission)}</span>
                     </div>
                  </div>

                  <button
                     disabled={loading || !withdrawAmount || parseInt(withdrawAmount) < minWithdrawalAmount}
                     onClick={handleWithdrawRequest}
                     className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[14px] uppercase tracking-[0.2em] shadow-2xl disabled:opacity-30"
                  >
                     {loading ? 'Processing...' : 'Request Cashout 🚀'}
                  </button>
               </div>
            </div>
         )}

      </div>
   );
}

function EmptyState({ icon, text }: any) {
   return (
      <div className="p-16 text-center rounded-[3rem] border border-slate-50 bg-slate-50/50 space-y-4">
         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mx-auto shadow-inner">
            {cloneElement(icon, { size: 32 })}
         </div>
         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{text}</p>
      </div>
   );
}
