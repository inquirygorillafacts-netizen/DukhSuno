'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, limit, onSnapshot, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { APP_CONFIG } from '@/lib/constants';
import { MOOD_TAGS, SPECIALTY_LABELS, PROVIDER_TYPE_LABELS } from '@/types';
import type { ListenerCard as ListenerCardType, Specialty, ProviderType } from '@/types';
import { Search, Sparkles, Star, Phone, Heart, Filter, ShieldCheck, Play, ArrowRight, TrendingUp, Zap, AlertCircle, Users, MessageCircle, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

/* ─── PREMIUM PROVIDER CARD ─── */
function ProviderCard({ provider }: { provider: any }) {
  const allPlans = provider.plans || [];
  const sortedPlans = [...allPlans].sort((a: any, b: any) => a.price - b.price);
  const cheapest = sortedPlans[0] || provider.cheapestPlan;
  
  // Provider categories
  const categories: string[] = [];
  if (provider.providerType) {
    const label = PROVIDER_TYPE_LABELS[provider.providerType as ProviderType];
    if (label) categories.push(label);
  }
  provider.specialties?.forEach((s: string) => {
    const label = SPECIALTY_LABELS[s as Specialty];
    if (label && categories.length < 3) categories.push(label);
  });
  if (categories.length === 0) categories.push('Expert ✨');

  return (
    <Link href={`/seeker/listener/${provider.uid}`}>
      <div className="bg-white p-4 md:p-5 rounded-[2rem] border border-slate-100 relative group transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-200 transition-transform duration-1000" />
        
        {/* DP + Status */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="relative">
             <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner overflow-hidden border border-slate-100 group-hover:rotate-3 transition-transform">
                {provider.avatarUrl?.includes(':') ? provider.avatarUrl.split(':')[1] : '👤'}
             </div>
             {provider.isAvailable && (
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             )}
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-amber-500 font-black text-[10px]">
                <Star size={10} className="fill-current" />
                <span>{provider.ratingAvg?.toFixed(1) || '0.0'}</span>
             </div>
             <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{provider.ratingCount || 0} helps</p>
          </div>
        </div>

        {/* Name + Headline */}
        <div className="space-y-0.5 mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs md:text-sm font-black text-slate-900 truncate tracking-tight uppercase italic">{provider.displayName}</h3>
            {provider.isVerified && (
               <ShieldCheck size={13} fill="#4f46e5" className="text-white shrink-0" />
            )}
          </div>
          <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate italic leading-tight">{provider.headline || "Digital Expert 💼"}</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-3 relative z-10">
           {categories.slice(0, 2).map((cat, i) => (
             <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[6px] md:text-[7px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100/50">
                {cat}
             </span>
           ))}
           {categories.length > 2 && (
             <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                +{categories.length - 2}
             </span>
           )}
        </div>

        {/* Price + All Plans */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 relative z-10">
           <div>
              <p className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">Starts At</p>
              <div className="flex items-baseline gap-0.5">
                 <span className="text-[9px] font-black text-indigo-600">₹</span>
                 <p className="text-lg md:text-xl font-black text-indigo-600 tracking-tighter leading-none italic">{cheapest?.price || 50}</p>
              </div>
              {/* Show all plan prices inline */}
              {sortedPlans.length > 1 && (
                <div className="flex items-center gap-1 mt-1">
                  {sortedPlans.slice(1, 3).map((plan: any, i: number) => (
                    <span key={i} className="text-[7px] font-bold text-slate-300 italic">₹{plan.price}</span>
                  ))}
                </div>
              )}
           </div>
           <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
              <Phone size={14} fill="currentColor" />
           </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [socialGroupLink, setSocialGroupLink] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All', icon: <Sparkles size={14} /> },
    { id: 'listener', label: 'Listener', icon: <Heart size={14} /> },
    { id: 'influencer', label: 'Influencer', icon: <TrendingUp size={14} /> },
    { id: 'mentor', label: 'Mentor', icon: <Star size={14} /> },
    { id: 'sex-health', label: 'Sex Health', icon: <ShieldCheck size={14} /> },
    { id: 'gm-expert', label: 'GM Expert', icon: <Zap size={14} /> },
    { id: 'romantic', label: 'Romantic', icon: <Sparkles size={14} /> },
    { id: 'other', label: 'Other', icon: <Users size={14} /> },
  ];

  const [isCallingAdmin, setIsCallingAdmin] = useState(false);
  const [showUrgentConfirm, setShowUrgentConfirm] = useState(false);
  const [urgentCallState, setUrgentCallState] = useState<'idle' | 'calling' | 'busy'>('idle');
  const [urgentTimer, setUrgentTimer] = useState(30);

  // Urgent Call — 30 second timer countdown
  useEffect(() => {
    if (urgentCallState !== 'calling') return;
    if (urgentTimer <= 0) {
      setUrgentCallState('busy');
      setIsCallingAdmin(false);
      return;
    }
    const interval = setInterval(() => {
      setUrgentTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [urgentCallState, urgentTimer]);

  const handleUrgentCall = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname) + '&reason=urgent_call');
      return;
    }

    // Validation: Admin can't make urgent calls
    if (user.roles?.includes('admin') || user.activeRole === 'admin') {
      setShowUrgentConfirm(false);
      alert('Admin अर्जेंट कॉल नहीं कर सकता। 🛑');
      return;
    }

    setShowUrgentConfirm(false);
    setIsCallingAdmin(true);
    setUrgentCallState('calling');
    setUrgentTimer(30);

    try {
      // 1. Trigger Twilio Voice Alert
      fetch('/api/twilio/urgent-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Urgent Help requested by ${user.displayName || 'User'}` })
      }).catch(console.error);

      // 2. Create Global Broadcast Call Session
      const resp = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          listenerId: 'all_admins',
          planId: 'urgent_help',
          planMinutes: 10,
          planPrice: 0,
          creditsUsed: 0
        })
      });

      const { sessionId, error } = await resp.json();
      if (error) throw new Error(error);

      // 3. Redirect to Call Page (admin picked up)
      router.push(`/call/${sessionId}`);
    } catch (err) {
      console.error('Urgent call failed:', err);
      // Timer will handle showing "busy" state
      if (urgentCallState === 'calling') {
        setUrgentCallState('busy');
        setIsCallingAdmin(false);
      }
    }
  };

  // Debounce search input — Instagram-style 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ⚡ REAL-TIME PROVIDER LIST — Single Firestore onSnapshot listener
  // Cost: 1 listener attachment + only re-fires when a provider doc changes
  // Client-side filtering for category & search = ZERO extra Firestore queries
  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);

    const q = query(
      collection(db, 'users'),
      where('roles', 'array-contains', 'provider'),
      where('isVerified', '==', true),
      where('isBlocked', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const providers = snapshot.docs.map(doc => {
        const data = doc.data();
        const plans = data.plans || [];
        const cheapestPlan = plans.length > 0 
          ? [...plans].sort((a: any, b: any) => a.price - b.price)[0] 
          : null;

        return {
          uid: doc.id,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          headline: data.headline,
          specialties: data.specialties || [],
          ratingAvg: data.ratingAvg || 0,
          ratingCount: data.ratingCount || 0,
          totalSessions: data.totalSessions || 0,
          isAvailable: data.isAvailable || false,
          isVerified: data.isVerified || false,
          gender: data.gender,
          age: data.age,
          cheapestPlan,
          plans,
          username: data.username,
          isBlocked: data.isBlocked || false,
          providerType: data.providerType,
          providerCategories: data.providerCategories || [data.providerType].filter(Boolean),
        };
      });

      setAllProviders(providers);
      setLoading(false);
      setErrorMsg(null);
    }, (err) => {
      console.error('Provider listener error:', err);
      setErrorMsg('Error loading providers');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // ← Single listener, never re-attached

  // ⚡ Fetch Social Group Link from admin settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
      if (snap.exists()) {
        setSocialGroupLink(snap.data().socialGroupLink || '');
      }
    });
    return () => unsub();
  }, []);

  // ⚡ CLIENT-SIDE FILTERING — Zero Firestore cost for category/search changes
  const providers = useMemo(() => {
    let filtered = allProviders;

    // Category filter — check providerType AND providerCategories array
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.providerType === selectedCategory || 
        (p.providerCategories && p.providerCategories.includes(selectedCategory))
      );
    }

    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter(p => 
        (p.displayName || '').toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [allProviders, selectedCategory, debouncedSearch]);


  const isSearchMode = searchQuery.trim().length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-32" suppressHydrationWarning>
      
      {/* Search Header */}
      <section className="relative group max-w-2xl mx-auto w-full px-2">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-[#ff4d6d] transition-colors" size={18} />
         <input 
           type="text" 
           placeholder="Search by name..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full h-14 glass bg-gradient-to-r from-[#ff4d6d]/5 to-white/50 border-2 border-[#ff4d6d]/20 rounded-3xl pl-12 pr-12 text-sm font-black shadow-xl shadow-rose-100 focus:outline-none focus:border-[#ff4d6d]/50 focus:ring-4 focus:ring-[#ff4d6d]/20 transition-all placeholder:text-rose-300 text-slate-800 tracking-tight"
         />
         {isSearchMode && (
           <button 
             onClick={() => setSearchQuery('')}
             className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all text-sm font-bold"
           >
              ✕
           </button>
         )}
      </section>

      {!isSearchMode && (
        <>
          {/* Hero Header & Action Banners — Backup Style (English Text) */}
          <section className="px-1 space-y-4 pt-2">
            <div className="space-y-0.5 px-2">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter">
                How are you feeling today? ✨
              </h2>
              <p className="text-[11px] text-slate-500 font-medium italic">We are here for you — without any judgment.</p>
            </div>

            {/* Urgent Help & Community Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
              {/* Urgent Help Banner */}
              <button 
                onClick={() => setShowUrgentConfirm(true)}
                disabled={isCallingAdmin}
                className="p-5 glass border-slate-200 bg-gradient-to-br from-[#ff4d6d]/10 to-transparent rounded-3xl border relative overflow-hidden group block w-full text-left transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 shadow-sm"
              >
                 <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                       {isCallingAdmin ? (
                         <Loader2 className="text-[#ff4d6d] w-6 h-6 animate-spin" />
                       ) : (
                         <Sparkles className="text-[#ff4d6d] w-6 h-6" />
                       )}
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <h4 className="text-sm font-black leading-none uppercase tracking-tighter italic text-slate-900">Urgent Help?</h4>
                       </div>
                       <p className="text-[9px] text-slate-500 font-medium tracking-tight">
                         Connect directly with Admin without waiting.
                       </p>
                    </div>
                    <div className="bg-[#ff4d6d] text-white p-2.5 rounded-xl shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                       <Heart size={16} className="fill-current" />
                    </div>
                 </div>
              </button>

              {/* WhatsApp Group Banner — Dynamic from Admin */}
              {socialGroupLink ? (
                <a 
                  href={socialGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 glass border-slate-200 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl border relative overflow-hidden group block shadow-sm hover:scale-[1.02] transition-transform"
                >
                   <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:-rotate-6 transition-transform border border-slate-50">
                         <MessageCircle className="text-emerald-500 w-6 h-6" />
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-black leading-none mb-1 uppercase tracking-tighter italic text-slate-900">Social Group</h4>
                         <p className="text-[9px] text-slate-500 font-medium tracking-tight">Join our community and connect with others.</p>
                      </div>
                      <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                         <Plus size={16} />
                      </div>
                   </div>
                </a>
              ) : (
                <div className="p-5 glass border-slate-200 bg-gradient-to-br from-slate-100/50 to-transparent rounded-3xl border relative overflow-hidden block shadow-sm opacity-50 cursor-not-allowed">
                   <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-50">
                         <MessageCircle className="text-slate-300 w-6 h-6" />
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-black leading-none mb-1 uppercase tracking-tighter italic text-slate-400">Social Group</h4>
                         <p className="text-[9px] text-slate-400 font-medium tracking-tight">Coming Soon...</p>
                      </div>
                      <div className="bg-slate-200 text-white p-2.5 rounded-xl">
                         <Plus size={16} />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </section>

          {/* Category Tabs */}
          <section className="sticky top-2 z-40 px-1">
             <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mask-fade-edges">
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border-2 ${
                     selectedCategory === cat.id
                       ? 'bg-slate-900 border-slate-900 text-white scale-105'
                       : 'glass bg-white/70 border-white text-slate-400 hover:border-slate-100'
                   }`}
                 >
                   <div className="flex items-center gap-2">
                      {cat.icon}
                      {cat.label}
                   </div>
                 </button>
               ))}
             </div>
          </section>
        </>
      )}

      {/* Results Grid */}
      <section className={`space-y-6 ${isSearchMode ? 'bg-white rounded-[3.5rem] p-6 shadow-2xl min-h-[60vh] animate-in slide-in-from-top-4' : ''}`}>
         {!isSearchMode && (
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse border-2 border-green-200" />
                 <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-slate-400">
                   {selectedCategory === 'all' ? 'Featured Today' : categories.find(c => c.id === selectedCategory)?.label + ' Experts'}
                 </h4>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                 {providers.length} found
              </span>
           </div>
         )}

         {isSearchMode && (
           <div className="px-2 mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Search results for "<span className="text-indigo-600">{searchQuery}</span>"
              </p>
           </div>
         )}

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white/40 animate-pulse rounded-[2rem] border border-slate-100" />
               ))
            ) : providers.length > 0 ? (
               providers.map(p => <ProviderCard key={p.uid} provider={p} />)
            ) : errorMsg ? (
               <div className="col-span-full py-24 text-center glass bg-rose-50/50 rounded-[3.5rem] border-dashed border-2 border-rose-100 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 text-rose-500">
                    <AlertCircle size={40} />
                  </div>
                  <p className="text-rose-600 font-black uppercase tracking-widest italic text-xs">Error: {errorMsg}</p>
                  <p className="text-rose-400 text-[10px] mt-2">हमारे सर्वर पर कोई तकनीकी समस्या है, कृपया एडमिन से संपर्क करें।</p>
               </div>
            ) : (
               <div className="col-span-full py-24 text-center glass bg-white/30 rounded-[3.5rem] border-dashed border-2 border-slate-100 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6">
                    <Sparkles className="text-slate-200" size={40} />
                  </div>
                  {isSearchMode ? (
                    <>
                      <p className="text-slate-400 font-black uppercase tracking-widest italic text-xs">इस नाम से कोई नहीं मिला 😕</p>
                      <p className="text-slate-300 text-[10px] mt-2">Try a different name or check the spelling.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 font-black uppercase tracking-widest italic text-xs">No experts in this category.</p>
                      <p className="text-slate-300 text-[10px] mt-2">Try selecting a different filter.</p>
                    </>
                  )}
               </div>
            )}
         </div>
      </section>

      {/* ═══ URGENT CALL POPUPS ═══ */}

      {/* 1. Confirmation Popup */}
      {showUrgentConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-[380px] bg-white rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 duration-500 text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Phone className="text-[#ff4d6d] w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Urgent Call?</h2>
              <p className="text-sm text-slate-400 font-medium italic">क्या आप अर्जेंट कॉल करने के लिए तैयार हैं?</p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleUrgentCall}
                className="w-full h-14 bg-[#ff4d6d] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Phone size={18} fill="currentColor" /> Yes, Connect Now
              </button>
              <button 
                onClick={() => setShowUrgentConfirm(false)}
                className="w-full h-14 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Calling / Timer Screen */}
      {urgentCallState === 'calling' && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gradient-to-b from-slate-900 to-indigo-950 p-6 animate-in fade-in duration-500">
          <div className="text-center space-y-10 animate-in zoom-in-95 duration-700">
            {/* Pulsing ring */}
            <div className="relative mx-auto w-40 h-40">
              <div className="absolute inset-0 rounded-full bg-[#ff4d6d]/20 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-[#ff4d6d]/30 animate-pulse" />
              <div className="absolute inset-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Phone size={40} className="text-white animate-bounce" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tighter">Calling Admin...</h2>
              <p className="text-indigo-300 font-medium italic text-sm">कृपया प्रतीक्षा करें — कनेक्ट हो रहा है</p>
            </div>
            {/* Timer */}
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-2xl font-black text-white tabular-nums">{urgentTimer}s</span>
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Remaining</span>
            </div>
            <button 
              onClick={() => { setUrgentCallState('idle'); setIsCallingAdmin(false); }}
              className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* 3. Admin Busy Popup */}
      {urgentCallState === 'busy' && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-[380px] bg-white rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 duration-500 text-center shadow-2xl">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="text-amber-500 w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Admin Busy 😔</h2>
              <p className="text-sm text-slate-400 font-medium italic leading-relaxed">अभी Admin व्यस्त हैं।<br />कृपया कुछ देर बाद दोबारा try करें।</p>
            </div>
            <button 
              onClick={() => setUrgentCallState('idle')}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Okay, Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
