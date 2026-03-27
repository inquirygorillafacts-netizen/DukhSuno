'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Shield, Wallet, Users, ArrowRight, X, Phone, CheckCircle2 } from 'lucide-react';

interface WelcomeTourProps {
  role: 'sunne_wala' | 'sunane_wala';
  onClose: () => void;
}

export default function WelcomeTour({ role, onClose }: WelcomeTourProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow layout to mount for a smooth entry
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const slides = role === 'sunne_wala' ? [
    {
      title: "आपकी पहचान, आपका राज़ 🔒",
      description: "BigSuno पर आपकी पहचान 100% गुप्त रहती है। कोई भी आपका नाम या मोबाइल नंबर नहीं देख पाएगा।",
      icon: <Shield size={48} className="text-rose-500" />,
      tag: "PRIVACY FIRST",
      color: "bg-rose-50"
    },
    {
      title: "सुनें और कमाएं ₹₹ 💰",
      description: "दूसरों की बातें सुनकर आप महीने के ₹20,000 से ₹30,000 तक कमा सकते हैं। घर बैठे अपनी सेवा शुरू करें।",
      icon: <Wallet size={48} className="text-emerald-500" />,
      tag: "EARNINGS",
      color: "bg-emerald-50"
    },
    {
      title: "बढ़ती हुई कम्युनिटी! 🇮🇳",
      description: "पूरे भारत से लोग BigSuno से जुड़ रहे हैं। आप भी इस मददगार कम्युनिटी का हिस्सा बनें।",
      icon: <Users size={48} className="text-indigo-500" />,
      tag: "COMMUNITY",
      color: "bg-indigo-50"
    }
  ] : [
    {
      title: "दिल खोल कर बात करें 🛡️",
      description: "यहाँ आप बिना किसी डर के अपने दिल की बात कह सकते हैं। हम आपके भरोसे की 100% कद्र करते हैं।",
      icon: <Shield size={48} className="text-rose-500" />,
      tag: "SAFE SPACE",
      color: "bg-rose-50"
    },
    {
      title: "पूरे भारत का भरोसा 🤝",
      description: "हज़ारों लोग रोज़ाना BigSuno पर सुकून पाते हैं। यहाँ हर भाषा और हर राज्य के लोग मौजूद हैं।",
      icon: <Users size={48} className="text-indigo-500" />,
      tag: "MOST TRUSTED",
      color: "bg-indigo-50"
    },
    {
      title: "सुकून पाने की मंज़िल ✨",
      description: "भारत के कोने-कोने से लोग इस ऐप से जुड़े हैं। आज ही अपने दिल का बोझ हल्का करें और सुखी रहें।",
      icon: <Heart size={48} className="text-[#ff4d6d]" />,
      tag: "HAPPY LIVES",
      color: "bg-rose-50"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-slate-900/60 transition-all duration-500">
      {/* Container: Premium & Responsive */}
      <div 
        className="w-full max-w-[500px] h-[600px] md:h-auto md:min-h-[500px] bg-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-between p-8 md:p-12 animate-in zoom-in-95 fade-in duration-500"
      >
        {/* Close Button */}
        <button 
          onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Top Tag */}
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${slides[currentSlide].color} text-slate-900`}>
           {slides[currentSlide].tag}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in slide-in-from-right-10 duration-500">
           <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-inner ${slides[currentSlide].color}`}>
              {slides[currentSlide].icon}
           </div>
           
           <div className="space-y-4">
              <h2 className="text-[32px] md:text-[36px] font-black text-slate-900 leading-tight tracking-tighter italic">
                {slides[currentSlide].title}
              </h2>
              <p className="text-slate-500 text-[16px] md:text-[18px] font-medium leading-relaxed italic px-4">
                {slides[currentSlide].description}
              </p>
           </div>
        </div>

        {/* Footer: Progress & Button */}
        <div className="w-full mt-10 space-y-8">
           <div className="flex justify-center gap-2">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-10 bg-[#ff4d6d]' : 'w-3 bg-slate-100'}`} 
                />
              ))}
           </div>

           <button 
              onClick={handleNext}
              className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black text-[18px] shadow-xl shadow-slate-200 flex items-center justify-center gap-4 transition-all active:scale-95 group hover:bg-[#ff4d6d]"
           >
              <span className="uppercase tracking-widest">{currentSlide === slides.length - 1 ? 'Chaliye Shuru Karein' : 'Aage Badhein'}</span>
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        {/* Aurora Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-[0.4]">
           <div className={`absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-30 ${slides[currentSlide].color === 'bg-rose-50' ? 'bg-rose-400' : slides[currentSlide].color === 'bg-emerald-50' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
        </div>
      </div>
    </div>
  );
}
