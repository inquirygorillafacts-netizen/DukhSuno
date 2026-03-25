'use client';

import { useState } from 'react';

export function RatingModal({ onSubmit, onSkip }: { onSubmit: (rating: number, comment: string) => void, onSkip: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-md animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-md glass-container border-white/40 sm:rounded-main rounded-t-main p-8 shadow-2xl animate-slide-up sm:animate-zoom-in">
        
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8 sm:hidden" />
        
        <div className="text-center">
          <h2 className="text-[28px] font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Call kaisa tha? ✨
          </h2>
          <p className="text-[15px] text-white/60 font-medium mt-2">
            Aapki rating se kisi aur ki madad ho sakti hai.
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-3 my-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className={`text-4xl transition-all transform hover:scale-110 active:scale-95 ${
                (hoverRating || rating) >= star ? 'text-warning' : 'text-border filter grayscale'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Comment area */}
        <div className="mb-8 opacity-0 animate-fade-in" style={{ animationTimingFunction: 'ease-out', animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kuch aur kehna chahenge? (Optional)"
            className="w-full h-28 p-4 rounded-2xl bg-white/10 border border-white/20 text-white text-[15px] resize-none focus:outline-none focus:ring-4 focus:ring-accent/10 placeholder:text-white/30 transition-all"
          />
        </div>

        <div className="flex gap-4">
          <button onClick={onSkip} className="flex-1 h-14 rounded-2xl glass-container border-white/20 text-white font-black text-[15px] hover:bg-white/10 transition-all uppercase tracking-widest">
            Baad mein
          </button>
          <button
            onClick={() => onSubmit(rating, comment)}
            disabled={rating === 0}
            className={`flex-1 h-14 rounded-2xl btn-primary text-white font-black text-[15px] transition-all shadow-xl shadow-accent/20 uppercase tracking-widest ${
              rating === 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
