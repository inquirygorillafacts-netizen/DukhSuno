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
    User
} from 'lucide-react';

const logs = [
    { id: 1, event: "Listener Approved", user: "Admin", target: "Sneha Reddy", time: "2 mins ago", type: "success" },
    { id: 2, event: "Twilio Rotation", user: "System", target: "Main_SID", time: "15 mins ago", type: "info" },
    { id: 3, event: "Plan Created", user: "Admin", target: "Premium_Plus", time: "1 hour ago", type: "info" },
    { id: 4, event: "Security Alert", user: "Shield", target: "Invalid Sign-in (IP: 192.168...)", time: "3 hours ago", type: "warning" },
    { id: 5, event: "Payment Sync", user: "Firebase", target: "TID_819202", time: "5 hours ago", type: "success" },
];

export default function OwnerLogsPage() {
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

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <ClipboardList size={18} />
                         </div>
                         <h2 className="text-xl font-bold text-slate-900">System Lifecycle</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Filter events..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 lg:w-64"
                        />
                    </div>
                </div>

                <div className="flex flex-col divide-y divide-slate-50">
                    {logs.map((log) => (
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
                    ))}
                </div>

                <div className="p-8 bg-slate-50/50 flex justify-center">
                     <button className="px-10 py-3 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all shadow-sm">
                        Load Complete History
                     </button>
                </div>
            </div>
        </div>
    );
}
