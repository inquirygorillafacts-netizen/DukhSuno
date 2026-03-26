'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    IndianRupee, 
    ArrowUpRight, 
    ArrowDownRight, 
    CreditCard, 
    Calendar, 
    Download, 
    Filter, 
    X,
    Search,
    CheckCircle2,
    Clock,
    User
} from 'lucide-react';

const stats = [
    { name: "Total Revenue", value: "₹1,24,500", icon: IndianRupee, change: "+14%", trend: "up", color: "indigo" },
    { name: "Pending Withdrawals", value: "₹12,400", icon: Clock, change: "8 requests", trend: "neutral", color: "amber" },
    { name: "Total Paid Out", value: "₹86,200", icon: CheckCircle2, change: "+5%", trend: "up", color: "emerald" },
];

export default function AdminPaymentsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch real pending payouts
        const pendingQ = query(collection(db, 'payouts'), where('status', '==', 'pending'));
        const unsubscribePending = onSnapshot(pendingQ, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingPayouts(list);
        });

        const q = query(
            collection(db, 'sessions'), 
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribeTx = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(list);
            setLoading(false);
        });

        return () => {
            unsubscribePending();
            unsubscribeTx();
        };
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await updateDoc(doc(db, 'payouts', id), {
                status: 'completed',
                processedAt: new Date(),
                updatedAt: new Date()
            });
            alert('Payout approved and processed!');
        } catch (err) {
            console.error("Payout approval failed:", err);
        }
    };

    const handleReject = async (id: string) => {
        if(confirm('Are you sure you want to reject this payout?')) {
            try {
                await updateDoc(doc(db, 'payouts', id), {
                    status: 'rejected',
                    updatedAt: new Date()
                });
            } catch (err) {
                console.error("Payout rejection failed:", err);
            }
        }
    };

    if (loading) return <div className="p-10 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Financials Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-gradient">Payments & Revenue</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Monitor platform earnings and listener payouts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95">
                        <Download size={14} />
                        Export Ledger
                    </button>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 active:scale-95">
                        <CreditCard size={14} />
                        Payout Hub
                    </button>
                </div>
            </div>

            {/* NEW: Pending Payouts Queue */}
            {pendingPayouts.length > 0 && (
                <div className="bg-indigo-900 p-8 rounded-[40px] border border-indigo-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                                <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Approvals Needed</h3>
                            </div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Pending: ₹{pendingPayouts.reduce((a, b) => a + b.amount, 0)}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingPayouts.map((p) => (
                                <div key={p.id} className="p-5 rounded-[2rem] bg-indigo-950/50 border border-indigo-800 flex items-center justify-between group/payout">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center text-indigo-400 group-hover/payout:text-white transition-colors border border-indigo-800">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white tracking-tight">{p.userName || p.user || 'Unknown'}</p>
                                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">₹{p.amount || 0} • {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Recent'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleReject(p.id)}
                                            className="p-2 text-indigo-600 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(p.id)}
                                            className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 ${
                            stat.color === 'indigo' ? 'bg-indigo-600' :
                            stat.color === 'amber' ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}></div>
                        
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-3 rounded-2xl ${
                                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                            }`}>
                                {stat.change}
                            </span>
                        </div>
                        
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.name}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Txn ID or User..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 w-40"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction / Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Fee</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 uppercase tracking-tighter">REF-{tx.id.slice(-6).toUpperCase()}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-900 italic">₹{tx.amount || 0}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-bold text-slate-400 tracking-widest">₹{((tx.amount || 0) * 0.2).toFixed(2)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                                            Success
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest text-[11px]">No transaction records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
