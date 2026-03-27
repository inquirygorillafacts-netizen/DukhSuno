'use client';

import { 
    ClipboardList, 
    Search, 
    Filter, 
    Download, 
    AlertCircle, 
    Info, 
    ShieldCheck, 
    Clock,
    User,
    Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function OwnerLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'audit_logs'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: formatTime(doc.data().timestamp)
            }));
            setLogs(fetchedLogs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatTime = (ts: any) => {
        if (!ts) return 'Just now';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activity Logs</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Audit trail of all administrative and system actions.</p>
                </div>
                <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                    <Download size={14} />
                    Export Audit Trail
                </button>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <ClipboardList size={18} />
                         </div>
                         <h2 className="text-xl font-bold text-slate-900">System Lifecycle</h2>
                    </div>
                </div>

                <div className="flex flex-col divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Loader2 className="animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-widest">Loading Logs...</p>
                        </div>
                    ) : logs.length > 0 ? (
                        logs.map((log) => (
                            <div key={log.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center border transition-all group-hover:rotate-12 ${
                                        log.type === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                        log.type === 'warning' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'
                                    }`}>
                                        {log.type === 'success' ? <ShieldCheck size={20} /> : log.type === 'warning' ? <AlertCircle size={20} /> : <Info size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-0.5">
                                            <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tighter">{log.event}</h4>
                                            <span className="text-[9px] font-bold text-slate-400">•</span>
                                            <span className="text-[10px] font-black text-primary uppercase">{log.user}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium tracking-tight">Action performed on: <b className="text-slate-800">{log.target}</b></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock size={12} strokeWidth={2.5} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{log.time}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center text-slate-400 italic text-sm">
                            No logs found in the audit trail.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
