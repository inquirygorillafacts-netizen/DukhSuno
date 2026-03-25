'use client';

import React from "react";
import {
    Users,
    CreditCard,
    IndianRupee,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    PhoneCall,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    Clock,
    Zap
} from "lucide-react";

const stats = [
    { name: "Total Users", value: "842", icon: Users, change: "+12.5%", trend: "up", color: "blue" },
    { name: "Daily Revenue", value: "₹18,450", icon: IndianRupee, change: "+4.2%", trend: "up", color: "indigo" },
    { name: "Live Calls", value: "14", icon: PhoneCall, change: "Active Now", trend: "up", color: "emerald" },
    { name: "Success Rate", value: "98.2%", icon: Zap, change: "+0.4%", trend: "up", color: "rose" },
];

const recentActivity = [
    { id: 1, user: "Rahul S.", action: "Verified", time: "2 mins ago", type: "success" },
    { id: 2, user: "Amit P.", action: "New Payment", time: "15 mins ago", type: "info" },
    { id: 3, user: "Priya D.", action: "Withdrawal Req", time: "1 hour ago", type: "warning" },
    { id: 4, user: "Vikram K.", action: "Call Started", time: "3 hours ago", type: "info" },
];

export default function OwnerDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">SaaS Overview</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Welcome back, Owner. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <Calendar size={14} />
                        Last 24 Hours
                    </button>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95">
                        <TrendingUp size={14} />
                        View Live Reports
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={stat.name}
                        className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                    >
                        {/* Decorative Blob */}
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full transition-all duration-500 group-hover:scale-125 z-0 opacity-10 ${
                            stat.color === 'blue' ? 'bg-blue-600' :
                            stat.color === 'indigo' ? 'bg-indigo-600' :
                            stat.color === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-2xl shadow-sm ${
                                    stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                    stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                    <stat.icon size={20} strokeWidth={2.5} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-sm ${
                                    stat.trend === 'up' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                                }`}>
                                    {stat.trend === 'up' ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                                    {stat.change}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.name}</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Revenue Growth</h2>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Call earnings over the last 12 hours</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary"></div>
                             <span className="text-[10px] font-black uppercase text-slate-400">Earnings (₹)</span>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 75, 60, 85, 50, 70, 95].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-full relative bg-slate-50 rounded-lg overflow-hidden h-full flex items-end">
                                    <div 
                                        className="w-full bg-primary/40 group-hover:bg-primary transition-all duration-700 ease-out"
                                        style={{ height: `${val}%` }}
                                    ></div>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <div className="px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded shadow-xl -mt-8">
                                            ₹{(val * 200).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-300">T{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                        <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg uppercase">Live</span>
                    </div>

                    <div className="space-y-6 flex-1">
                        {recentActivity.map((item) => (
                            <div key={item.id} className="relative pl-6 border-l-2 border-slate-100 last:pb-0 pb-6 group">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${
                                    item.type === 'success' ? 'bg-emerald-500' :
                                    item.type === 'warning' ? 'bg-amber-500' : 'bg-primary'
                                } group-hover:scale-125 transition-transform shadow-sm`}></div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-800">{item.user}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.time}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{item.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
                        View Audit Logs
                    </button>
                </div>
            </div>
            
            {/* Summary Banner */}
            <div className="bg-primary/5 border border-primary/10 p-8 rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <h4 className="text-xl font-black tracking-tight uppercase text-primary mb-1">Weekly Performance Insight</h4>
                        <p className="text-sm text-slate-600 font-medium">Earnings are up by 24% compared to last week. Top listener: <b>Sneha R.</b></p>
                    </div>
                    <button className="px-8 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        Download Report
                    </button>
                 </div>
            </div>
        </div>
    );
}
