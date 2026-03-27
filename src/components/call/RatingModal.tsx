'use client';

import { useState } from 'react';
import { Heart, Star, CheckCircle2, ArrowRight, X, Sparkles, MessageCircle } from 'lucide-react';

export function RatingModal({ onSubmit, onSkip }: { onSubmit: (rating: number, comment: string) => void, onSkip: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    // Delay the actual submission to show the thanks slide
    setTimeout(() => {
      onSubmit(rating, comment);
    }, 2500);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500 p-6">
        <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-12 text-center space-y-8 animate-in zoom-in duration-500 shadow-2xl">
          <div className="relative">
            <div className="h-32 w-32 bg-rose-50 rounded-full mx-auto flex items-center justify-center animate-bounce">
              <span className="text-7xl">🙏</span>
            </div>
            <div className="absolute top-0 right-1/4 animate-ping">
              <Sparkles className="text-amber-400" size={32} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Thank You! ✨</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Aapki rating se kisi ki madad hogi.</p>
          </div>

          <div className="pt-4">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">
               <CheckCircle2 size={12} /> Sabmit Ho Gaya!
             </div>
          </div>
        </div>
      </div>
    );
  }

  const getStarColor = (star: number) => {
    const active = (hoverRating || rating) >= star;
    if (!active) return 'text-slate-100';
    
    // Colorful gradient logic
    switch(star) {
      case 1: return 'text-rose-400';
      case 2: return 'text-orange-400';
      case 3: return 'text-amber-400';
      case 4: return 'text-yellow-400';
      case 5: return 'text-emerald-400';
      default: return 'text-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500 p-0 sm:p-4">
      <div className="w-full max-w-md bg-white sm:rounded-[3rem] rounded-t-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 relative">
        
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-10 sm:hidden" />
        
        <button onClick={onSkip} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={24} strokeWidth={3} />
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
             <Star className="text-amber-400 fill-current" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
            Call kaisa tha? ❤️
          </h2>
          <p className="text-[14px] text-slate-400 font-medium italic">
            Aapki imaandari se doosron ko sahi listener milta hai.
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className={`text-5xl transition-all transform hover:scale-125 active:scale-90 ${getStarColor(star)} ${rating >= star ? 'animate-star-bounce' : ''}`}
            >
              {star <= (hoverRating || rating) ? '★' : '☆'}
            </button>
          ))}
        </div>

        {/* Comment area */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="relative group">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Kuch aur kehna chahenge? (Optional)"
              className="w-full h-32 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-slate-900 text-[15px] font-medium resize-none focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-100 transition-all placeholder:text-slate-300"
            />
            <MessageCircle className="absolute bottom-6 right-6 text-slate-200 group-focus-within:text-rose-200 transition-colors" size={24} />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`flex-1 h-18 bg-slate-900 text-white rounded-[2rem] font-black text-[15px] transition-all shadow-2xl shadow-slate-200 uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${
              rating === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] hover:bg-black'
            }`}
          >
            <span>Sabmit Karein</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// End of file
