'use client';

import React, { useState } from 'react';
import { Sparkles, Star, ShieldCheck, Wallet, ArrowRight, ArrowLeft } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Welcome to BigSuno ✨',
    subtitle: 'A Global Corporate Vision',
    description: 'Join a premium network of professional consultants and strategic experts driving global impact.',
    icon: <ShieldCheck size={48} className="text-indigo-600 animate-pulse" />,
    color: 'from-slate-50 to-indigo-50',
  },
  {
    id: 2,
    title: 'Define Your Path 🌟',
    subtitle: 'Consultant, Coach, or Specialist',
    description: 'Choose your professional niche and leverage your expertise to solve high-value business challenges.',
    icon: <Star size={48} className="text-indigo-600" />,
    color: 'from-slate-50 to-indigo-50',
  },
  {
    id: 3,
    title: 'Global Revenue Scale 💸',
    subtitle: 'Monetize Your Expertise',
    description: 'Build a high-yield professional practice with transparent earnings and seamless global payments.',
    icon: <Wallet size={48} className="text-indigo-600" />,
    color: 'from-slate-50 to-indigo-50',
  },
  {
    id: 4,
    title: 'Trusted Certification ✅',
    subtitle: 'Build Professional Authority',
    description: 'Get officially certified by our board to earn the "Verified" badge and build instant trust with clients.',
    icon: <ShieldCheck size={48} className="text-indigo-600" />,
    color: 'from-slate-50 to-indigo-50',
  },
  {
    id: 5,
    title: 'Ready to Launch? 🚀',
    subtitle: '2-Minute Onboarding',
    description: 'Complete your professional profile and start your journey as a BigSuno Certified Provider today.',
    icon: <Sparkles size={48} className="text-indigo-600 animate-bounce" />,
    color: 'from-slate-900 to-indigo-950',
  },
];

export function IntroSlides({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500">
      <div className={`w-full max-w-md p-8 rounded-[2.5rem] bg-gradient-to-br ${slide.color} border border-white/50 shadow-2xl transition-all duration-700`}>
        {/* Top Progress */}
        <div className="flex justify-center gap-2 mb-12">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-10 bg-black' : 'w-2 bg-black/10'}`} 
            />
          ))}
        </div>

        {/* Icon & Content */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-white border border-white flex items-center justify-center shadow-xl shadow-black/5 animate-zoom-in">
             {slide.icon}
          </div>
          
          <div className="space-y-3">
             <h2 className="text-[32px] font-black text-slate-900 leading-tight tracking-tighter">
               {slide.title}
             </h2>
             <h4 className="text-[14px] font-black text-slate-400 uppercase tracking-[0.2em]">
               {slide.subtitle}
             </h4>
          </div>

          <p className="text-[17px] font-medium text-slate-600 leading-relaxed px-4">
            {slide.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex gap-4">
          {currentSlide > 0 && (
            <button 
              onClick={prev}
              className="w-16 h-18 rounded-2xl bg-white/50 border border-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <button 
            onClick={next}
            className={`flex-1 h-18 rounded-3xl font-black text-[18px] shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              currentSlide === slides.length - 1 
                ? 'bg-indigo-600 text-white shadow-indigo-500/20' 
                : 'bg-white text-slate-900 shadow-black/5'
            }`}
          >
            <span>{currentSlide === slides.length - 1 ? 'Launch 🎉' : 'Next Step'}</span>
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-[12px] font-black text-slate-300 uppercase tracking-[0.3em]">
        BIGSUNO V4.0 • CORPORATE EXPERIENCE
      </p>
    </div>
  );
}
