'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { SPECIALTY_LABELS } from '@/types';
import type { BigSunoUser, Plan } from '@/types';
import { Phone, Star, ChevronDown, ShieldCheck, Heart, Zap, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';

export default function SunaneListenerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [listener, setListener] = useState<Partial<BigSunoUser> | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showFullBio, setShowFullBio] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initiating, setInitiating] = useState(false);

    useEffect(() => {
        async function fetchListener() {
            try {
                const q = query(
                    collection(db, 'users'),
                    where('username', '==', params.username),
                    limit(1)
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setListener(snap.docs[0].data() as BigSunoUser);
                }
            } catch (err) {
                console.error("Error fetching listener:", err);
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

        setInitiating(true);
        try {
            // Create a new session in Firestore
            const sessionRef = await addDoc(collection(db, 'sessions'), {
                callerId: user.uid,
                callerName: user.displayName || 'Anonymous Speaker',
                callerAvatar: user.avatarUrl || 'emoji:👤',
                listenerId: listener.uid,
                status: 'ringing',
                planId: selectedPlan.id,
                planMinutes: selectedPlan.minutes,
                planPrice: selectedPlan.price,
                createdAt: serverTimestamp(),
                isVideoUnlocked: false,
            });

            // Redirect to the call page
            router.push(`/call/${sessionRef.id}`);
        } catch (err) {
            console.error("Failed to start call:", err);
            alert("Call start karne mein dikkat aayi. Kripya phir se try karein.");
            setInitiating(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-rose-500 font-black uppercase tracking-widest animate-pulse">Dost ko dhoondh rahe hain...</div>;
    if (!listener) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Listener nahi mila. 😕</div>;

    return (
        <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-700">
            {/* Premium Profile Header */}
            <div className="relative h-[250px] md:h-[320px] rounded-[3rem] bg-gradient-to-br from-rose-500 to-rose-900 overflow-hidden group">
                <div className="absolute inset-0 opacity-20 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-white rounded-full blur-[100px] animate-blob" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] bg-rose-300 rounded-full blur-[80px] animate-blob-delay" />
                </div>
                
                {/* Floating Stats */}
                <div className="absolute bottom-10 right-10 flex gap-4 z-10 hidden md:flex">
                     <div className="glass-container bg-white/10 border-white/20 p-4 rounded-3xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest leading-none mb-1">Rating</p>
                        <p className="text-xl font-black text-white italic">⭐ {listener.ratingAvg || "4.9"}</p>
                     </div>
                     <div className="glass-container bg-white/10 border-white/20 p-4 rounded-3xl backdrop-blur-md">
                        <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest leading-none mb-1">Sessions</p>
                        <p className="text-xl font-black text-white italic">{listener.totalSessions || "120"}+</p>
                     </div>
                </div>
            </div>

            {/* Profile Detail Section */}
            <div className="max-w-5xl mx-auto px-6">
                <div className="relative -mt-24 mb-10">
                    <div className="w-44 h-44 rounded-[4rem] bg-white p-2 shadow-2xl border-4 border-white overflow-hidden relative group">
                        <div className="w-full h-full rounded-[3.5rem] bg-rose-50 flex items-center justify-center text-7xl shadow-inner group-hover:scale-110 transition-transform duration-500">
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
                                {listener.isVerified && <ShieldCheck size={28} className="text-rose-600 fill-rose-50" />}
                            </div>
                            <p className="text-xl font-bold text-rose-600 tracking-tight leading-none mb-4">{listener.headline || "Emotional Support Specialist"}</p>
                            <div className="flex flex-wrap gap-2">
                                {listener.specialties?.map(s => (
                                    <span key={s} className="px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-black rounded-xl border border-rose-100 uppercase tracking-widest">
                                        #{SPECIALTY_LABELS[s] || s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group overflow-hidden">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Mera Safar</h3>
                             <p className={`text-slate-600 font-medium leading-relaxed ${!showFullBio ? 'line-clamp-4' : ''}`}>
                                {listener.bio || "Inhone abhi apna bio share nahi kiya hai, par ye aapki baat sunne ke liye taiyaar hain."}
                             </p>
                             <button 
                                onClick={() => setShowFullBio(!showFullBio)}
                                className="mt-4 flex items-center gap-1 text-[11px] font-black text-rose-600 uppercase tracking-widest hover:gap-2 transition-all"
                             >
                                {showFullBio ? "Kam Kam Dikhao" : "Puri Kahani Padhein"} <ChevronDown size={14} className={showFullBio ? 'rotate-180' : ''} />
                             </button>
                        </div>
                    </div>

                    {/* Right: Plans & Selection */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[3rem] bg-white border-2 border-slate-100 shadow-xl shadow-rose-900/5 sticky top-28">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap size={16} className="text-rose-600" />
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Select Support Plan</h3>
                            </div>

                            <div className="space-y-3 mb-8">
                                {listener.plans?.map(plan => (
                                    <button 
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`w-full p-5 rounded-[2rem] border-2 text-left transition-all relative group ${
                                            selectedPlan?.id === plan.id 
                                            ? 'border-rose-600 bg-rose-50' 
                                            : 'border-slate-50 bg-slate-50/50 hover:border-rose-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <p className={`text-xs font-black uppercase tracking-widest ${selectedPlan?.id === plan.id ? 'text-rose-600' : 'text-slate-400'}`}>
                                                {plan.minutes} Minutes
                                            </p>
                                            {selectedPlan?.id === plan.id && <Sparkles size={14} className="text-rose-600 animate-spin-slow" />}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black tracking-tighter text-slate-900">₹{plan.price}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total cost</span>
                                        </div>
                                        {selectedPlan?.id === plan.id && (
                                            <p className="text-[10px] text-rose-500 mt-2 italic font-medium">"{plan.heading || 'Quick Session'}"</p>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleCallClick}
                                disabled={!selectedPlan || initiating}
                                className={`w-full h-16 rounded-[2rem] flex items-center justify-center gap-3 text-[13px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                                    selectedPlan 
                                    ? 'bg-rose-600 text-white shadow-rose-500/30 hover:scale-[1.02] active:scale-95' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                            >
                                {initiating ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Phone size={18} fill="currentColor" />
                                        Call Shuru Karein
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 font-medium mt-6 leading-relaxed">
                                <AlertCircle size={10} className="inline mr-1" /> Call start hote hi plan ke paise deduct ho jayenge.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

