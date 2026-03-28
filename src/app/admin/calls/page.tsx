'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    PhoneCall, 
    Clock, 
    User, 
    BarChart3, 
    Activity, 
    History, 
    CheckCircle2, 
    MinusCircle,
    ArrowUpRight,
    Search
} from 'lucide-react';

export default function OwnerCallsPage() {
    const [calls, setCalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'sessions'),
            where('status', 'in', ['completed', 'active']),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCalls(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const activeCalls = calls.filter(c => c.status === 'active');
    const totalDuration = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

    if (loading) return <div className="p-10 font-bold animate-pulse text-xs tracking-[0.3em] uppercase">Dialing into analytics...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Call Analytics</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Real-time monitoring and historical call data.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <Activity size={14} className="text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-emerald-700">{activeCalls.length} Calls Live Now</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <HighlightCard label="Total Calls" value={calls.length} icon={<PhoneCall />} color="indigo" />
                <HighlightCard label="Total Minutes" value={Math.floor(totalDuration / 60)} icon={<Clock />} color="emerald" />
                <HighlightCard label="Active Sessions" value={activeCalls.length} icon={<Activity />} color="rose" />
                <HighlightCard label="Avg Duration" value={calls.length ? `${Math.floor((totalDuration / calls.length) / 60)}m` : '0m'} icon={<BarChart3 />} color="amber" />
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History size={18} className="text-slate-400" />
                        <h2 className="text-xl font-bold text-slate-900">Call History Logs</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Session ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider / Seeker</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {calls.map((call) => (
                                <tr key={call.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-black text-slate-900 tracking-widest">#{call.id.slice(-6).toUpperCase()}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                             {call.createdAt?.toDate ? call.createdAt.toDate().toLocaleTimeString() : 'Recently'}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-100 shadow-sm">
                                                <User size={14} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-600 truncate max-w-[120px]">
                                                {call.listenerId?.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-slate-500 text-xs">
                                        {Math.floor((call.durationSeconds || 0) / 60)}m {(call.durationSeconds || 0) % 60}s
                                    </td>
                                    <td className="px-8 py-6">
                                        {call.status === 'completed' ? (
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded-lg uppercase tracking-widest border border-primary/10 animate-pulse">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-black text-slate-900 italic">₹{call.amount || 0}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function HighlightCard({ label, value, icon, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600'
    };
    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all cursor-default">
            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner ${colors[color]}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
            </div>
        </div>
    );
}
