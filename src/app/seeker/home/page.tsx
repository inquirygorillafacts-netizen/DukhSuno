'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MOOD_TAGS, SPECIALTY_LABELS, PROVIDER_TYPE_LABELS } from '@/types';
import type { ListenerCard as ListenerCardType, Specialty, ProviderType } from '@/types';
import { Search, Sparkles, Star, Phone, Heart, Filter, ShieldCheck, Play, ArrowRight, TrendingUp, Zap, AlertCircle, Users } from 'lucide-react';
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
             <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{provider.ratingCount || 0} reviews</p>
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
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All', icon: <Sparkles size={14} /> },
    { id: 'listener', label: 'Listener', icon: <Zap size={14} /> },
    { id: 'influencer', label: 'Influencer', icon: <TrendingUp size={14} /> },
    { id: 'mentor', label: 'Mentor', icon: <Star size={14} /> },
    { id: 'coach', label: 'Coach', icon: <ShieldCheck size={14} /> },
    { id: 'expert', label: 'Expert', icon: <Sparkles size={14} /> },
    { id: 'consultant', label: 'Consultant', icon: <Users size={14} /> },
    { id: 'counselor', label: 'Counselor', icon: <Heart size={14} /> },
  ];

  // Debounce search input — Instagram-style 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (debouncedSearch.trim()) params.append('query', debouncedSearch.trim());
        
        const resp = await fetch(`/api/providers?${params.toString()}`);
        const data = await resp.json();
        
        if (resp.status === 500) {
          setErrorMsg(data.error || 'Server error fetching providers');
        } else if (data.listeners) {
          setProviders(data.listeners);
          setErrorMsg(null);
        }
      } catch (err: any) {
        console.error('Error fetching providers:', err);
        setErrorMsg('Network error fetching providers');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [selectedCategory, debouncedSearch]);

  const isSearchMode = searchQuery.trim().length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-32" suppressHydrationWarning>
      
      {/* Search Header */}
      <section className="relative group max-w-2xl mx-auto w-full">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
         <input 
           type="text" 
           placeholder="Search by name..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full h-14 glass bg-white/70 border-2 border-white rounded-3xl px-12 text-sm font-black shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder:text-slate-300 tracking-tight"
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
          {/* Hero Banner — Improved */}
          <section className="px-1">
             <div className="relative h-52 md:h-72 rounded-[3.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden border-4 border-white shadow-2xl group">
                 {/* Animated decorative blobs */}
                 <div className="absolute inset-0 overflow-hidden">
                   <div className="absolute top-[-20%] left-[-10%] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob" />
                   <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-violet-500/15 rounded-full blur-[80px] animate-blob-delay" />
                   <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px] animate-blob" />
                 </div>

                 <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="h-0.5 w-8 bg-indigo-400 rounded-full" />
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">BigSuno Platform</p>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-[0.95] mb-5 uppercase">
                      Expert Advice, <br/> Verified <span className="text-indigo-400">Insights</span>.
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-5 max-w-xs leading-relaxed">
                      Connect with verified professionals for anonymous, secure consultations.
                    </p>
                    <button className="w-fit px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all active:scale-95">
                      Explore Specialists ✨
                    </button>
                 </div>

                 {/* Floating stats on desktop */}
                 <div className="absolute bottom-8 right-8 hidden md:flex gap-3 z-10">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl">
                       <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">Verified</p>
                       <p className="text-lg font-black text-white italic tracking-tighter">100+ Experts</p>
                    </div>
                 </div>
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
    </div>
  );
}
