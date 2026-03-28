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
    User,
    QrCode
} from 'lucide-react';

const stats = [
    { name: "Total Revenue", value: "₹1,24,500", icon: IndianRupee, change: "+14%", trend: "up", color: "indigo" },
    { name: "Pending Withdrawals", value: "₹12,400", icon: Clock, change: "8 requests", trend: "neutral", color: "amber" },
    { name: "Total Paid Out", value: "₹86,200", icon: CheckCircle2, change: "+5%", trend: "up", color: "emerald" },
];

export default function AdminPaymentsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
    const [stats, setStats] = useState([
        { name: "Total Revenue", value: "₹0", icon: IndianRupee, change: "Live", trend: "up", color: "indigo" },
        { name: "Pending Withdrawals", value: "₹0", icon: Clock, change: "0 requests", trend: "neutral", color: "amber" },
        { name: "Total Paid Out", value: "₹0", icon: CheckCircle2, change: "Verified", trend: "up", color: "emerald" },
    ]);

    useEffect(() => {
        // 1. Listen to Real-time Stats from Sessions
        const qSessions = query(collection(db, 'sessions'));
        const unsubscribeStats = onSnapshot(qSessions, (snapshot) => {
            let totalRevenue = 0;
            snapshot.docs.forEach(doc => {
                totalRevenue += (doc.data().planPrice || 0);
            });

            // 2. Listen to Real-time Withdrawals for stats
            const qWithdrawals = query(collection(db, 'withdrawals'));
            const unsubscribeWithdrawals = onSnapshot(qWithdrawals, (wSnap) => {
                let pendingAmount = 0;
                let paidAmount = 0;
                let pendingCount = 0;
                const pendingList: any[] = [];

                wSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.status === 'pending') {
                        pendingAmount += (data.netAmount || 0);
                        pendingCount++;
                        pendingList.push({ id: doc.id, ...data });
                    } else if (data.status === 'completed') {
                        paidAmount += (data.netAmount || 0);
                    }
                });

                setPendingWithdrawals(pendingList);
                setStats([
                    { name: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, change: "Total Platform", trend: "up", color: "indigo" },
                    { name: "Pending Withdrawals", value: `₹${pendingAmount.toLocaleString()}`, icon: Clock, change: `${pendingCount} requests`, trend: "neutral", color: "amber" },
                    { name: "Total Paid Out", value: `₹${paidAmount.toLocaleString()}`, icon: CheckCircle2, change: "To Providers", trend: "up", color: "emerald" },
                ]);
            });

            return () => unsubscribeWithdrawals();
        });

        // 3. Recent Transactions List
        const qRecent = query(
            collection(db, 'sessions'), 
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribeTx = onSnapshot(qRecent, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(list);
            setLoading(false);
        });

        return () => {
            unsubscribeStats();
            unsubscribeTx();
        };
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const resp = await fetch('/api/admin/actions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || 'dev-secret-key' 
                },
                body: JSON.stringify({ action: 'mark_paid', id })
            });
            if (resp.ok) {
                alert('Withdrawal approved and processed!');
            } else {
                throw new Error('Failed to approve');
            }
        } catch (err) {
            console.error("Approval failed:", err);
            alert('Error: Approval failed');
        }
    };

    const handleReject = async (id: string, userId: string, netAmount: number) => {
        const reason = prompt('Reason for rejection:');
        if (reason === null) return;

        try {
            const resp = await fetch('/api/admin/actions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || 'dev-secret-key' 
                },
                body: JSON.stringify({ action: 'reject_withdrawal', id, metadata: { reason } })
            });
            if (resp.ok) {
                alert('Withdrawal rejected.');
            } else {
                throw new Error('Failed to reject');
            }
        } catch (err) {
            console.error("Rejection failed:", err);
            alert('Error: Rejection failed');
        }
    };

    if (loading) return <div className="p-10 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Financials Loading...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-gradient uppercase italic">BigSuno Finance</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight italic">Monitor platform earnings and provider payouts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95">
                        <Download size={14} />
                        Export Ledger
                    </button>
                    <div className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                        <CreditCard size={14} />
                        Live Ledger
                    </div>
                </div>
            </div>

            {/* NEW: Pending Withdrawals Queue */}
            {pendingWithdrawals.length > 0 && (
                <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></div>
                                <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-widest leading-none">Withdrawals Pending</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Queue</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingWithdrawals.map((p) => (
                                <div key={p.id} className="p-5 rounded-[2rem] bg-slate-950/50 border border-slate-800 flex items-center justify-between group/payout">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-rose-400 group-hover/payout:text-white transition-colors border border-slate-800">
                                            <a href={p.qrUrl} target="_blank" rel="noopener noreferrer">
                                                <QrCode size={18} />
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white tracking-tight">{p.userName || 'Unknown'}</p>
                                            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Pay: ₹{p.netAmount || 0} <span className="text-slate-500 ml-1">Fee: ₹{p.platformFee || 0}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleReject(p.id, p.userId, p.netAmount)}
                                            className="p-2 text-slate-600 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(p.id)}
                                            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-400 active:scale-95 transition-all shadow-lg shadow-rose-500/20"
                                        >
                                            Mark Paid
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
                                        <p className="text-[11px] font-bold text-slate-400 tracking-widest">₹{tx.planPrice - (tx.listenerEarned || tx.planPrice * 0.98)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest border ${
                                            tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            tx.status === 'missed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}>
                                            {tx.status || 'Ongoing'}
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
