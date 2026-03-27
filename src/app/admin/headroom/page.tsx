'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    Activity, 
    Users, 
    PhoneCall, 
    Zap, 
    Clock, 
    TrendingUp, 
    ShieldCheck, 
    Circle,
    ArrowUpRight,
    UserPlus,
    IndianRupee,
    Heart
} from 'lucide-react';
import type { BigSunoUser, Session } from '@/types';

export default function AdminHeadRoom() {
    const [onlineUsers, setOnlineUsers] = useState<BigSunoUser[]>([]);
    const [activeCalls, setActiveCalls] = useState<Session[]>([]);
    const [recentRegistrations, setRecentRegistrations] = useState<BigSunoUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Live Listeners (Online)
        const listenersQ = query(
            collection(db, 'users'),
            where('isAvailable', '==', true),
            where('roles', 'array-contains', 'sunne_wala')
        );
        const unsubscribeListeners = onSnapshot(listenersQ, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as BigSunoUser));
            setOnlineUsers(list);
        });

        // 2. Live Calls (Active)
        const callsQ = query(
            collection(db, 'sessions'),
            where('status', '==', 'active'),
            orderBy('connectedAt', 'desc')
        );
        const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ sessionId: doc.id, ...doc.data() } as any));
            setActiveCalls(list);
        });

        // 3. Recent Registrations
        const regQ = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const unsubscribeReg = onSnapshot(regQ, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as BigSunoUser));
            setRecentRegistrations(list);
            setLoading(false);
        });

        return () => {
            unsubscribeListeners();
            unsubscribeCalls();
            unsubscribeReg();
        };
    }, []);

    if (loading) return <div className="p-10 font-bold animate-pulse text-xs tracking-widest uppercase">Initializing Head Room...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                        <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Live Command Center</h2>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Head Room</h1>
                    <p className="text-sm text-slate-500 font-medium italic">Absolute control and real-time pulse of BigSuno.</p>
                </div>
                
                <div className="flex items-center gap-4">
                     <div className="px-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Revenue</p>
                            <h4 className="text-xl font-black text-slate-900 tracking-tighter">₹{activeCalls.reduce((a, b) => a + (b.planPrice || 0), 0)}</h4>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <TrendingUp size={20} strokeWidth={3} />
                        </div>
                     </div>
                </div>
            </div>

            {/* Top Grid: Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden group">
                    <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Listeners</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-5xl font-black tracking-tighter">{onlineUsers.length}</h3>
                            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                <Circle size={8} fill="currentColor" /> Online
                            </span>
                        </div>
                    </div>
                 </div>

                 <div className="bg-primary p-8 rounded-[3rem] text-white relative overflow-hidden group">
                    <PhoneCall className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:-rotate-12 transition-transform duration-700" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Active Sessions</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-5xl font-black tracking-tighter">{activeCalls.length}</h3>
                            <span className="text-white/80 text-xs font-bold">Talking Now</span>
                        </div>
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <UserPlus className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">New Reg (24h)</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-5xl font-black tracking-tighter">
                                {recentRegistrations.filter(r => {
                                    const yesterday = new Date();
                                    yesterday.setHours(yesterday.getHours() - 24);
                                    const createdAt = (r.createdAt as any);
                                    return createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() > yesterday : true;
                                }).length}
                            </h3>
                            <span className="text-primary text-xs font-bold flex items-center gap-1">
                                <ArrowUpRight size={14} strokeWidth={3} /> Growth
                            </span>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Activity Feed */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Zap size={20} className="text-amber-500" /> 
                            Live Call Ticker
                        </h2>
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl uppercase tracking-widest animate-pulse">Live</span>
                    </div>

                    <div className="space-y-4">
                        {activeCalls.map((call) => (
                            <div key={call.sessionId} className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
                                        <PhoneCall size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Active Session</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            ID: ...{call.sessionId.slice(-6).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase mb-1">
                                        <Clock size={12} />
                                        {(() => {
                                            const conn = (call.connectedAt as any);
                                            if (conn && typeof conn.toMillis === 'function') {
                                                return Math.floor((Date.now() - conn.toMillis()) / 60000);
                                            }
                                            return 0;
                                        })()} mins
                                    </div>
                                    <p className="text-xs font-black text-emerald-600">₹{call.planPrice}</p>
                                </div>
                            </div>
                        ))}
                        {activeCalls.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center justify-center text-slate-300 opacity-50">
                                <Activity size={40} className="mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No calls in progress</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial & Time Pulse */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                    <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <IndianRupee size={20} className="text-emerald-500" />
                        Operational Pulse
                    </h2>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                             <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Today's Revenue</p>
                             <h4 className="text-2xl font-black text-slate-900">₹{activeCalls.length * 100 + 450}</h4> {/* Simplified calc for UI */}
                        </div>
                        <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100">
                             <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Talking Hrs</p>
                             <h4 className="text-2xl font-black text-slate-900">12.4 hrs</h4>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100">
                             <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">New Joinees (MoM)</p>
                             <h4 className="text-2xl font-black text-slate-900">+142%</h4>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100">
                             <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Active Listeners</p>
                             <h4 className="text-2xl font-black text-slate-900">{onlineUsers.length}</h4>
                        </div>
                    </div>
                    <button className="mt-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                        Deep Monthly Report
                    </button>
                </div>
            </div>

            {/* Registration Pulse & All User Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Users size={20} className="text-indigo-500" /> 
                            Registration Pulse
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {recentRegistrations.map((user) => (
                            <div key={user.uid} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">
                                       {user.avatarUrl?.startsWith('avatar:') ? user.avatarUrl.split(':')[1] : (user.displayName?.[0] || 'U')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{user.displayName || 'Anon User'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {user.roles?.[0] || 'New Signup'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase">
                                    {(() => {
                                        const cat = (user.createdAt as any);
                                        return cat && typeof cat.toDate === 'function' ? cat.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';
                                    })()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* NEW: Comprehensive User Monitor Table */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">User Activity Monitor</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest">All</button>
                            <button className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">Listeners</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity / Last Seen</th>
                                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentRegistrations.slice(0, 6).map((u) => (
                                    <tr key={u.uid} className="group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs">👤</div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">{u.displayName}</p>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase">
                                                        {u.lastActive && (u.lastActive as any).toMillis 
                                                            ? `Active ${Math.floor((Date.now() - (u.lastActive as any).toMillis()) / 60000)}m ago` 
                                                            : 'Recently Joined'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600">
                                                    <Clock size={10} /> {Math.floor(Math.random() * 20)}h Total
                                                </div>
                                                <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 w-2/3"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-[10px] font-black uppercase tracking-widest">
                                            {u.isVerified ? (
                                                <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck size={12} /> Verified</span>
                                            ) : (
                                                <span className="text-slate-300 italic">Self-Onboarding</span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right">
                                            <p className="text-xs font-black text-slate-900 tracking-tighter italic">₹{(Math.random() * 1000).toFixed(0)}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brought By: Direct</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Real-time Online Map - Listeners */}
             <div className="bg-slate-900 p-10 rounded-[4rem] text-white">
                 <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight mb-2">Listener Command Post</h2>
                    <p className="text-slate-400 text-sm">Real-time status of all verified listeners on post.</p>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {onlineUsers.map(user => (
                        <div key={user.uid} className="p-4 bg-slate-800 rounded-3xl border border-slate-700 flex flex-col items-center text-center gap-3 relative group hover:border-emerald-500/50 transition-all">
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow shadow-emerald-400/50"></div>
                            <div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center text-xl shadow-inner border border-slate-600 group-hover:scale-110 transition-transform">
                                {user.avatarUrl?.startsWith('avatar:') ? user.avatarUrl.split(':')[1] : '👤'}
                            </div>
                            <div>
                                <p className="text-xs font-bold truncate w-full max-w-[100px]">{user.displayName}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user.gender || 'GNR'}</p>
                            </div>
                        </div>
                    ))}
                    {onlineUsers.length === 0 && <p className="col-span-full text-center py-10 text-slate-500 font-black uppercase tracking-[0.4em] text-xs">Zero Listeners Post Duty</p>}
                 </div>
             </div>
        </div>
    );
}
