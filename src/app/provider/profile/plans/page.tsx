'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    ChevronLeft, 
    Sparkles, 
    Clock,
    Zap,
    IndianRupee,
    Info,
    ShieldCheck
} from 'lucide-react';

const DEFAULT_PLANS = [
    { heading: 'Quick Session', minutes: 5, price: 49, type: 'basic' },
    { heading: 'Standard Session', minutes: 15, price: 99, type: 'standard' },
    { heading: 'Extended Support', minutes: 30, price: 199, type: 'premium' }
];

export default function SunneEditPlansPage() {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);

    useEffect(() => {
        if (user?.plans && user.plans.length > 0) {
            setPlans(user.plans);
        }
    }, [user]);

    const handlePlanChange = (index: number, field: string, value: any) => {
        const newPlans = [...plans];
        newPlans[index] = { ...newPlans[index], [field]: value };
        setPlans(newPlans);
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            const updates = {
                plans: plans,
                updatedAt: new Date(),
            };

            await updateDoc(userRef, updates);
            setUser({ ...user, ...updates });
            router.push('/provider/profile');
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50/50 flex flex-col overflow-hidden font-jakarta">
            {/* Elite Action Header — fixed, not sticky */}
            <div className="flex-shrink-0 glass bg-white/80 backdrop-blur-xl border-b border-white shadow-sm z-10">
                <div className="max-w-2xl mx-auto px-4 h-20 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="text-center">
                        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 leading-none mb-1">
                            Pricing Console
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Management</p>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="h-10 px-5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>PUBLISH PLANS</>
                        )}
                    </button>
                </div>
            </div>

            {/* Scrollable content area — isolated scroll */}
            <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 pt-10 pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Intro Section */}
                <div className="flex items-start gap-5 px-4 mb-2">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 flex-shrink-0">
                        <Zap size={24} className="fill-current" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter mb-1">Consultation Rates</h2>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Configure your professional session tiers. We recommend keeping rates competitive to ensure a steady flow of seekers.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8">
                    {plans.map((plan, index) => (
                        <div key={index} className="group relative">
                            {/* Accent Decoration */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            
                            <div className="relative glass bg-white p-8 rounded-[2.5rem] border border-white shadow-sm transition-all duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                           <Sparkles size={16} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Level 0{index + 1} • {plan.heading?.split(' ')[0]}</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-widest border border-emerald-100 uppercase">
                                        Active
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Plan Name */}
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Plan Display Name</label>
                                        <input 
                                            value={plan.heading}
                                            onChange={(e) => handlePlanChange(index, 'heading', e.target.value)}
                                            className="w-full h-12 px-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 font-black text-lg outline-none transition-all placeholder:text-slate-200"
                                            placeholder="e.g. Intensive Therapy"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Duration */}
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                                <Clock size={12} /> Duration (MIN)
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="number"
                                                    value={plan.minutes}
                                                    onChange={(e) => handlePlanChange(index, 'minutes', Number(e.target.value))}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 font-black text-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-indigo-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                                <IndianRupee size={12} /> Rate (INR)
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="number"
                                                    value={plan.price}
                                                    onChange={(e) => handlePlanChange(index, 'price', Number(e.target.value))}
                                                    className="w-full h-14 px-5 rounded-2xl bg-indigo-600 text-white font-black text-xl outline-none shadow-xl shadow-indigo-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Insight */}
                <div className="glass bg-slate-900 p-8 rounded-[3rem] text-white flex items-center gap-5 border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Platform Guarantee</p>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed">
                            Your rates are protected. BigSuno ensures secure payments and zero commission on your professional consultation hours.
                        </p>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
