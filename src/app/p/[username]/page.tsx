'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { SPECIALTY_LABELS } from '@/types';
import type { BigSunoUser, Plan } from '@/types';
import { Star, ChevronDown, ShieldCheck, Zap, Sparkles, AlertCircle, Wallet, X, ArrowRight, TrendingUp } from 'lucide-react';

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
                // Support both UID and Username
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

        // 0. Self-call check
        if (user.uid === listener.uid) {
            alert("आप खुदको खुद कॉल नहीं कर सकते है। 🛑");
            return;
        }

        // 1. Check Balance
        const currentBalance = user.creditBalance || 0;
        if (currentBalance < selectedPlan.price) {
            setBalanceGap(selectedPlan.price - currentBalance);
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
                    planId: selectedPlan.id || `plan_${selectedPlan.minutes}`, // Fallback for planId
                    planMinutes: selectedPlan.minutes,
                    planPrice: selectedPlan.price,
                })
            });

            const data = await res.json();
            if (data.sessionId) {
                router.push(`/call/${data.sessionId}`);
            } else {
                throw new Error(data.error || 'Failed to create session');
            }
        } catch (err: any) {
            console.error("Failed to start session:", err);
            alert(err.message || "Unable to start consultation. Please try again.");
            setInitiating(false);
        }
    };

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
                    type: 'call_immediate',
                    listenerId: listener?.uid,
                    planId: selectedPlan?.id || `plan_${selectedPlan?.minutes}`,
                    planPrice: selectedPlan?.price
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

    return (
        <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-700">
            {/* Professional Profile Header */}
            <div className="relative h-[250px] md:h-[320px] rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-900 overflow-hidden group">
                <div className="absolute inset-0 opacity-20 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] animate-blob" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] bg-slate-300 rounded-full blur-[80px] animate-blob-delay" />
                </div>
                
                {/* Floating Stats */}
                <div className="absolute bottom-10 right-10 flex gap-4 z-10 hidden md:flex">
                     <div className="glass-container bg-white/10 border-white/20 p-4 rounded-3xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Expert Rating</p>
                        <p className="text-xl font-black text-white italic">⭐ {listener.ratingAvg || "4.9"}</p>
                     </div>
                     <div className="glass-container bg-white/10 border-white/20 p-4 rounded-3xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Consultations</p>
                        <p className="text-xl font-black text-white italic">{listener.totalSessions || "100"}+</p>
                     </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <div className="relative -mt-24 mb-10">
                    <div className="w-44 h-44 rounded-[4rem] bg-white p-2 shadow-2xl border-4 border-white overflow-hidden relative group">
                        <div className="w-full h-full rounded-[3.5rem] bg-slate-50 flex items-center justify-center text-7xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                           {listener.avatarUrl?.includes(':') ? listener.avatarUrl.split(':')[1] : (listener.avatarUrl || '👤')}
                        </div>
                        {listener.isAvailable && (
                            <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{listener.displayName}</h1>
                                {listener.isVerified && <ShieldCheck size={28} className="text-indigo-600 fill-indigo-50" />}
                            </div>
                            <p className="text-xl font-bold text-indigo-600 tracking-tight leading-none mb-4">{listener.headline || "Professional Expert Consultant"}</p>
                            <div className="flex flex-wrap gap-2">
                                {listener.specialties?.map(s => (
                                    <span key={s} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl border border-indigo-100 uppercase tracking-widest">
                                        #{SPECIALTY_LABELS[s] || s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group overflow-hidden">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Professional Background</h3>
                             <p className={`text-slate-600 font-medium leading-relaxed ${!showFullBio ? 'line-clamp-4' : ''}`}>
                                {listener.bio || "This professional has not shared a detailed background yet, but is available for consultation."}
                             </p>
                             <button 
                                onClick={() => setShowFullBio(!showFullBio)}
                                className="mt-4 flex items-center gap-1 text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:gap-2 transition-all"
                             >
                                {showFullBio ? "Show Less" : "Read Full Background"} <ChevronDown size={14} className={showFullBio ? 'rotate-180' : ''} />
                             </button>
                        </div>
                    </div>

                    {/* Right: Plans & Selection */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[3rem] bg-white border-2 border-slate-100 shadow-xl shadow-slate-900/5 sticky top-28">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap size={16} className="text-indigo-600" />
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Select Consultation</h3>
                            </div>

                            <div className="space-y-3 mb-8">
                                {listener.plans?.map((plan, index) => (
                                    <button 
                                        key={plan.id || `plan-${index}`}
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

                            <p className="text-center text-[10px] text-slate-400 font-medium mt-6 leading-relaxed">
                                <AlertCircle size={10} className="inline mr-1" /> Secure payment processed upon session start.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insufficient Balance Modal */}
            {showBalanceModal && (
                <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-xl p-0 md:p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-[500px] bg-white rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-10 duration-500 relative">
                        <button onClick={() => setShowBalanceModal(false)} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                            <X size={24} />
                        </button>

                        <div className="space-y-2">
                            <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] leading-none mb-2">Insufficient Balance</p>
                            <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight italic">Low Credits! 💸</h2>
                            <p className="text-sm text-slate-400 font-medium italic">Additional ₹{balanceGap} credits required to initiate this consultation.</p>
                        </div>

                        {/* Math Breakdown */}
                        <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={12} /> Wallet Balance
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
                            <div className="flex justify-between items-center px-2 pt-2">
                                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Amount to Pay</span>
                                <span className="text-3xl font-black text-slate-900 italic tracking-tighter">₹{balanceGap}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayGap}
                            disabled={initiating}
                            className="w-full h-20 bg-slate-900 text-white rounded-3xl font-black text-[18px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all"
                        >
                            {initiating ? 'Processing...' : (
                                <>
                                    Pay ₹{balanceGap} Now
                                    <ArrowRight size={24} />
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
