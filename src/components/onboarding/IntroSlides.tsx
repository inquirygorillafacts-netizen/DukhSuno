'use client';

import React, { useState } from 'react';
import { Heart, Sparkles, Star, ShieldCheck, Wallet, ArrowRight, ArrowLeft } from 'lucide-react';

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
    title: 'BigSuno में आपका स्वागत है ✨',
    subtitle: 'एक "International Level" विज़न',
    description: 'यहाँ आप सिर्फ एक लिसनर नहीं, बल्कि एक बदलाव लाने वाले इंसान (Changemaker) हैं।',
    icon: <Heart size={48} className="text-rose-500 animate-heartbeat" />,
    color: 'from-rose-50 to-rose-100',
  },
  {
    id: 2,
    title: 'अपनी पहचान चुनें 🌟',
    subtitle: 'Listener, Mentor, Guider, या Influencer',
    description: 'आप जिस भी कैटेगरी में बेस्ट हैं, वहां से शुरुआत करें और लोगों की मदद करें।',
    icon: <Star size={48} className="text-amber-500 animate-bounce" />,
    color: 'from-amber-50 to-amber-100',
  },
  {
    id: 3,
    title: 'शानदार कमाई करें 💸',
    subtitle: 'Earn on Your Own Terms',
    description: 'जितना ज़्यादा आप सुनेंगे, उतना ही ज़्यादा आप कमाएंगे। पूरी पारदर्शिता के साथ।',
    icon: <Wallet size={48} className="text-emerald-500 animate-pulse" />,
    color: 'from-emerald-50 to-emerald-100',
  },
  {
    id: 4,
    title: 'Verified Tag पायें ✅',
    subtitle: 'जैसे Instagram और YouTube पर',
    description: 'एक बार एडमिन ने आपको वैरिफाई कर लिया, तो आपकी प्रोफाइल पर दिखेगा चमकता हुआ टिक।',
    icon: <ShieldCheck size={48} className="text-blue-500" />,
    color: 'from-blue-50 to-blue-100',
  },
  {
    id: 5,
    title: 'शुरुआत करने के लिए तैयार? 🚀',
    subtitle: 'बस 2 मिनट में अपनी एप्लीकेशन भरें',
    description: 'आपका नाम, नंबर और कैटेगरी - बस इतना ही चाहिए शुरू करने के लिए।',
    icon: <Sparkles size={48} className="text-indigo-500" />,
    color: 'from-indigo-50 to-indigo-100',
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
            className="flex-1 h-18 bg-white text-slate-900 rounded-3xl font-black text-[18px] shadow-2xl shadow-black/5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{currentSlide === slides.length - 1 ? 'शुरू करें 🎉' : 'आगे बढ़ें'}</span>
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-[12px] font-black text-slate-300 uppercase tracking-[0.3em]">
        BIGSUNO V3.0 • PREMIUM EXPERIENCE
      </p>
    </div>
  );
}
