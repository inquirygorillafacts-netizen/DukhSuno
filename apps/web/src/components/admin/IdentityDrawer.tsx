'use client';

import React from "react";
import { 
    X, 
    User, 
    ShieldCheck, 
    Calendar, 
    MapPin, 
    Phone, 
    Wallet, 
    Star, 
    History,
    MoreHorizontal,
    Ban,
    CheckCircle,
    Mail
} from "lucide-react";

interface IdentityDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function IdentityDrawer({ isOpen, onClose, user }: IdentityDrawerProps) {
    if (!user) return null;

    // Financial data fallbacks
    const balance = user.balance !== undefined ? user.balance : "2,450";
    const sessions = user.recentSessions || [];

    return (
        <div className={`fixed inset-0 z-[1000] transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Content Drawer */}
            <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[500px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm text-xl font-black">
                            {user.avatarUrl?.startsWith('avatar:') ? user.avatarUrl.split(':')[1] : (user.displayName?.charAt(0) || 'U')}
                        </div>
                        <div>
                             <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{user.displayName || "Unknown User"}</h2>
                             <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ID: {user.uid?.slice(0, 12)}...</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                    {/* User Profile Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <DetailCard icon={<Mail size={16} />} label="Email" value={user.email || "N/A"} />
                        <DetailCard icon={<Phone size={16} />} label="Number" value={user.phoneNumber || "No Phone"} />
                        <StatusChip status={user.isBlocked ? 'Blocked' : 'Active'} />
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                             <div className="p-2 bg-white rounded-xl shadow-sm"><Star size={16} className="text-amber-500" /></div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Rating</p>
                                <p className="text-sm font-bold text-slate-900">{user.rating || "N/A"}</p>
                             </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Activity</h3>
                        <div className="p-6 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group">
                             <Wallet className="absolute -right-4 -top-4 text-white/5 group-hover:rotate-12 transition-transform duration-700" size={120} />
                             <div className="relative z-10">
                                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Available Balance</p>
                                 <p className="text-3xl font-black tracking-tighter mb-4">₹{balance}</p>
                                 <div className="flex gap-2">
                                     <div className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest pointer-events-none">Withdrawal: {user.canWithdraw ? 'Enabled' : 'Restricted'}</div>
                                     {user.isVIP && <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">VIP Member</div>}
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Call History Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Sessions</h3>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">View All</button>
                        </div>
                        <div className="space-y-3">
                            {sessions.length > 0 ? (
                                sessions.map((s: any, i: number) => (
                                    <SessionRow 
                                        key={i} 
                                        name={s.otherPartyName || "User"} 
                                        time={s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : "Recent"} 
                                        duration={`${Math.floor((s.duration || 0) / 60)}m`} 
                                        earning={`₹${s.amount || 0}`} 
                                    />
                                ))
                            ) : (
                                <p className="text-[10px] text-slate-400 font-bold uppercase py-4 text-center border-2 border-dashed border-slate-100 rounded-3xl">No recent sessions found</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Emergency Controls</h3>
                         <div className="flex gap-3">
                             <button className="flex-1 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                                <Ban size={14} /> {user.isBlocked ? 'Unblock Account' : 'Suspend Account'}
                             </button>
                             <button className="flex-1 py-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-all active:scale-95">
                                <ShieldCheck size={14} /> Reset 2FA
                             </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">{icon}</div>
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate max-w-[120px]">{value}</p>
            </div>
        </div>
    );
}

function StatusChip({ status }: { status: string }) {
    return (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-500"><CheckCircle size={16} /></div>
            <div>
                <p className="text-[10px] font-black uppercase text-emerald-600/60 tracking-tighter leading-none mb-1">Status</p>
                <p className="text-sm font-black text-emerald-600 tracking-tight leading-none uppercase">{status}</p>
            </div>
        </div>
    );
}

function SessionRow({ name, time, duration, earning }: any) {
    return (
        <div className="p-4 rounded-2xl bg-white border border-slate-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {name.charAt(0)}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-800">{name}</p>
                    <p className="text-[9px] text-slate-400 font-medium">{time}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-900 tracking-tighter">{earning}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase">{duration}</p>
            </div>
        </div>
    );
}
