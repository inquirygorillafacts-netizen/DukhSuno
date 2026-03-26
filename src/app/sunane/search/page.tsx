'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    SlidersHorizontal, 
    X, 
    Star, 
    ShieldCheck, 
    Heart, 
    Zap, 
    Timer,
    MessageCircle,
    LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { SPECIALTY_LABELS, MOOD_TAGS } from '@/types';
import type { Specialty, Gender, ListenerCard } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

export default function SunaneSearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [listeners, setListeners] = useState<ListenerCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        gender: '' as Gender | '',
        specialty: '' as Specialty | '',
    });

    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('roles', 'array-contains', 'sunne_wala'),
            limit(12)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as ListenerCard));
            setListeners(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredListeners = listeners.filter(l => 
        (l.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         l.headline?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedMood || l.specialties?.includes(selectedMood as Specialty))
    );

    return (
        <div className="min-h-screen space-y-8 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="relative p-10 rounded-[3rem] bg-rose-50 border border-rose-100 overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-200/40 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4 italic uppercase">
                            Koi Mil Jayega Jo <span className="text-rose-600">Samjhega</span> ❤️
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight leading-relaxed">
                            Dil khol kar baat karein. Humare Verified Listeners aapki baat sunne aur samajhne ke liye taiyaar hain.
                        </p>
                    </div>
                    <div className="flex-1 max-w-md relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 group-focus-within:text-rose-600 transition-colors">
                            <Search size={20} />
                        </div>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Specialty ya naam se dhundhein..."
                            className="w-full h-16 bg-white border border-rose-100 rounded-3xl pl-12 pr-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all shadow-xl shadow-rose-900/5 uppercase tracking-tight"
                        />
                    </div>
                </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Heart size={14} className="text-rose-400" />
                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Aaj Kaisa Feel Kar Rahe Hain?</h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {MOOD_TAGS.map((mood) => (
                        <button 
                            key={mood.id}
                            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                            className={`flex flex-col items-center gap-2 p-6 rounded-[2.5rem] border transition-all min-w-[120px] ${
                                selectedMood === mood.id 
                                ? 'bg-rose-900 text-white border-rose-800 shadow-2xl scale-105' 
                                : 'bg-white border-slate-100 text-slate-900 hover:border-rose-200'
                            }`}
                        >
                            <span className="text-3xl">{mood.emoji}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{mood.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Listeners Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={14} className="text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Verified Listeners</h3>
                    </div>
                    <button className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-all">
                        <SlidersHorizontal size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-[280px] rounded-[3rem] bg-slate-100 animate-pulse" />
                        ))
                    ) : filteredListeners.map((l) => (
                        <ListenerSearchCard key={l.uid} listener={l} />
                    ))}
                    {filteredListeners.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center rounded-[3rem] border-2 border-dashed border-slate-100 italic">
                             <Search size={40} className="mx-auto mb-4 text-slate-100" />
                             <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Dukh ke saathi abhi busy hain... <br/>Kuch aur search karein.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ListenerSearchCard({ listener }: { listener: ListenerCard }) {
    return (
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            {/* Availability Badge */}
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                listener.isAvailable 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
               {listener.isAvailable ? 'Online' : 'Shorter Session'}
            </div>

            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-rose-50 flex items-center justify-center text-3xl shadow-inner border border-rose-100 group-hover:bg-rose-100 transition-colors">
                        {listener.avatarUrl || '👤'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                             <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{listener.displayName}</h4>
                             {listener.isVerified && <ShieldCheck size={16} className="text-rose-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[150px]">{listener.headline || "Abhi batane ke liye kuch nahi."}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {listener.specialties?.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg border border-slate-100 uppercase tracking-tighter">
                            #{s}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-500 fill-amber-500" />
                            <span className="text-[11px] font-black text-slate-900">{listener.ratingAvg || "4.9"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                            <MessageCircle size={12} />
                            <span className="text-[11px] font-black">{listener.totalSessions || "120"}+</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Start at</p>
                        <p className="text-xl font-black text-rose-600 tracking-tighter leading-none italic">₹{listener.cheapestPlan?.price || "5"}/m</p>
                    </div>
                </div>

                <Link 
                    href={`/sunane/listener/${listener.username || listener.uid}`}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] group-hover:bg-rose-600 transition-colors shadow-xl active:scale-95"
                >
                    <Zap size={14} className="group-hover:animate-pulse" /> Baat Karein
                </Link>
            </div>
        </div>
    );
}
