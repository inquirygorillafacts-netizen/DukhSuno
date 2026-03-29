'use client';

import { useState, useEffect, ReactElement, cloneElement } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpRight, 
  IndianRupee,
  Eye,
  X,
  AlertCircle,
  CreditCard,
  TrendingUp,
  ArrowDownCircle,
  Briefcase,
  Layers,
  Calculator
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminWalletRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'rejected'>('pending');
  const [commission, setCommission] = useState(10); // Default to 10% as per user request
  const [stats, setStats] = useState({
     totalGross: 0,
     payuFees: 0,
     netProfit: 0,
     outstanding: 0
  });

  useEffect(() => {
    // 1. Fetch Commission & Global Stats from settings/platform
    const unsubConfig = onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
      if (snap.exists()) {
         const data = snap.data();
         // Use defaultCommissionRate (fraction) and convert to percentage for UI
         setCommission(Math.round((data.defaultCommissionRate || 0.10) * 100));
         setStats({
            totalGross: data.totalGrossEarned || 0,
            payuFees: (data.totalGrossEarned || 0) * 0.02,
            netProfit: data.totalProfit || 0,
            outstanding: data.totalOutstanding || 0
         });
      }
    });

    const q = query(
      collection(db, 'withdrawals'),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
       unsubConfig();
       unsubscribe();
    }
  }, [statusFilter]);

  const handleAction = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    if (!requestId) return;
    setLoading(true);

    try {
      await runTransaction(db, async (transaction) => {
        const reqRef = doc(db, 'withdrawals', requestId);
        const reqDoc = await transaction.get(reqRef);
        const configRef = doc(db, 'settings', 'platform');
        
        if (!reqDoc.exists()) throw "Request not found!";
        const reqData = reqDoc.data();
        if (reqData.status !== 'pending') throw "Request already processed!";

        const transactionIds = reqData.transactionIds || [];

        if (action === 'approve') {
          // 1. Mark Request Completed
          transaction.update(reqRef, {
            status: 'completed',
            processedAt: serverTimestamp()
          });

          // 2. Mark individual earnings as 'withdrawn'
          transactionIds.forEach((txId: string) => {
            transaction.update(doc(db, 'transactions', txId), {
              status: 'withdrawn'
            });
          });

          // 3. Update 'withdrawal' log record
          // Search for the log record by withdrawalRequestId
          // Actually, since we don't have the ID, we'll let it stay as 'completed' via the next step or similar
          // For now, let's keep it simple and just mark the earnings.
          
          // 4. Update global outstanding balance
          const configDoc = await transaction.get(configRef);
          if(configDoc.exists()) {
             const currentOut = configDoc.data().totalOutstanding || 0;
             const currentTotalPaid = configDoc.data().totalPaidOut || 0;
             transaction.update(configRef, {
                totalOutstanding: Math.max(0, currentOut - reqData.netAmount),
                totalPaidOut: currentTotalPaid + reqData.netAmount
             });
          }
        } else {
          // 1. Mark Request Rejected
          transaction.update(reqRef, {
            status: 'rejected',
            rejectionReason: reason || 'Kripya QR check karein ya Admin se baat karein.',
            processedAt: serverTimestamp()
          });

          // 2. Revert individual earnings to 'pending'
          transactionIds.forEach((txId: string) => {
            transaction.update(doc(db, 'transactions', txId), {
              status: 'pending',
              withdrawalRequestId: null
            });
          });

          // 3. Refund Balance to User
          const userRef = doc(db, 'users', reqData.userId);
          const userDoc = await transaction.get(userRef);
          if (userDoc.exists()) {
            const currentBalance = userDoc.data().availableBalance || 0;
            transaction.update(userRef, {
              availableBalance: currentBalance + reqData.netAmount
            });
          }

          // 4. Create Rejection Log Transaction
          const refundTransRef = doc(collection(db, 'transactions'));
          transaction.set(refundTransRef, {
            userId: reqData.userId,
            amount: reqData.netAmount,
            type: 'earning',
            status: 'completed',
            isRefund: true,
            description: `Withdrawal Rejected: ${reason || 'N/A'}`,
            createdAt: serverTimestamp()
          });
        }
      });

      setSelectedReq(null);
    } catch (err) {
      console.error('Wallet action failed:', err);
      alert('Action failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Stats Cards */}
      <div className="space-y-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase italic leading-none">
                  Revenue Control 💎
               </h1>
               <p className="text-[12px] text-slate-400 font-medium uppercase tracking-widest px-1">
                  Platform financials and payout management.
               </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl">
               {(['pending', 'completed', 'rejected'] as const).map((s) => (
                  <button 
                     key={s}
                     onClick={() => setStatusFilter(s)}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white shadow-sm text-emerald-500 font-bold' : 'text-slate-400'}`}
                  >
                     {s}
                  </button>
               ))}
            </div>
         </div>

         {/* 4 Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
               label="Total Revenue" 
               value={`₹${stats.totalGross.toLocaleString()}`} 
               icon={<TrendingUp />} 
               color="bg-slate-900" 
               textColor="text-slate-400"
               sub="Pesa aya hai ✨"
               glow="bg-indigo-500"
            />
            <StatCard 
               label="PayU Fees (2%)" 
               value={`₹${stats.payuFees.toLocaleString()}`} 
               icon={<CreditCard />} 
               color="bg-white border-slate-100" 
               textColor="text-rose-400"
               sub="Karch ho gaya 💸"
               glow="bg-rose-400"
            />
            <StatCard 
               label="Net Profit" 
               value={`₹${stats.netProfit.toLocaleString()}`} 
               icon={<Briefcase />} 
               color="bg-white border-slate-100" 
               textColor="text-emerald-500"
               sub="Hamari kamai 💎"
               glow="bg-emerald-500"
            />
            <StatCard 
               label="Total Liabilities" 
               value={`₹${stats.outstanding.toLocaleString()}`} 
               icon={<Layers />} 
               color="bg-white border-slate-100" 
               textColor="text-indigo-500"
               sub="Dena baki hai 🕰️"
               glow="bg-indigo-500"
            />
         </div>

         {/* Commission Slider (Premium Tool) */}
         <div className="p-8 md:p-12 bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="max-w-md space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                     <Calculator size={24} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter italic">Platform Fee Logic</h3>
               </div>
               <p className="text-sm text-slate-400 font-medium italic">
                  Set your global platform commission rate here. Your net profit is calculated after deducting the 2% PayU transaction fee.
               </p>
            </div>

            <div className="flex-1 max-w-xl w-full space-y-6">
               <div className="flex justify-between items-end mb-2">
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black tracking-tighter text-emerald-500 italic">{commission}%</span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pb-2">Commission Mode</span>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 italic font-bold text-xs text-slate-500">
                     Profit: {commission - 2}% (Approx)
                  </div>
               </div>
               
               <div className="relative pt-4">
                  <input 
                     type="range" 
                     min="2" 
                     max="30" 
                     value={commission} 
                     onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCommission(val);
                        updateDoc(doc(db, 'settings', 'platform'), { defaultCommissionRate: val / 100 });
                     }}
                     className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900 border border-white"
                  />
                  <div className="flex justify-between mt-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                     <span>2% Min</span>
                     <span>Set Profit Margin</span>
                     <span>30% Max</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Requests Table/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {requests.length > 0 ? (
            requests.map((req) => (
               <div key={req.id} className="glass bg-white rounded-[2.5rem] border border-slate-50 p-6 space-y-6 hover:shadow-2xl hover:shadow-slate-100 transition-all group overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 ${req.status === 'pending' ? 'bg-amber-500' : req.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  
                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                           <IndianRupee size={24} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{req.userName}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">UID: {req.userId.slice(-6)}</p>
                        </div>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                        req.status === 'completed' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                        'bg-rose-50 text-rose-500 border border-rose-100'
                     }`}>
                        {req.status}
                     </span>
                  </div>

                  <div className="space-y-1">
                     <p className="text-[40px] font-black tracking-tighter text-slate-900 leading-none">₹{req.amount}</p>
                     <p className="text-[10px] text-slate-400 font-medium italic">{(req.createdAt as any)?.toDate?.().toLocaleString() || 'Recent'}</p>
                  </div>

                  {req.status === 'pending' && (
                     <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Payout: ₹{req.amount - Math.floor(req.amount * (commission/100))}</p>
                     </div>
                  )}

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                     <button 
                        onClick={() => setSelectedReq(req)}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center gap-2"
                     >
                        <Eye size={14} />
                        Details
                     </button>
                     {req.status === 'pending' && (
                        <div className="flex gap-2">
                           <button 
                              onClick={() => {
                                 const reason = prompt('Reject karne ka karan batayein (Reason):');
                                 if (reason) handleAction(req.id, 'reject', reason);
                              }} 
                              className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                           >
                              <X size={18} />
                           </button>
                           <button onClick={() => handleAction(req.id, 'approve')} className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">
                              <ArrowUpRight size={18} />
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            ))
         ) : (
            <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
               <Clock size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">No {statusFilter} requests found.</p>
            </div>
         )}
      </div>

      {/* Detail Modal */}
      {selectedReq && (
         <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-[500px] bg-white rounded-[3rem] p-8 md:p-12 space-y-10 shadow-2xl animate-in zoom-in-95 duration-500 relative">
               <button onClick={() => setSelectedReq(null)} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <X size={24} />
               </button>

               <div className="space-y-8">
                  <div className="text-center space-y-2">
                     <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] leading-none mb-2">Payout Breakdown</p>
                     
                     <div className="flex flex-col items-center gap-1">
                        <h2 className="text-[40px] font-black text-slate-900 tracking-tighter italic leading-none">₹{selectedReq.amount - Math.floor(selectedReq.amount * (commission/100))}</h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Payable to Provider</p>
                     </div>

                     <div className="flex items-center justify-center gap-6 pt-4">
                        <div className="text-center">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Requested</p>
                           <p className="text-sm font-black text-slate-700 italic">₹{selectedReq.amount}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-center">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Platform Fee ({commission}%)</p>
                           <p className="text-sm font-black text-rose-400 italic">₹{Math.floor(selectedReq.amount * (commission/100))}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">User Payment QR</p>
                     <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner group">
                        <img src={selectedReq.qrUrl} className="w-full aspect-square object-cover" alt="User QR" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                           <a href={selectedReq.qrUrl} target="_blank" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Open Original</a>
                        </div>
                     </div>
                  </div>

                  {selectedReq.status === 'pending' && (
                     <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                           onClick={() => handleAction(selectedReq.id, 'reject')}
                           disabled={loading}
                           className="h-18 rounded-[1.8rem] border-2 border-rose-50 text-rose-500 font-black text-[12px] uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                        >
                           Reject Request
                        </button>
                        <button 
                           onClick={() => {
                             if(confirm('Aapne payment kar di hai? Confirm karne par request "Completed" ho jayegi.')) {
                               handleAction(selectedReq.id, 'approve');
                             }
                           }}
                           disabled={loading}
                           className="h-18 rounded-[1.8rem] bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest shadow-xl active:scale-95 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                        >
                           {loading ? 'Processing...' : 'Approve & Paid ✨'}
                        </button>
                     </div>
                  )}

                  {selectedReq.status !== 'pending' && (
                     <div className={`p-6 rounded-[2rem] border flex items-center gap-4 ${selectedReq.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                        {selectedReq.status === 'completed' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                        <div>
                           <p className="text-[11px] font-black uppercase tracking-widest">Request {selectedReq.status}</p>
                           <p className="text-[10px] opacity-70 font-medium">Processed on {(selectedReq.processedAt as any)?.toDate?.().toLocaleString() || 'Recent'}</p>
                           {selectedReq.status === 'completed' && (
                              <p className="text-[9px] font-black uppercase mt-1 tracking-tighter">Amount Paid: ₹{selectedReq.amount - Math.floor(selectedReq.amount * (commission/100))}</p>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, textColor, sub, glow }: any) {
   return (
      <div className={`p-8 rounded-[2.5rem] ${color} relative overflow-hidden transition-all hover:scale-[1.02] group shadow-sm`}>
         <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${glow} rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-all`} />
         <div className="flex flex-col gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.includes('slate-900') ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 opacity-50'}`}>
               {cloneElement(icon as ReactElement, { size: 24 } as any)}
            </div>
            <div>
               <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${color.includes('slate-900') ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
               <h3 className={`text-3xl font-black tracking-tighter italic ${textColor || (color.includes('slate-900') ? 'text-white' : 'text-slate-900')}`}>
                  {value}
               </h3>
               <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60 italic">{sub}</p>
            </div>
         </div>
      </div>
   );
}
