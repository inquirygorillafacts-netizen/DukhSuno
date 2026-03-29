'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { SPECIALTY_LABELS, PROVIDER_TYPE_LABELS } from '@/types';
import type { BigSunoUser, Plan, ProviderType, Specialty } from '@/types';
import { Phone, Star, ChevronDown, ShieldCheck, Heart, Zap, Sparkles, MessageCircle, AlertCircle, X, ArrowRight, TrendingUp, Wallet, ChevronLeft, Clock, Users } from 'lucide-react';

export default function ProfessionalProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [listener, setListener] = useState<Partial<BigSunoUser> | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showFullBio, setShowFullBio] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initiating, setInitiating] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceGap, setBalanceGap] = useState(0);

    useEffect(() => {
        async function fetchListener() {
            try {
                const id = params.username as string;
                let q = query(
                    collection(db, 'users'),
                    where('uid', '==', id),
                    limit(1)
                );
                
                let snap = await getDocs(q);
                
                if (snap.empty) {
                    q = query(
                        collection(db, 'users'),
                        where('username', '==', id),
                        limit(1)
                    );
                    snap = await getDocs(q);
                }

                if (!snap.empty) {
                    setListener(snap.docs[0].data() as BigSunoUser);
                }
            } catch (err) {
                console.error("Error fetching provider:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchListener();
    }, [params.username]);

    const handleCallClick = async () => {
        if (!selectedPlan || !listener || !user) {
            if (!user) router.push('/login');
            return;
        }

        // Check balance
        const balance = user.creditBalance || 0;
        if (balance < selectedPlan.price) {
            setBalanceGap(selectedPlan.price - balance);
            setShowBalanceModal(true);
            return;
        }

        setInitiating(true);
        try {
            const res = await fetch('/api/sessions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    listenerId: listener.uid,
                    planId: selectedPlan.id || `plan_${selectedPlan.minutes}`,
                    planMinutes: selectedPlan.minutes,
                    planPrice: selectedPlan.price,
                })
            });

            const data = await res.json();
            if (data.error) {
                alert(data.error);
                setInitiating(false);
                return;
            }

            if (data.sessionId) {
                router.push(`/call/${data.sessionId}`);
            }
        } catch (err) {
            console.error("Failed to start session:", err);
            alert("Unable to start consultation. Please try again.");
            setInitiating(false);
        }
    };

    // Fast Recharge — Pay Gap & Start Call
    const handlePayGap = async () => {
        if (!user || balanceGap <= 0) return;
        setInitiating(true);
        try {
            const res = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: balanceGap,
                    userId: user.uid,
                    type: 'TOPUP_FOR_PLAN',
                    listenerId: listener?.uid,
                    planId: selectedPlan?.id || `plan_${selectedPlan?.minutes}`,
                    planPrice: selectedPlan?.price,
                    planMinutes: selectedPlan?.minutes,
                }),
            });

            const data = await res.json();
            if (data.url) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.url;
                Object.entries(data.params).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });
                document.body.appendChild(form);
                form.submit();
            }
        } catch (err) {
            console.error('Gap payment failed:', err);
            alert('Payment initialization failed.');
        } finally {
            setInitiating(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-900 font-black uppercase tracking-widest animate-pulse">Loading Identity...</div>;
    if (!listener) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Provider Not Found. 😕</div>;

    // Provider categories
    const categories: string[] = [];
    if (listener.providerType) {
        const label = PROVIDER_TYPE_LABELS[listener.providerType as ProviderType];
        if (label) categories.push(label);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-32">
            
            {/* Back Button */}
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                <ChevronLeft size={24} />
            </button>

            {/* Profile Hero — Reference from Provider Profile Page */}
            <div className="relative mb-16">
                {/* Banner — Gradient style from provider profile */}
                <div className="h-36 md:h-48 w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl md:rounded-[2.5rem] overflow-hidden relative group">
                    {/* Animated decorative blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-[-20%] left-[-10%] w-[250px] h-[250px] bg-indigo-600/20 rounded-full blur-[80px] animate-blob" />
                      <div className="absolute bottom-[-20%] right-[-10%] w-[200px] h-[200px] bg-violet-500/15 rounded-full blur-[60px] animate-blob-delay" />
                    </div>
                    
                    {/* Floating stats on banner */}
                    <div className="absolute bottom-4 right-5 flex gap-2 z-10">
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl">
                          <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-0.5">Rating</p>
                          <p className="text-sm font-black text-white italic flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" /> {listener.ratingAvg?.toFixed(1) || "0.0"}</p>
                       </div>
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl">
                          <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-0.5">Sessions</p>
                          <p className="text-sm font-black text-white italic">{listener.totalSessions || 0}+</p>
                       </div>
                    </div>

                    {/* Availability badge */}
                    {listener.isAvailable && (
                      <div className="absolute top-4 right-5 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-xl flex items-center gap-1.5 z-10">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">Online</span>
                      </div>
                    )}
                </div>
                
                {/* Avatar — overlapping banner */}
                <div className="absolute -bottom-12 left-6 flex items-end gap-4">
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-5xl md:text-6xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                               {listener.avatarUrl?.includes(':') ? listener.avatarUrl.split(':')[1] : (listener.avatarUrl || '👤')}
                            </div>
                        </div>
                        {listener.isAvailable && (
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer for overlapping avatar */}
            <div className="h-4" />

            {/* Info Header */}
            <div className="px-2">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                        {listener.displayName}
                    </h1>
                    {listener.isVerified && (
                        <div className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                          <ShieldCheck size={12} className="fill-current" /> Verified
                        </div>
                    )}
                </div>
                <p className="text-indigo-600 font-bold italic text-sm mb-3 leading-tight">
                    {listener.headline || "Professional Expert Consultant 💙"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-amber-500">★ {listener.ratingAvg?.toFixed(1) || '0.0'}</span>
                    <span>• {listener.totalSessions || 0} sessions</span>
                    <span>• {listener.ratingCount || 0} reviews</span>
                </div>
            </div>

            {/* Professional Bio */}
            <div className="glass bg-white p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-white shadow-sm relative group overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-3">Professional Background</span>
                <p className={`text-xs md:text-sm font-medium leading-relaxed text-slate-600 relative z-10 ${!showFullBio ? 'line-clamp-4' : ''}`}>
                   {listener.bio || "This professional has not shared a detailed background yet, but is available for consultation."}
                </p>
                <button 
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-4 flex items-center gap-1 text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:gap-2 transition-all relative z-10"
                >
                    {showFullBio ? "Show Less" : "Read Full Background"} <ChevronDown size={14} className={showFullBio ? 'rotate-180' : ''} />
                </button>
            </div>

            {/* Specialties */}
            <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Core Expertise</span>
                <div className="flex flex-wrap gap-2">
                    {listener.specialties?.map((s) => (
                        <span key={s} className="glass bg-white px-4 py-2 rounded-xl text-[10px] font-black border border-slate-100 flex items-center gap-2 hover:scale-105 transition-transform">
                            {SPECIALTY_LABELS[s as Specialty] || s}
                        </span>
                    ))}
                    {categories.map((cat, i) => (
                        <span key={`cat-${i}`} className="px-4 py-2 rounded-xl bg-indigo-50 text-[10px] font-black text-indigo-600 border border-indigo-100 flex items-center gap-2">
                            {cat}
                        </span>
                    ))}
                </div>
            </div>

            {/* Plans & Book Section */}
            <div className="p-6 md:p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-xl shadow-slate-900/5 space-y-6">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-indigo-600" />
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Select Consultation Plan</h3>
                </div>

                <div className="space-y-3">
                    {listener.plans?.map((plan, idx) => (
                        <button 
                            key={plan.id || `plan-${idx}`}
                            onClick={() => setSelectedPlan(plan)}
                            className={`w-full p-5 rounded-[2rem] border-2 text-left transition-all relative group ${
                                selectedPlan?.id === plan.id 
                                ? 'border-indigo-600 bg-indigo-50' 
                                : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <p className={`text-xs font-black uppercase tracking-widest ${selectedPlan?.id === plan.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {plan.minutes} Minutes
                                </p>
                                {selectedPlan?.id === plan.id && <Sparkles size={14} className="text-indigo-600 animate-spin-slow" />}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{plan.price}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rate</span>
                            </div>
                            {selectedPlan?.id === plan.id && (
                                <p className="text-[10px] text-indigo-500 mt-2 italic font-medium">"{plan.heading || 'One-on-One Session'}"</p>
                            )}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handleCallClick}
                    disabled={!selectedPlan || initiating}
                    className={`w-full h-16 rounded-[2rem] flex items-center justify-center gap-3 text-[13px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                        selectedPlan 
                        ? 'bg-slate-900 text-white shadow-slate-500/30 hover:scale-[1.02] active:scale-95' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                >
                    {initiating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Zap size={18} fill="currentColor" />
                            Connect Now
                        </>
                    )}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
                    <AlertCircle size={10} className="inline mr-1" /> Secure payment upon session connect.
                </p>
            </div>

            {/* Insufficient Balance Modal — Fast Recharge */}
            {showBalanceModal && (
                <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-xl p-0 md:p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-[500px] bg-white rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-12 space-y-8 animate-in slide-in-from-bottom-10 duration-500 relative">
                        <button onClick={() => setShowBalanceModal(false)} className="absolute top-6 right-6 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                            <X size={24} />
                        </button>

                        <div className="space-y-2">
                            <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] leading-none mb-2">Insufficient Balance</p>
                            <h2 className="text-[28px] md:text-[36px] font-black text-slate-900 tracking-tighter leading-tight italic">Low Credits! 💸</h2>
                            <p className="text-sm text-slate-400 font-medium italic">₹{balanceGap} और चाहिए इस consultation के लिए।</p>
                        </div>

                        {/* Breakdown */}
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Wallet size={12} /> Wallet Balance
                                </span>
                                <span className="text-lg font-black text-slate-600">₹{user?.creditBalance || 0}</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={12} /> Plan Price
                                </span>
                                <span className="text-lg font-black text-slate-900">₹{selectedPlan?.price}</span>
                            </div>
                            <div className="h-px bg-slate-200" />
                            <div className="flex justify-between items-center px-2 pt-1">
                                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Amount to Pay</span>
                                <span className="text-3xl font-black text-slate-900 italic tracking-tighter">₹{balanceGap}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayGap}
                            disabled={initiating}
                            className="w-full h-16 md:h-20 bg-slate-900 text-white rounded-[2rem] font-black text-base md:text-lg uppercase tracking-[0.15em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {initiating ? 'Processing...' : (
                                <>
                                    Pay ₹{balanceGap} & Connect
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <ShieldCheck size={12} className="inline mr-1 text-emerald-500" /> Secure Payment via PayU
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
