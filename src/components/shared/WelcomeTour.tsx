'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Shield, Wallet, Users, ArrowRight, X, Phone, CheckCircle2, Star, Zap } from 'lucide-react';

interface WelcomeTourProps {
  role: 'provider' | 'seeker';
  onClose: () => void;
}

export default function WelcomeTour({ role, onClose }: WelcomeTourProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = role === 'provider' ? [
    {
      title: "Paisa Kamaein... ❤️",
      description: "Dusro ki baatein sun kar aap mahine ke ₹20,000 se ₹30,000 tak kama sakte hain. Aaj hi shuru karein.",
      icon: <Wallet size={32} className="text-emerald-500" />,
      tag: "EARNINGS",
      color: "bg-emerald-50",
      accent: "bg-emerald-500"
    },
    {
      title: "Aapki Privacy, Hamara Vaada 🔒",
      description: "BigSuno par aapka mobile number aur asli naam kabhi kisi ko nahi dikhaya jayega. Be-khauf baat karein.",
      icon: <Shield size={32} className="text-indigo-500" />,
      tag: "100% SECURE",
      color: "bg-indigo-50",
      accent: "bg-indigo-500"
    },
    {
      title: "Bharat Ki Sabse Badi Community 🇮🇳",
      description: "Hazaaroo log rozana BigSuno par sukoon paate hain. Aap bhi is nek kaam ka hissa banein.",
      icon: <Users size={32} className="text-rose-500" />,
      tag: "COMMUNITY",
      color: "bg-rose-50",
      accent: "bg-[#ff4d6d]"
    }
  ] : [
    {
      title: "Dil Ki Har Baat Kahien 🛡️",
      description: "Yahan aap bina kisi darr ke baat kar sakte hain. Aapka bharosa hamari sabse badi taqat hai.",
      icon: <Shield size={32} className="text-rose-500" />,
      tag: "SAFE SPACE",
      color: "bg-rose-50",
      accent: "bg-[#ff4d6d]"
    },
    {
      title: "Bharat Ka Sabse Masoom App 🤝",
      description: "Hazaroo log rozana sukoon ki talash mein yahan aate hain. Har bhasha aur har rajya ke dost milenge.",
      icon: <Users size={32} className="text-indigo-500" />,
      tag: "MOST TRUSTED",
      color: "bg-indigo-50",
      accent: "bg-indigo-500"
    },
    {
      title: "Sukoon Paane Ki Manzil ✨",
      description: "Apne dil ka bojh halka karein aur khush rahein. BigSuno hamesha aapke saath hai.",
      icon: <Heart size={32} className="text-[#ff4d6d]" />,
      tag: "HAPPY LIVES",
      color: "bg-rose-50",
      accent: "bg-[#ff4d6d]"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-2xl"
      />
      
      {/* Card Container */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-[440px] bg-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center p-10 md:p-12 z-10 border border-slate-100"
      >
        {/* Dynamic Progress Indicator */}
        <div className="absolute top-0 left-0 w-full h-2 flex">
           {slides.map((_, i) => (
             <div 
               key={i} 
               className={`h-full transition-all duration-700 ease-in-out ${i <= currentSlide ? slides[currentSlide].accent : 'bg-slate-100'}`}
               style={{ width: `${100 / slides.length}%` }}
             />
           ))}
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90 border border-slate-100"
        >
          <X size={20} />
        </button>

        {/* Floating Decoration */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-50/50 rounded-full blur-3xl" />

        <AnimatePresence mode="wait">
           <motion.div 
             key={currentSlide}
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: -20, opacity: 0 }}
             transition={{ duration: 0.4, ease: "circOut" }}
             className="flex-1 flex flex-col items-center text-center space-y-10 relative z-10"
           >
              {/* Badge */}
              <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${slides[currentSlide].color} ${slides[currentSlide].accent.replace('bg-', 'text-')} border border-white shadow-sm`}>
                 {slides[currentSlide].tag}
              </div>

              {/* Icon Circle */}
              <div className="relative">
                 <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-inner relative z-10 overflow-hidden ${slides[currentSlide].color}`}>
                    {slides[currentSlide].icon}
                    <motion.div 
                       animate={{ 
                         scale: [1, 1.2, 1],
                         rotate: [0, 5, -5, 0]
                       }}
                       transition={{ duration: 4, repeat: Infinity }}
                       className="absolute inset-0 bg-white/40 blur-xl pointer-events-none"
                    />
                 </div>
                 <Sparkles className="absolute -top-2 -right-2 text-amber-400 w-6 h-6 animate-pulse" />
              </div>
              
              {/* Text Content */}
              <div className="space-y-4">
                 <h2 className="text-[28px] md:text-[32px] font-black text-slate-900 leading-tight tracking-tighter uppercase italic">
                   {slides[currentSlide].title}
                 </h2>
                 <p className="text-slate-500 text-[15px] md:text-[16px] font-medium leading-relaxed italic px-2">
                   "{slides[currentSlide].description}"
                 </p>
              </div>
           </motion.div>
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="w-full mt-12 space-y-8 relative z-10">
           <button 
              onClick={handleNext}
              className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black text-[15px] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 transition-all active:scale-95 group hover:bg-black uppercase tracking-[0.2em]"
           >
              <span>{currentSlide === slides.length - 1 ? 'Chaliye Shuru Karein' : 'Agla Step'}</span>
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
           </button>

           <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1 opacity-20">
                 <Star size={10} className="fill-current text-indigo-500" />
                 <Star size={10} className="fill-current text-indigo-500" />
                 <Star size={10} className="fill-current text-indigo-500" />
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Official Onboarding</p>
              <div className="flex items-center gap-1 opacity-20">
                 <Star size={10} className="fill-current text-indigo-500" />
                 <Star size={10} className="fill-current text-indigo-500" />
                 <Star size={10} className="fill-current text-indigo-500" />
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
