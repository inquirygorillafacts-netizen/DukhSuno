'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { MOOD_TAGS, SPECIALTY_LABELS } from '@/types';
import type { ListenerCard as ListenerCardType, Specialty } from '@/types';
import { Search, Sparkles, Star, Phone, Heart, Filter, MessageCircle, Plus, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { APP_CONFIG } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

function ListenerCard({ listener }: { listener: ListenerCardType }) {
  const specialty = listener.specialties[0];
  
  return (
    <Link href={`/listener/${listener.username}`}>
      <div className="glass bg-white p-4 rounded-3xl border border-white relative group transition-all duration-500 hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <div className="relative">
             <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl shadow-inner overflow-hidden border border-white/50">
                {listener.avatarUrl?.includes(':') ? listener.avatarUrl.split(':')[1] : '👤'}
             </div>
             {listener.isAvailable && (
               <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
             )}
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-amber-500 font-black text-xs">
                <Star size={12} className="fill-current" />
                <span>{listener.ratingAvg.toFixed(1)}</span>
             </div>
             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{listener.ratingCount} reviews</p>
          </div>
        </div>

        <div className="space-y-0.5 mb-3">
          <h3 className="text-sm font-black text-slate-800 truncate tracking-tighter uppercase">{listener.displayName}</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{listener.headline || "Aapki dost hu, sab sunti hu 💙"}</p>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
           <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[8px] font-black text-[#ff4d6d] uppercase tracking-widest border border-rose-100">
              {SPECIALTY_LABELS[specialty as Specialty] || 'Expert'}
           </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
           <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Starts at</p>
              <p className="text-lg font-black text-[#ff4d6d] tracking-tighter leading-none">₹{listener.cheapestPlan?.price || 50}</p>
           </div>
           <div className="w-8 h-8 rounded-lg bg-[#ff4d6d] text-white flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-110 transition-transform">
              <Phone size={14} />
           </div>
        </div>
      </div>
    </Link>
  );
}

export default function SunaneHomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [listeners, setListeners] = useState<ListenerCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Specialty | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [isCallingAdmin, setIsCallingAdmin] = useState(false);

  // Check Admin Presence
  useEffect(() => {
    let unsubscribe: () => void;

    const startPresenceListener = (uid: string) => {
      const adminPresenceRef = ref(rtdb, `presence/${uid}`);
      unsubscribe = onValue(adminPresenceRef, (snapshot) => {
        if (snapshot.exists()) {
          setIsAdminOnline(snapshot.val().online === true);
        } else {
          setIsAdminOnline(false);
        }
      });
    };

    if (APP_CONFIG.adminUid && !APP_CONFIG.adminUid.includes('PLACEHOLDER')) {
      startPresenceListener(APP_CONFIG.adminUid);
    } else {
      // Fallback: Find first admin in Firestore
      const findAdmin = async () => {
        const q = query(
          collection(db, 'users'),
          where('roles', 'array-contains', 'admin'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const adminId = snap.docs[0].id;
          startPresenceListener(adminId);
        }
      };
      findAdmin();
    }

    return () => unsubscribe?.();
  }, []);

  const handleUrgentCall = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname) + '&reason=urgent_call');
      return;
    }

    setIsCallingAdmin(true);

    try {
      // 1. Create Call Session (Always)
      const resp = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          listenerId: APP_CONFIG.adminUid,
          planId: 'urgent_help',
          planMinutes: 10,
          planPrice: 0,
          creditsUsed: 0
        })
      });

      const { sessionId, error } = await resp.json();
      if (error) throw new Error(error);

      // 2. If Admin is Offline, Trigger Twilio Wake-up Call
      if (!isAdminOnline) {
        await fetch('/api/twilio/urgent-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Urgent Help requested by ${user.displayName || 'User'}` })
        });
      }

      // 3. Redirect to Call Page (Always show "Calling..." screen)
      router.push(`/call/${sessionId}`);
    } catch (err) {
      console.error('Urgent call failed:', err);
      alert('Koshish nakaam rahi. Kripya thodi der baad koshish karein.');
    } finally {
      setIsCallingAdmin(false);
    }
  };

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
    <div className="space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24" suppressHydrationWarning>
      
      {/* Hero Section */}
      <section className="space-y-4 pt-2">
        <div className="space-y-0.5">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter">
            Kaisa mehsoos kar rahe ho? ✨
          </h2>
          <p className="text-[11px] text-slate-500 font-medium italic">Hum aapke liye hi yahan hain — bina kisi judge ke.</p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d6d] transition-colors" size={16} />
           <input 
             type="text" 
             placeholder="Dost dhundhein..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-11 glass bg-white border border-white rounded-xl px-12 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d6d]/20 transition-all"
           />
           <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <Filter size={14} />
           </div>
        </div>

        {/* Categories / Mood Tags */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {MOOD_TAGS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(selectedMood === mood.id ? null : (mood.id as Specialty))}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border shadow-sm ${
                selectedMood === mood.id
                  ? 'bg-[#ff4d6d] border-[#ff4d6d] text-white scale-105'
                  : 'glass bg-white border-white text-slate-500'
              }`}
            >
              <span className="mr-1.5">{mood.emoji}</span> {mood.label}
            </button>
          ))}
        </div>
      </section>

      {/* Urgent Help & Community Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Urgent Help Banner */}
        <button 
          onClick={handleUrgentCall}
          disabled={isCallingAdmin}
          className="p-5 glass bg-gradient-to-br from-[#ff4d6d]/10 to-transparent rounded-3xl border border-white relative overflow-hidden group block w-full text-left transition-transform active:scale-95 disabled:opacity-70"
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
                   <h4 className="text-sm font-black leading-none uppercase tracking-tighter italic">Urgent Help?</h4>
                   {isAdminOnline && (
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Admin is Online" />
                   )}
                 </div>
                 <p className="text-[9px] text-slate-500 font-medium">
                   Bina intezaar kiye Admin se judiye.
                 </p>
              </div>
              <div className="bg-[#ff4d6d] text-white p-2.5 rounded-xl shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                 <Heart size={16} className="fill-current" />
              </div>
           </div>
        </button>

        {/* WhatsApp Group Banner */}
        <a 
          href={APP_CONFIG.whatsappGroup}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 glass bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl border border-white relative overflow-hidden group block"
        >
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:-rotate-6 transition-transform">
                 <MessageCircle className="text-emerald-500 w-6 h-6" />
              </div>
              <div className="flex-1">
                 <h4 className="text-sm font-black leading-none mb-1 uppercase tracking-tighter italic">Social Group</h4>
                 <p className="text-[9px] text-slate-500 font-medium tracking-tight">Community join karein aur baatein karein.</p>
              </div>
              <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                 <Plus size={16} />
              </div>
           </div>
        </a>
      </div>

      {/* YouTube / Tutorial Section */}
      <section className="px-2">
         <a 
           href={APP_CONFIG.youtubeTutorial}
           target="_blank"
           rel="noopener noreferrer"
           className="w-full aspect-video rounded-[2.5rem] bg-slate-900 overflow-hidden relative group block border-4 border-white shadow-2xl"
         >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800" 
              alt="How it works"
              className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
               <div className="w-16 h-16 bg-[#ff4d6d] rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-125 transition-transform duration-500">
                  <Play size={32} className="ml-1 fill-current" />
               </div>
               <p className="mt-4 text-white font-black text-xs uppercase tracking-[0.3em]">Watch Tutorial</p>
            </div>
            <div className="absolute bottom-6 left-8 z-20">
               <p className="text-white font-black text-lg italic tracking-tighter leading-none mb-1">DukhSuno Kaise Use Karein?</p>
               <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Learn in 2 minutes</p>
            </div>
         </a>
      </section>

      {/* Listener List */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Available Listeners</span>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] glass bg-white/40 animate-pulse rounded-3xl" />
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
