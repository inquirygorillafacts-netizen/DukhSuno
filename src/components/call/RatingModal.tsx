'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, CheckCircle2, ArrowRight, X, Sparkles, 
  MessageCircle, Send, BadgeCheck 
} from 'lucide-react';

interface RatingModalProps {
  onSubmit: (rating: number, comment: string) => void;
  onSkip: () => void;
}

export function RatingModal({ onSubmit, onSkip }: RatingModalProps) {
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

  const getStarColor = (star: number) => {
    const active = (hoverRating || rating) >= star;
    if (!active) return 'text-slate-100';
    
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
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[6000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onSkip}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="rating-form"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="w-full max-w-md bg-white rounded-t-[3rem] md:rounded-[3rem] relative z-10 shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Dynamic Header Color based on rating */}
              <motion.div 
                animate={{ 
                  backgroundColor: rating === 0 ? "#f8fafc" : 
                                   rating === 1 ? "#fb7185" :
                                   rating === 2 ? "#fb923c" :
                                   rating === 3 ? "#fbbf24" :
                                   rating === 4 ? "#facc15" : "#34d399"
                }}
                className="h-2 w-full transition-colors duration-500" 
              />
              
              <div className="p-10 md:p-12 space-y-8">
                 {/* Close/Skip Button */}
                 <button 
                    onClick={onSkip} 
                    className="absolute top-8 right-8 w-11 h-11 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
                 >
                    <X size={20} />
                 </button>

                 {/* Title Section */}
                 <div className="text-center space-y-4">
                    <div className="relative inline-block">
                       <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-slate-100 relative z-10 overflow-hidden">
                          <motion.div
                            key={hoverRating || rating}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            className="text-4xl"
                          >
                             {(hoverRating || rating) === 0 ? '💬' : 
                              (hoverRating || rating) === 1 ? '😞' :
                              (hoverRating || rating) === 2 ? '😐' :
                              (hoverRating || rating) === 3 ? '😊' :
                              (hoverRating || rating) === 4 ? '✨' : '🔥'}
                          </motion.div>
                       </div>
                       <Sparkles className="absolute -top-2 -right-2 text-amber-400 w-6 h-6 animate-pulse" />
                    </div>
                    
                    <div className="space-y-1">
                       <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                         Call Kaisa Tha?
                       </h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Aapka feedback humare liye maayne rakhta hai</p>
                    </div>
                 </div>

                 {/* Rating Stars */}
                 <div className="flex items-center justify-center gap-3 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className={`text-6xl transition-all relative transform hover:scale-125 active:scale-90 ${getStarColor(star)}`}
                      >
                        <span className="relative z-10">{star <= (hoverRating || rating) ? '★' : '☆'}</span>
                        {rating === star && (
                           <motion.div 
                              layoutId="activeStar"
                              className="absolute inset-0 bg-amber-100/30 blur-xl rounded-full -z-10"
                           />
                        )}
                      </button>
                    ))}
                 </div>

                 {/* Comment Area */}
                 <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300">Kuch aur kehna hai?</label>
                       <MessageCircle size={14} className="text-slate-200" />
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Comment bhariye... (Optional)"
                      className="w-full h-32 p-6 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 text-slate-900 text-[15px] font-medium resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all placeholder:text-slate-300 shadow-inner"
                    />
                 </div>

                 {/* Action Button */}
                 <div className="pt-2">
                    <button 
                      onClick={handleSubmit}
                      disabled={rating === 0}
                      className="w-full h-20 bg-slate-900 text-white rounded-[2.5rem] font-black text-[16px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 transition-all active:scale-95 group hover:bg-black disabled:opacity-20 disabled:grayscale"
                    >
                      <span>Sabmit Karein</span>
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="rating-success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[4rem] p-12 text-center space-y-10 relative z-10 shadow-2xl border border-slate-100 m-4"
            >
              <div className="relative inline-block mt-4">
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="h-32 w-32 bg-emerald-50 rounded-[3rem] mx-auto flex items-center justify-center shadow-inner border border-emerald-100"
                >
                  <BadgeCheck size={64} className="text-emerald-500" />
                </motion.div>
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-4 border-2 border-dashed border-emerald-100 rounded-[3.5rem] opacity-40" 
                />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-[34px] md:text-[38px] font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  Shukriya! ✨
                </h2>
                <div className="flex flex-col items-center gap-2">
                   <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Feedback Jamah Ho Gaya Hai</p>
                   <div className="h-1 w-12 bg-emerald-500 rounded-full" />
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center gap-4 opacity-40">
                 <div className="flex items-center gap-2">
                    <Star size={10} className="fill-current text-amber-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">BigSuno Quality Check</span>
                    <Star size={10} className="fill-current text-amber-400" />
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
