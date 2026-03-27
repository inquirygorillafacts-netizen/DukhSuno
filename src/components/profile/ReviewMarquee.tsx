'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Star, MessageCircle, Quote } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  displayName?: string;
}

export function ReviewMarquee({ providerId }: { providerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'sessions'),
          where('listenerId', '==', providerId),
          where('status', '==', 'completed'),
          orderBy('rating', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            rating: doc.data().rating, 
            comment: doc.data().ratingComment 
          } as Review))
          .filter(r => r.comment && r.comment.length > 5);
        
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    if (providerId) fetchReviews();
  }, [providerId]);

  if (loading) return null;
  if (reviews.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-10 group">
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

      {/* Marquee Container */}
      <div className="flex animate-marquee hover:pause whitespace-nowrap gap-6">
        {[...reviews, ...reviews].map((review, i) => (
          <div 
            key={`${review.id}-${i}`} 
            className="inline-block w-[350px] whitespace-normal bg-white p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform cursor-pointer group"
          >
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={14} 
                  fill={s <= review.rating ? '#fbbf24' : 'transparent'} 
                  className={s <= review.rating ? 'text-amber-400' : 'text-slate-100'} 
                />
              ))}
            </div>
            
            <div className="relative">
              <Quote className="absolute -top-4 -left-2 text-slate-100 rotate-180" size={32} />
              <p className="text-[15px] font-medium text-slate-600 leading-relaxed italic relative z-10">
                "{review.comment}"
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-100">
                 USER
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anonymous Seeker</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
