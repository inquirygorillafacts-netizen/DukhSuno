'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MOOD_TAGS, SPECIALTY_LABELS, PROVIDER_TYPE_LABELS } from '@/types';
import type { ListenerCard as ListenerCardType, Specialty, ProviderType } from '@/types';
import { Search, Sparkles, Star, Phone, Heart, Filter, ShieldCheck, Play, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

function ProviderCard({ provider }: { provider: ListenerCardType }) {
  const specialty = provider.specialties?.[0];
  
  return (
    <Link href={`/p/${provider.uid}`}>
      <div className="glass bg-white p-4 rounded-[2.5rem] border border-white relative group transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
             <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-3xl shadow-inner overflow-hidden border border-white/50 group-hover:rotate-3 transition-transform">
                {provider.avatarUrl?.includes(':') ? provider.avatarUrl.split(':')[1] : '👤'}
             </div>
             {provider.isAvailable && (
               <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-green-500 rounded-full border-4 border-white animate-pulse" />
             )}
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-amber-500 font-black text-[10px]">
                <Star size={10} className="fill-current" />
                <span>{provider.ratingAvg?.toFixed(1) || '0.0'}</span>
             </div>
             <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">{provider.ratingCount || 0} reviews</p>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-black text-slate-900 truncate tracking-tight uppercase">{provider.displayName}</h3>
            {provider.isVerified && (
               <ShieldCheck size={14} fill="#3b82f6" className="text-white shrink-0" />
            )}
          </div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate italic">{provider.headline || "Digital Dost 💙"}</p>
        </div>

        {/* Categories / Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
           <span className="px-2.5 py-1 rounded-full bg-slate-50 text-[7px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">
              {SPECIALTY_LABELS[specialty as Specialty] || 'Expert'}
           </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
           <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Starts At</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-[10px] font-black text-[#ff4d6d]">₹</span>
                 <p className="text-xl font-black text-[#ff4d6d] tracking-tighter leading-none">{provider.cheapestPlan?.price || 50}</p>
              </div>
           </div>
           <div className="w-10 h-10 rounded-xl bg-[#ff4d6d] text-white flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 group-hover:rotate-6 transition-all">
              <Phone size={16} fill="currentColor" />
           </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const [providers, setProviders] = useState<ListenerCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All', icon: <Sparkles size={14} /> },
    { id: 'influencer', label: 'Influencer', icon: <TrendingUp size={14} /> },
    { id: 'mentor', label: 'Mentor/Coach', icon: <Star size={14} /> },
    { id: 'listener', label: 'Listener', icon: <Heart size={14} /> },
  ];

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchQuery) params.append('query', searchQuery);
        
        const resp = await fetch(`/api/listeners?${params.toString()}`);
        const data = await resp.json();
        
        if (data.listeners) {
          setProviders(data.listeners);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-32" suppressHydrationWarning>
      
      {/* Search Header */}
      <section className="relative group max-w-2xl mx-auto w-full">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d6d] transition-colors" size={18} />
         <input 
           type="text" 
           placeholder="Talash karein apne guide ko..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full h-14 glass bg-white/70 border-2 border-white rounded-3xl px-12 text-sm font-black shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-4 focus:ring-[#ff4d6d]/10 transition-all placeholder:text-slate-300 tracking-tight"
         />
         <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all">
            <Filter size={16} />
         </div>
      </section>

      {/* Hero Banner */}
      <section className="px-1">
         <div className="relative h-48 md:h-64 rounded-[3.5rem] bg-slate-900 overflow-hidden border-4 border-white shadow-2xl group">
             <img 
               src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200" 
               className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
               alt="Banner"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                   <div className="h-0.5 w-6 bg-[#ff4d6d] rounded-full" />
                   <p className="text-[10px] font-black text-[#ff4d6d] uppercase tracking-[0.4em]">Feature Selection</p>
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-none mb-4">
                  Dil Ki Baat, <br/> Sunne Koi <span className="text-[#ff4d6d]">Khaas</span>.
                </h3>
                <button className="w-fit px-6 py-2.5 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-[#ff4d6d] hover:text-white transition-all transition-bounce">
                  Explore Experts
                </button>
             </div>
         </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-2 z-40 px-1">
         <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mask-fade-edges">
           {categories.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setSelectedCategory(cat.id)}
               className={`flex-shrink-0 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border-2 ${
                 selectedCategory === cat.id
                   ? 'bg-slate-900 border-slate-900 text-white scale-105'
                   : 'glass bg-white/70 border-white text-slate-400 hover:border-slate-100'
               }`}
             >
               <div className="flex items-center gap-2.5">
                  {cat.icon}
                  {cat.label}
               </div>
             </button>
           ))}
         </div>
      </section>

      {/* Results Grid */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse border-2 border-green-200" />
               <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-slate-400">Trending Now</h4>
            </div>
            <Link href="/home" className="text-[10px] font-black text-[#ff4d6d] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
               Sab Dekhein <ArrowRight size={14} />
            </Link>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4.2] glass bg-white/40 animate-pulse rounded-[2.5rem]" />
               ))
            ) : providers.length > 0 ? (
               providers.map(p => <ProviderCard key={p.uid} provider={p} />)
            ) : (
               <div className="col-span-full py-24 text-center glass bg-white/30 rounded-[3.5rem] border-dashed border-2 border-slate-100 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6">
                    <Sparkles className="text-slate-200" size={40} />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest italic text-xs">Abhi koi upalabd nahi hai.</p>
                  <p className="text-slate-300 text-[10px] mt-2">Kripya tag ya search badlein.</p>
               </div>
            )}
         </div>
      </section>
    </div>
  );
}
