'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Wallet, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import WalletModals from '@/components/wallet/WalletModals';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [modalType, setModalType] = useState<'add_money' | 'hybrid_pay' | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payoutRequest, setPayoutRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Listen to User Balance
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBalance(parseFloat(data.availableBalance || data.balance || 0));
        setLifetimeEarnings(parseFloat(data.lifetimeEarnings || 0));
      }
    });

    // 2. Listen to Transactions
    const qTx = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubTx = onSnapshot(qTx, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Check for Pending Payout Request
    const qPayout = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid),
      where('status', '==', 'pending'),
      limit(1)
    );
    const unsubPayout = onSnapshot(qPayout, (snap) => {
      if (!snap.empty) {
        setPayoutRequest({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setPayoutRequest(null);
      }
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubPayout();
    };
  }, [user?.uid]);

  const handleWithdrawAll = async () => {
    if (!user?.uid || balance < 50) return alert('Minimum withdrawal is ₹50');
    if (confirm(`Aap ₹${balance} withdraw karna chahte hain?`)) {
      setLoading(true);
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await transaction.get(userRef);
          
          if (!userSnap.exists()) throw "User not found";
          const currentBalance = parseFloat(userSnap.data().availableBalance || userSnap.data().balance || 0);
          
          if (currentBalance < 50) throw "Minimum ₹50 required";

          // 1. Create Withdrawal Request
          const withdrawalRef = doc(collection(db, 'withdrawals'));
          transaction.set(withdrawalRef, {
            userId: user.uid,
            userName: userSnap.data().displayName || 'Anonymous',
            amount: currentBalance,
            status: 'pending',
            qrUrl: userSnap.data().payoutQR || '', // User must have a QR uploaded
            createdAt: serverTimestamp()
          });

          // 2. Deduct Balance
          transaction.update(userRef, {
            availableBalance: 0,
            balance: 0
          });

          // 3. Log Transaction
          const txRef = doc(collection(db, 'transactions'));
          transaction.set(txRef, {
            userId: user.uid,
            amount: -currentBalance,
            type: 'withdrawal',
            status: 'pending',
            description: 'Withdrawal Requested',
            createdAt: serverTimestamp()
          });
        });
        alert('Kamyabi! Aapki request bhej di gayi hai. Admin jald hi process karenge.');
      } catch (err) {
        console.error(err);
        alert('Request fail ho gayi: ' + err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="max-w-xl mx-auto px-4 pt-8 space-y-10 animate-in fade-in duration-500">
        <WalletModals 
          isOpen={!!modalType} 
          onClose={() => setModalType(null)} 
          type={modalType || 'add_money'} 
        />

        {/* 1. Header (Admin Style) */}
        <div className="flex items-center justify-between mb-2">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Digital Wallet</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manage credits & earnings</p>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-300">
                <Wallet size={20} />
            </div>
        </div>

        {/* 2. Main Balance Card (Admin Premium Card) */}
        <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            <CreditCard size={160} />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <Sparkles className="text-slate-400 w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Current Available Balance</span>
            </div>
            
            <h1 className="text-6xl font-black tracking-tighter text-slate-900">
              ₹{balance.toFixed(2)}
            </h1>
            
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
              Lifetime Analytics: ₹{lifetimeEarnings.toFixed(2)}
            </p>

            <div className="flex gap-3 w-full pt-4">
              <button 
                onClick={() => setModalType('add_money')}
                className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-slate-200"
              >
                <Plus size={18} /> Add Credits
              </button>
              <button 
                onClick={handleWithdrawAll}
                disabled={loading || !!payoutRequest || balance < 50}
                className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-3 ${
                    payoutRequest 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : 
                 payoutRequest ? <><Clock size={16} /> Pending</> : 
                 balance < 50 ? `Min ₹50` : 'Withdraw All'}
              </button>
            </div>
          </div>
        </section>

        {/* 3. Detailed Statement (Admin Table Style) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <Clock size={12} /> Transaction Log
            </h3>
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Real-time update</span>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
            {transactions.length > 0 ? transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border transition-all ${
                    tx.amount > 0 
                    ? 'bg-emerald-50 text-emerald-500 border-emerald-100' 
                    : 'bg-rose-50 text-rose-500 border-rose-100'
                }`}>
                  {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-black tracking-tight truncate text-slate-900 uppercase">
                      {tx.description || tx.type.replace('_', ' ')}
                    </h4>
                    <span className={`text-sm font-black tracking-tighter ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {tx.amount > 0 ? '+' : ''} ₹{Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending...'}
                     </span>
                     <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border ${
                      tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-slate-50 text-slate-400 border-slate-100'
                     }`}>
                      {tx.status}
                     </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-24 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6 border border-slate-100">
                    <Wallet size={32} />
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-relaxed">No transactions found in this cycle</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Start a session to build your balance</p>
              </div>
            )}
          </div>
        </section>

        {/* Audit footer */}
        <p className="text-[9px] font-black text-slate-300 text-center uppercase tracking-[0.4em] pt-4 italic">
            Digital audit verified © BigSuno Finance
        </p>
      </div>
    </div>
  );
}
