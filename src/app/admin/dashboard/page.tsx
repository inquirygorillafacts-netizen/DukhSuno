'use client';

import React, { useState, useEffect } from "react";
import {
    Users,
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
    Zap,
    Sparkles,
    Globe,
    Settings as SettingsIcon
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    limit, 
    orderBy, 
    getCountFromServer,
    Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
    const { user: authUser } = useAuthStore();
    const isOwner = authUser?.owner === true;
    
    const [stats, setStats] = useState([
        { name: "Total Users", value: "0", icon: Users, change: "Live", trend: "up", color: "blue" },
        { name: "Daily Revenue", value: "₹0", icon: IndianRupee, change: "Today", trend: "up", color: "indigo" },
        { name: "Active Sessions", value: "0", icon: PhoneCall, change: "Active Now", trend: "up", color: "emerald" },
        { name: "Success Rate", value: "100%", icon: Zap, change: "Session Stats", trend: "up", color: "rose" },
    ]);

    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<number[]>(new Array(12).fill(0));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Total Users Count
        const fetchUserCount = async () => {
            const snapshot = await getCountFromServer(collection(db, "users"));
            setStats(prev => prev.map(s => s.name === "Total Users" ? { ...s, value: snapshot.data().count.toString() } : s));
        };
        fetchUserCount();

        // 2. Daily Revenue & Success Rate (Today's Sessions)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const qToday = query(
            collection(db, "sessions"),
            where("createdAt", ">=", Timestamp.fromDate(startOfDay))
        );

        const unsubscribeToday = onSnapshot(qToday, (snapshot) => {
            let totalRevenue = 0;
            let completed = 0;
            const total = snapshot.size;
            const hourlyData = new Array(12).fill(0);
            const now = new Date();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
                
                if (data.status === "completed") {
                    completed++;
                    const profit = (data.planPrice || 0) - (data.listenerEarned || data.providerEarned || 0);
                    totalRevenue += Math.max(0, profit);

                    if (createdAt) {
                        const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
                        if (diffHours < 12) {
                            hourlyData[11 - diffHours] += profit;
                        }
                    }
                }
            });

            const successPercentage = total > 0 ? Math.round((completed / total) * 100) : 100;
            setRevenueData(hourlyData);

            setStats(prev => prev.map(s => {
                if (s.name === "Daily Revenue") return { ...s, value: `₹${totalRevenue.toLocaleString()}` };
                if (s.name === "Success Rate") return { ...s, value: `${successPercentage}%` };
                return s;
            }));
        });

        // 3. Active Sessions Count
        const qActive = query(
            collection(db, "sessions"),
            where("status", "in", ["active", "ringing"])
        );

        const unsubscribeActive = onSnapshot(qActive, (snapshot) => {
            setStats(prev => prev.map(s => s.name === "Active Sessions" ? { ...s, value: snapshot.size.toString() } : s));
        });

        // 4. Recent Activity
        const qRecent = query(
            collection(db, "sessions"),
            orderBy("createdAt", "desc"),
            limit(5)
        );

        const unsubscribeRecent = onSnapshot(qRecent, (snapshot) => {
            const activities = snapshot.docs.map(doc => {
                const data = doc.data();
                const timeStr = data.createdAt?.toDate ? 
                    new Date(data.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                    "Just now";
                
                return {
                    id: doc.id,
                    user: `Call #${doc.id.slice(-4).toUpperCase()}`,
                    action: data.status === 'completed' ? `Completed (₹${data.planPrice})` : `Status: ${data.status}`,
                    time: timeStr,
                    type: data.status === 'completed' ? 'success' : 'info'
                };
            });
            setRecentActivity(activities);
            setLoading(false);
        });

        return () => {
            unsubscribeToday();
            unsubscribeActive();
            unsubscribeRecent();
        };
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 md:pb-10">
            {/* Owner Master Control (Conditional) */}
            {isOwner && (
                <div className="p-1 w-full rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-rose-400 shadow-xl shadow-amber-200/50 mb-10 overflow-hidden">
                    <div className="bg-slate-900 rounded-[2.4rem] p-6 md:p-8 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    <Sparkles size={12} fill="currentColor" /> System Master
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Ecosystem Health: <span className="text-amber-400">Stable</span></h2>
                                <p className="text-white/60 text-[11px] font-medium max-w-sm">All operations are running smoothly. Database synchronization and API latency are within optimal parameters.</p>
                            </div>
                            <div className="flex gap-3">
                                <div onClick={() => window.open('/', '_blank')} className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1 group hover:bg-white/10 transition-all cursor-pointer min-w-[100px]">
                                    <Globe className="text-amber-400" size={20} />
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Public Site</p>
                                </div>
                                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1 group hover:bg-white/10 transition-all cursor-pointer min-w-[100px]">
                                    <Zap className="text-amber-400" size={20} />
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Live Logs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-1">{isOwner ? "Admin Dashboard" : "Operations Overview"}</h1>
                    <p className="text-sm md:text-base text-slate-500 font-bold tracking-tight italic">"The system is performing at optimal efficiency..."</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <Calendar size={14} />
                        Real-time Metrics
                    </button>
                    <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95">
                        <TrendingUp size={14} />
                        Refresh Data
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
                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.name}</p>
                                 <div className="flex items-baseline gap-1">
                                     <h3 className="text-4xl font-black text-primary tracking-tighter leading-none">{stat.value}</h3>
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
                            <h2 className="text-xl font-bold text-slate-900">Platform Growth</h2>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Active monitoring of session volume</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary"></div>
                             <span className="text-[10px] font-black uppercase text-slate-400">Trends</span>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-2 px-2">
                        {revenueData.map((profit, i) => {
                            const maxProfit = Math.max(...revenueData, 100);
                            const percent = (profit / maxProfit) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-full relative bg-slate-50 rounded-lg overflow-hidden h-full flex items-end">
                                        <div 
                                            className="w-full bg-primary/40 group-hover:bg-primary transition-all duration-700 ease-out"
                                            style={{ height: `${Math.max(5, percent)}%` }} // Minimum 5% visible
                                        ></div>
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <div className="px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded shadow-xl -mt-8">
                                                ₹{profit.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300">-{11-i}h</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
                        <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg uppercase">Live</span>
                    </div>

                    <div className="space-y-6 flex-1">
                        {recentActivity.length > 0 ? recentActivity.map((item) => (
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
                        )) : (
                            <div className="text-center py-10 opacity-30">
                                <Clock size={40} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase">No recent activity</p>
                            </div>
                        )}
                    </div>

                    <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
                        View Detailed Logs
                    </button>
                </div>
            </div>
            
            {/* Summary Banner */}
            <div className="bg-primary/5 border border-primary/10 p-8 rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <h4 className="text-xl font-black tracking-tight uppercase text-primary mb-1">Platform Performance Status</h4>
                        <p className="text-sm text-slate-600 font-medium">System health is currently 100%. All user interactions are being recorded and analyzed for quality assurance.</p>
                    </div>
                 </div>
            </div>
        </div>
    );
}
