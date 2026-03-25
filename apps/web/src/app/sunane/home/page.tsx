'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MOOD_TAGS, SPECIALTY_LABELS } from '@/types';
import type { ListenerCard as ListenerCardType, Specialty } from '@/types';
import { Search, Sparkles, Star, Phone, Heart, Filter } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

function ListenerCard({ listener }: { listener: ListenerCardType }) {
  const specialty = listener.specialties[0];
  
  return (
    <Link href={`/listener/${listener.username}`}>
      <div className="glass bg-white dark:bg-white/5 p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white dark:border-white/10 relative group transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center text-3xl shadow-inner overflow-hidden border border-white/50">
                {listener.avatarUrl?.includes(':') ? listener.avatarUrl.split(':')[1] : '👤'}
             </div>
             {listener.isAvailable && (
               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-[#0a0a0c] animate-pulse" />
             )}
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-amber-500 font-black text-sm">
                <Star size={14} className="fill-current" />
                <span>{listener.ratingAvg.toFixed(1)}</span>
             </div>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{listener.ratingCount} reviews</p>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <h3 className="text-lg font-black text-slate-800 dark:text-white truncate tracking-tighter uppercase">{listener.displayName}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{listener.headline || "Aapki dost hu, sab sunti hu 💙"}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
           <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-[9px] font-black text-[#ff4d6d] uppercase tracking-widest border border-rose-100 dark:border-rose-900/30">
              {SPECIALTY_LABELS[specialty as Specialty] || 'Expert'}
           </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Starts at</p>
              <p className="text-xl font-black text-[#ff4d6d] tracking-tighter leading-none">₹{listener.cheapestPlan?.price || 50}</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-[#ff4d6d] text-white flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-none group-hover:scale-110 transition-transform">
              <Phone size={18} />
           </div>
        </div>
      </div>
    </Link>
  );
}

export default function SunaneHomePage() {
  const [listeners, setListeners] = useState<ListenerCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Specialty | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchListeners = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'users'),
          where('roles', 'array-contains', 'sunne_wala'),
          where('isVerified', '==', true),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
          cheapestPlan: doc.data().plans?.sort((a: any, b: any) => a.price - b.price)[0] || null
        } as ListenerCardType));

        setListeners(fetched);
      } catch (err) {
        console.error('Error fetching listeners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListeners();
  }, []);

  const filteredListeners = listeners.filter(l => {
    const matchesMood = selectedMood ? l.specialties.includes(selectedMood) : true;
    const matchesSearch = searchQuery ? l.displayName.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesMood && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24">
      
      {/* Hero Section */}
      <section className="space-y-6 pt-4">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
            Kaisa mehsoos<br/>kar rahe ho? ✨
          </h2>
          <p className="text-sm text-slate-500 font-medium italic">Hum aapke liye hi yahan hain — bina kisi judge ke.</p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d6d] transition-colors" size={20} />
           <input 
             type="text" 
             placeholder="Dost dhundhein..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-16 glass bg-white dark:bg-white/5 border border-white dark:border-white/10 rounded-2xl px-14 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d6d]/20 transition-all"
           />
           <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 dark:bg-white/10 rounded-xl flex items-center justify-center text-slate-400">
              <Filter size={18} />
           </div>
        </div>

        {/* Categories / Mood Tags */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
          {MOOD_TAGS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(selectedMood === mood.id ? null : (mood.id as Specialty))}
              className={`flex-shrink-0 px-6 py-4 rounded-2xl text-xs font-black transition-all border-2 shadow-sm ${
                selectedMood === mood.id
                  ? 'bg-[#ff4d6d] border-[#ff4d6d] text-white scale-105'
                  : 'glass bg-white dark:bg-white/5 border-white dark:border-white/10 text-slate-500'
              }`}
            >
              <span className="mr-2">{mood.emoji}</span> {mood.label}
            </button>
          ))}
        </div>
      </section>

      {/* Urgent Help Banner */}
      <div className="p-6 md:p-10 glass bg-gradient-to-br from-[#ff4d6d]/10 to-transparent rounded-[2.5rem] md:rounded-[3.5rem] border border-white dark:border-white/10 relative overflow-hidden group">
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-[1.8rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
               <Sparkles className="text-[#ff4d6d] w-6 h-6 md:w-10 md:h-10" />
            </div>
            <div>
               <h4 className="text-xl md:text-2xl font-black dark:text-white leading-none mb-1 uppercase tracking-tighter">Urgent Help?</h4>
               <p className="text-[10px] md:text-sm text-slate-500 font-medium">Bina intezaar kiye kisi se judiye.</p>
            </div>
            <button className="ml-auto bg-white/40 dark:bg-white/5 p-3 md:p-5 rounded-xl border border-white/60 dark:border-white/10 hover:bg-white transition-colors">
               <Heart size={20} className="text-[#ff4d6d] fill-current" />
            </button>
         </div>
      </div>

      {/* Listener List */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Available Listeners</span>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 md:gap-8">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] glass bg-white/40 animate-pulse rounded-[2.5rem]" />
               ))
            ) : filteredListeners.length > 0 ? (
               filteredListeners.map(l => <ListenerCard key={l.uid} listener={l} />)
            ) : (
               <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-slate-100">
                  <Sparkles className="mx-auto mb-4 text-slate-200" size={48} />
                  <p className="text-slate-400 font-medium italic">Abhi koi dost nahi mila.</p>
               </div>
            )}
         </div>
      </section>
    </div>
  );
}
