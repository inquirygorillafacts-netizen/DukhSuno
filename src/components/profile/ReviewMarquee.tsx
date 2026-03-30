'use client';

import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Star, Quote, Heart } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  displayName?: string;
  createdAt?: any;
}

export function ReviewMarquee({ providerId }: { providerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'sessions'),
          where('listenerId', '==', providerId),
          where('status', '==', 'completed'),
          orderBy('rating', 'desc'),
          limit(15)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            rating: doc.data().rating, 
            comment: doc.data().ratingComment,
            createdAt: doc.data().endedAt
          } as Review))
          .filter(r => r.comment && r.comment.length > 3);
        
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    if (providerId) fetchReviews();
  }, [providerId]);

  // Auto-scroll logic for marquee effect
  useEffect(() => {
    if (loading || reviews.length === 0 || isPaused) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    const step = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += 0.8; // Move 1px per frame roughly
        
        // Loop back to start seamlessly
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth / 2)) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [loading, reviews, isPaused]);

  if (loading) return (
     <div className="w-full flex items-center justify-center py-20 animate-pulse">
        <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Loading Experience Stories...</p>
     </div>
  );
  if (reviews.length === 0) return null;

  // Duplicate for seamless loop if we have enough items
  const displayReviews = [...reviews, ...reviews];

  return (
    <div className="relative w-full overflow-hidden py-6 select-none bg-slate-50/50 rounded-[3rem] mt-10">
      
      <div className="flex flex-col mb-6 px-8">
         <div className="flex items-center gap-2 mb-1">
             <Heart size={14} className="text-indigo-600 fill-indigo-600" />
             <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Client Experiences</h3>
         </div>
         <p className="text-[10px] text-slate-400 font-bold italic tracking-tight">Real feedback from recent consultations 💙</p>
      </div>

      {/* Dynamic Gradient Garnish (Desktop) */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="hidden md:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Marquee Container (Draggable) */}
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex overflow-x-auto no-scrollbar gap-5 px-8 relative z-0 scroll-smooth active:cursor-grabbing pb-8"
        style={{ scrollBehavior: 'smooth' }}
      >
        {displayReviews.map((review, i) => (
          <div 
            key={`${review.id}-${i}`} 
            className="flex-shrink-0 w-[280px] md:w-[320px] bg-white p-7 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/40 hover:translate-y-[-10px] transition-all cursor-grab"
          >
            <div className="flex items-center gap-0.5 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={12} 
                  fill={s <= review.rating ? '#fbbf24' : 'transparent'} 
                  className={s <= review.rating ? 'text-amber-400' : 'text-slate-100'} 
                />
              ))}
            </div>
            
            <div className="relative min-h-[80px]">
              <Quote className="absolute -top-3 -left-3 text-indigo-50/50" size={32} />
              <p className="text-[14px] md:text-[15px] font-bold text-slate-700 leading-relaxed italic relative z-10">
                "{review.comment}"
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[11px] font-black text-indigo-400 border border-indigo-100/50">
                     S
                   </div>
                   <div className="flex flex-col">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none mb-1">Anonymous Seeker</p>
                      <p className="text-[9px] font-bold text-slate-400 italic">Verified Client</p>
                   </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
