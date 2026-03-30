'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { SPECIALTY_LABELS, PROVIDER_TYPE_LABELS } from '@/types';
import type { BigSunoUser, Plan, ProviderType, Specialty } from '@/types';
import { Phone, Star, Check, ChevronDown, ShieldCheck, Heart, Zap, Sparkles, MessageCircle, AlertCircle, X, ArrowRight, TrendingUp, Wallet, ChevronLeft, Clock, Users } from 'lucide-react';
import { ReviewMarquee } from '@/components/profile/ReviewMarquee';

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

    // ⚡ REAL-TIME PROFILE: Initial lookup → then onSnapshot for live updates
    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        
        async function initListener() {
            try {
                const id = params.username as string;
                
                // ⚡ OPTIMIZED: Try direct getDoc first (fastest for UIDs)
                const directRef = doc(db, 'users', id);
                const directSnap = await getDoc(directRef);
                
                let targetDocId = '';
                if (directSnap.exists()) {
                    targetDocId = directSnap.id;
                } else {
                    // Fallback to username query
                    const q = query(collection(db, 'users'), where('username', '==', id), limit(1));
                    const usernameSnap = await getDocs(q);
                    if (!usernameSnap.empty) {
                        targetDocId = usernameSnap.docs[0].id;
                    }
                }

                if (targetDocId) {
                    unsubscribe = onSnapshot(doc(db, 'users', targetDocId), (docSnap) => {
                        if (docSnap.exists()) {
                            const data = { ...docSnap.data(), uid: targetDocId } as BigSunoUser;
                            setListener(data);
                            if (!selectedPlan && data.plans && data.plans.length > 0) {
                                setSelectedPlan(data.plans[0]);
                            }
                        }
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching provider:", err);
                setLoading(false);
            }
        }
        initListener();
        
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [params.username]);

    const handleCallClick = async () => {
        if (!selectedPlan || !listener || !user) {
            if (!user) router.push('/login');
            return;
        }

        if (user.uid === listener.uid) {
            alert("आप खुदको खुद कॉल नहीं कर सकते है। 🛑");
            return;
        }

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

    const handlePayGap = async () => {
        if (!user || !listener || !selectedPlan || balanceGap <= 0) return;
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

    const categories: string[] = [];
    if (listener.providerType) {
        const label = PROVIDER_TYPE_LABELS[listener.providerType as ProviderType];
        if (label) categories.push(label);
    }

    // Helper to check if a plan is active
    const isPlanSelected = (plan: Plan) => {
        if (!selectedPlan) return false;
        // Compare by ID if exists, fallback to minutes/price for stability
        if (plan.id && selectedPlan.id) return plan.id === selectedPlan.id;
        return plan.minutes === selectedPlan.minutes && plan.price === selectedPlan.price;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-32">
            
            {/* Back Button */}
            <div className="px-2">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* Profile Hero */}
            <div className="relative mb-16 px-2">
                <div className="h-36 md:h-48 w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl md:rounded-[2.5rem] overflow-hidden relative group">
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-[-20%] left-[-10%] w-[250px] h-[250px] bg-indigo-600/20 rounded-full blur-[80px] animate-blob" />
                      <div className="absolute bottom-[-20%] right-[-10%] w-[200px] h-[200px] bg-violet-500/15 rounded-full blur-[60px] animate-blob-delay" />
                    </div>
                    
                    <div className="absolute bottom-4 right-5 flex gap-2 z-10">
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl">
                          <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-0.5">Rating</p>
                          <p className="text-sm font-black text-white italic flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" /> {listener.ratingAvg?.toFixed(1) || "0.0"}</p>
                       </div>
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl">
                          <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-0.5">Helps</p>
                          <p className="text-sm font-black text-white italic">{listener.totalSessions || 0}+</p>
                       </div>
                    </div>

                    {listener.isAvailable && (
                      <div className="absolute top-4 right-5 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-xl flex items-center gap-1.5 z-10">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">Online</span>
                      </div>
                    )}
                </div>
                
                <div className="absolute -bottom-12 left-6 flex items-end gap-4">
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-5xl md:text-6xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                               {listener.avatarUrl?.includes(':') ? listener.avatarUrl.split(':')[1] : (listener.avatarUrl || '👤')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-4" />

            {/* Info Header */}
            <div className="px-4">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                        {listener.displayName}
                    </h1>
                    {listener.isVerified && (
                        <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-100/50">
                          <ShieldCheck size={12} className="fill-current" /> Verified
                        </div>
                    )}
                </div>
                <p className="text-indigo-600 font-bold italic text-sm mb-3 leading-tight">
                    {listener.headline || "Professional Expert Consultant 💙"}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">★ {listener.ratingAvg?.toFixed(1) || '0.0'}</span>
                    <span className="bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md italic tracking-widest">GENDER = {listener.gender || 'Any'}</span>
                    <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">• {listener.totalSessions || 0} helps</span>
                </div>
            </div>

            {/* Professional Bio */}
            <div className="px-4">
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
            </div>

            {/* Specialties */}
            <div className="px-4 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Core Expertise</span>
                <div className="flex flex-wrap gap-2">
                    {listener.specialties?.map((s) => (
                        <span key={s} className="glass bg-white px-4 py-2 rounded-xl text-[10px] font-black border border-slate-100 flex items-center gap-2 hover:scale-105 transition-transform">
                            {SPECIALTY_LABELS[s as Specialty] || s}
                        </span>
                    ))}
                </div>
            </div>

            {/* Plans & Book Section */}
            <div className="px-4">
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-xl shadow-slate-900/5 space-y-6">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-indigo-600" />
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Select Consultation Plan</h3>
                    </div>

                    <div className="space-y-3">
                        {listener.plans?.map((plan, idx) => {
                            const isSelected = isPlanSelected(plan);
                            return (
                                <button 
                                    key={plan.id || `plan-${idx}`}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`w-full p-5 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                                        isSelected 
                                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-50/50 to-white shadow-xl shadow-indigo-100/40 scale-[1.02]' 
                                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1.5 rounded-bl-[1.5rem] text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 shadow-sm">
                                            <Check size={12} strokeWidth={4} /> Selected
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <h4 className={`text-base md:text-lg font-black italic tracking-tighter transition-colors ${isSelected ? 'text-indigo-800' : 'text-slate-800'}`}>
                                                {plan.heading || `Consultation Package ${idx + 1}`}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-100/50' : 'bg-slate-50'}`}>
                                                   <Clock size={14} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                                                </div>
                                                <p className={`text-[11px] md:text-sm font-black uppercase tracking-widest ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                    {plan.minutes} Minutes Talk Time
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right pl-6 border-l-2 border-slate-100/50">
                                            <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest block mb-1">Price</span>
                                            <span className={`text-3xl md:text-4xl font-black tracking-tighter leading-none italic transition-colors ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                                                ₹{plan.price}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={handleCallClick}
                        disabled={!selectedPlan || initiating}
                        className={`w-full h-20 rounded-[2rem] flex items-center justify-center gap-4 text-[15px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                            selectedPlan 
                            ? 'bg-slate-900 text-white shadow-slate-900/30 hover:scale-[1.02] active:scale-95 group' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {initiating ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                   <Zap size={22} fill="white" className="text-white" />
                                </div>
                                Connect Now
                            </>
                        )}
                    </button>

                    <p className="text-center text-[11px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                        <ShieldCheck size={12} className="inline mr-2 text-emerald-500" /> Secure payment upon session connect.
                    </p>
                </div>
            </div>

            {/* Review Marquee Section */}
            <div className="px-4">
               <ReviewMarquee providerId={listener.uid || ''} />
            </div>

            {/* Insufficient Balance Modal — Fast Recharge */}
            {showBalanceModal && (
                <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
                    <div onClick={() => setShowBalanceModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
                    
                    <div className="w-full max-w-[500px] bg-white rounded-t-[3.5rem] md:rounded-[3.5rem] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-20 duration-500 relative z-10 border border-slate-100 shadow-2xl">
                        <button onClick={() => setShowBalanceModal(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">
                            <X size={24} />
                        </button>

                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                               <TrendingUp size={32} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] leading-none mb-2">Insufficient Balance</p>
                                <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight italic">Low Credits! 💸</h2>
                                <p className="text-base text-slate-500 font-bold italic">₹{balanceGap} और चाहिए इस consultation के लिए।</p>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 space-y-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                            
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Wallet size={14} /> Wallet Balance
                                </span>
                                <span className="text-xl font-black text-slate-600 italic">₹{user?.creditBalance || 0}</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={14} /> Plan Price
                                </span>
                                <span className="text-xl font-black text-slate-900 italic">₹{selectedPlan?.price}</span>
                            </div>
                            <div className="h-px bg-slate-200 mx-2" />
                            <div className="flex justify-between items-center px-2 pt-1">
                                <span className="text-sm font-black text-indigo-600 uppercase tracking-widest italic">Amount to Pay</span>
                                <span className="text-4xl font-black text-slate-900 italic tracking-tighter">₹{balanceGap}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayGap}
                            disabled={initiating}
                            className="w-full h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg md:text-xl uppercase tracking-[0.15em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50 group"
                        >
                            {initiating ? 'Processing...' : (
                                <>
                                    Pay ₹{balanceGap} & Connect
                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-60">
                            <ShieldCheck size={14} className="inline mr-2 text-emerald-500" /> Secure Payment via PayU
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
