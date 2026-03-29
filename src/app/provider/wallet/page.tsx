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
  Minus
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
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Wallet Header */}
      <div className="relative p-8 md:p-12 rounded-[3.5rem] bg-slate-900 text-white overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[150px] opacity-20" />
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-slate-600 rounded-full blur-[150px] opacity-10" />
         
         <div className="relative z-10 space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                     <Wallet size={24} className="text-indigo-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Available Balance</p>
                     <p className="text-sm font-bold text-white italic">Withdrawal Ready</p>
                  </div>
               </div>
               <button onClick={() => setShowSetup(true)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 border border-white/5">
                  <Settings size={22} className="text-slate-400" />
               </button>
            </div>

            <div className="space-y-2">
               <h1 className="text-[60px] md:text-[80px] font-black tracking-tighter leading-none italic">
                  ₹{user?.availableBalance?.toLocaleString() || '0'}
               </h1>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                     <Plus size={14} className="text-indigo-400" />
                     <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Today: ₹{(user as any)?.todayEarnings || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                     <Clock size={14} className="text-slate-400" />
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Total: ₹{user?.totalEarnings || 0}</span>
                  </div>
               </div>
            </div>

            <button 
               onClick={() => (user as any)?.paymentQrUrl ? setShowWithdraw(true) : setShowSetup(true)}
               className="w-full h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-[18px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
            >
               Withdraw Funds
               <ArrowUpRight size={24} />
            </button>
         </div>
      </div>

      {/* QR Status Reminder if not set */}
      {!(user as any)?.paymentQrUrl && (
         <div onClick={() => setShowSetup(true)} className="p-8 rounded-[2.5rem] bg-rose-50 border border-rose-100 flex items-center gap-6 cursor-pointer hover:bg-rose-100 transition-all shadow-sm active:scale-[0.99] group">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-lg group-hover:scale-110 transition-transform shrink-0">
               <QrCode size={32} />
            </div>
            <div className="flex-1">
               <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em] leading-none mb-2">Security Action Required</p>
               <p className="text-[18px] font-black text-rose-950 leading-tight">Setup Payment Method</p>
               <p className="text-[12px] text-rose-600 font-medium italic mt-1">Upload your UPI QR code to enable secure withdrawals to your account.</p>
            </div>
            <div className="w-10 h-10 bg-rose-200/30 rounded-full flex items-center justify-center text-rose-500">
               <ChevronRight size={20} />
            </div>
         </div>
      )}

      {/* History Section */}
      <section className="space-y-6">
         <div className="flex p-1 bg-slate-100 rounded-[2rem]">
            <button 
               onClick={() => setActiveTab('transactions')}
               className={`flex-1 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'transactions' ? 'bg-white shadow-xl shadow-slate-200 text-slate-900' : 'text-slate-400'}`}
            >
               Transactions
            </button>
            <button 
               onClick={() => setActiveTab('requests')}
               className={`flex-1 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'requests' ? 'bg-white shadow-xl shadow-slate-200 text-slate-900' : 'text-slate-400'}`}
            >
               Requests
            </button>
         </div>

         <div className="space-y-4">
            {activeTab === 'transactions' ? (
               transactions.length > 0 ? (
                  transactions.map((t) => (
                     <div key={t.id} className="p-5 rounded-[2.5rem] bg-white border border-slate-50 flex items-center justify-between group hover:shadow-xl hover:shadow-slate-100 transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'earning' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                              {t.type === 'earning' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none mb-1">
                                 {t.type === 'earning' ? 'Call Earnings' : 'Withdrawal'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                 {(t.createdAt as any)?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'Recent'}
                              </p>
                           </div>
                        </div>
                        <p className={`text-lg font-black italic tracking-tighter ${t.type === 'earning' ? 'text-emerald-500' : 'text-slate-900'}`}>
                           {t.type === 'earning' ? '+' : '-'}₹{t.amount}
                        </p>
                     </div>
                  ))
               ) : (
                  <EmptyState icon={<History />} text="No transactions yet." />
               )
            ) : (
               requests.length > 0 ? (
                  requests.map((r) => (
                     <div key={r.id} className="p-5 rounded-[2.5rem] bg-white border border-slate-50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              r.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                              r.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                           }`}>
                              {r.status === 'completed' ? <CheckCircle2 size={22} /> : 
                               r.status === 'rejected' ? <XCircle size={22} /> : <Clock size={22} />}
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none mb-1 shadow-rose-200">
                                 Withdraw Request
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                 {r.status.toUpperCase()} — {(r.createdAt as any)?.toDate?.() ? r.createdAt.toDate().toLocaleDateString() : 'Recent'}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-50">
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md">Receive: ₹{r.netAmount || (r.amount - Math.floor(r.amount * (commission)))}</span>
                                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">Fee: ₹{r.platformFee || Math.floor(r.amount * (commission))}</span>
                              </div>
                           </div>
                        </div>
                        <p className="text-lg font-black italic tracking-tighter text-slate-900">₹{r.amount}</p>
                     </div>
                  ))
               ) : (
                  <EmptyState icon={<Wallet />} text="No requests yet." />
               )
            )}
         </div>
      </section>

      {/* Setup QR Overlay */}
      {showSetup && (
         <div className="fixed inset-0 z-[1200] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-xl p-0 md:p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-[500px] bg-white rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-12 space-y-8 animate-in slide-in-from-bottom-10 duration-500 relative">
               <button onClick={() => { setShowSetup(false); setQrPreview(null); setQrFile(null); }} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <X size={24} />
               </button>

               <div className="space-y-2">
                  <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] leading-none mb-2">Withdrawal Settings</p>
                  <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight italic">Payout Method 📸</h2>
                  <p className="text-sm text-slate-400 font-medium italic">Manage your UPI QR code to receive payments from the administration.</p>
               </div>

               <div className="relative group">
                  <input 
                     id="qr-input" 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                           setQrFile(file);
                           setQrPreview(URL.createObjectURL(file));
                        }
                     }} 
                  />
                  
                  {qrPreview || (user as any)?.paymentQrUrl ? (
                     <div className="space-y-6">
                        <div className="relative rounded-[3rem] overflow-hidden border-4 border-slate-100 shadow-2xl aspect-square">
                           <img src={qrPreview || (user as any)?.paymentQrUrl} className="w-full h-full object-cover" alt="QR Preview" />
                           <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button 
                                 onClick={() => document.getElementById('qr-input')?.click()}
                                 className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-110"
                              >
                                 <Upload size={16} /> Change Image
                              </button>
                           </div>
                        </div>
                        
                        {!qrFile && (user as any)?.paymentQrUrl && (
                           <button 
                              onClick={handleDeleteQr}
                              className="w-full py-4 rounded-2xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-rose-200 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
                           >
                              <X size={14} /> Remove Current QR
                           </button>
                        )}
                     </div>
                  ) : (
                     <div 
                        onClick={() => !uploading && document.getElementById('qr-input')?.click()}
                        className="w-full aspect-square rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-4 transition-all hover:bg-indigo-50 hover:border-indigo-100 cursor-pointer"
                     >
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 hover:text-indigo-400 hover:scale-110 shadow-inner transition-all">
                           <ImageIcon size={40} />
                        </div>
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Upload your QR Image</p>
                     </div>
                  )}
               </div>

               {errorMsg && <p className="text-rose-500 text-[11px] font-black text-center uppercase tracking-widest">{errorMsg}</p>}

               {qrFile && (
                  <button 
                     disabled={uploading}
                     onClick={handleQrUpload}
                     className="w-full h-20 bg-indigo-600 text-white rounded-3xl font-black text-[18px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                     {uploading ? 'Processing Image...' : 'Save New QR Details ✨'}
                  </button>
               )}
            </div>
         </div>
      )}

      {/* Withdraw Confirmation Overlay */}
      {showWithdraw && (
         <div className="fixed inset-0 z-[1200] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-xl p-0 md:p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-[500px] bg-white rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-12 space-y-8 animate-in slide-in-from-bottom-10 duration-500 relative">
               <button onClick={() => setShowWithdraw(false)} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <X size={24} />
               </button>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] leading-none mb-2">Request Cashout</p>
                     <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight italic">Withdraw Amount 💸</h2>
                  </div>

                  <div className="relative group">
                     <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[40px] font-black text-slate-300 group-focus-within:text-rose-400 transition-colors">₹</span>
                     <input 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0.00"
                        className="w-full h-28 pl-20 pr-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-[40px] font-black tracking-tighter placeholder:text-slate-200 focus:bg-white focus:border-rose-200 outline-none transition-all shadow-inner focus:shadow-2xl focus:shadow-slate-100"
                     />
                  </div>

                  {/* Calculator Breakdown Visual */}
                  <div className="p-6 md:p-8 rounded-[3rem] bg-indigo-50/50 border border-indigo-100/50 space-y-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" />
                     
                     <div className="flex items-center justify-between px-2 relative z-10">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-50"><IndianRupee size={16} /></div>
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Requested</span>
                        </div>
                        <span className="text-sm font-black text-slate-600">₹{withdrawAmount || '0'}</span>
                     </div>
                     
                     <div className="flex items-center justify-between px-2 relative z-10">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-50"><Minus size={14} /></div>
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Platform Fee ({(commission * 100).toFixed(0)}%)</span>
                        </div>
                        <span className="text-sm font-black text-rose-400">-₹{Math.floor((parseInt(withdrawAmount) || 0) * (commission))}</span>
                     </div>
                     
                     <div className="h-px bg-indigo-100/50 relative z-10" />
                     
                     <div className="flex items-center justify-between px-3 bg-indigo-500 py-5 rounded-[2rem] shadow-xl shadow-indigo-200/50 relative z-10">
                        <div className="flex items-center gap-2">
                           <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white ring-1 ring-white/30"><CheckCircle2 size={18} /></div>
                           <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">Final Payout</span>
                        </div>
                        <div className="text-right">
                           <span className="text-2xl font-black text-white italic tracking-tighter">₹{(parseInt(withdrawAmount) || 0) - Math.floor((parseInt(withdrawAmount) || 0) * (commission))}</span>
                           <p className="text-[8px] text-white/60 font-black uppercase tracking-widest leading-none">Net Amount</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                        <img src={(user as any)?.paymentQrUrl} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Withdrawal Account</p>
                        <p className="text-sm font-black text-slate-800 tracking-tight italic">Saved Payment QR</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                     <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-rose-600 font-bold uppercase tracking-tight leading-relaxed">Confirm karne par ₹{withdrawAmount || '0'} aapke wallet se turant kat jayenge. Admin ise 24-48 ghanto me approve karega.</p>
                  </div>
               </div>

               {errorMsg && <p className="text-rose-500 text-[11px] font-black text-center uppercase tracking-widest">{errorMsg}</p>}

               <button 
                  disabled={loading || !withdrawAmount}
                  onClick={handleWithdrawRequest}
                  className="w-full h-20 bg-rose-500 text-white rounded-3xl font-black text-[18px] uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
               >
                  {loading ? 'Processing...' : 'Send Request 🚀'}
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
         <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto shadow-inner">
            {cloneElement(icon, { size: 40 })}
         </div>
         <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest italic">{text}</p>
      </div>
   );
}
