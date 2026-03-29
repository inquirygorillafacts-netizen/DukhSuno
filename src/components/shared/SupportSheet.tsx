'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, HelpCircle, ChevronDown, ChevronUp, MessageCircle, 
  Users, Shield, PhoneCall, IndianRupee, Star,
  Wallet, CheckCircle2, Zap, User, TrendingUp, Image, Wifi, Info,
  Sparkles, Lock, BadgeCheck, Clock
} from 'lucide-react';

interface SupportSheetProps {
  onClose: () => void;
}

const FAQS = [
  { 
    q: "How do I start a consultation?", 
    a: "Browse the home screen to find an expert that fits your needs. Click the 'Call Now' button to start an instant, secure voice consultation.",
    icon: <PhoneCall className="text-emerald-500" size={18} />
  },
  { 
    q: "Is my identity completely safe?", 
    a: "Absolutely. BigSuno is built on 100% anonymity. Experts only see your chosen avatar and alias. Your real name and number are never revealed.",
    icon: <Shield className="text-rose-500" size={18} />
  },
  { 
    q: "How do I recharge my wallet?", 
    a: "Navigate to the 'Wallet' section and click 'Add Credits'. You can securely pay via UPI, Credit/Debit cards, or Net Banking.",
    icon: <Wallet className="text-amber-500" size={18} />
  },
  { 
    q: "What if the call gets disconnected?", 
    a: "Don't worry. Our system tracks exact seconds. You are only billed for the actual duration connected. Any unused balance remains in your wallet.",
    icon: <Wifi className="text-indigo-400" size={18} />
  },
  { 
    q: "How do you verify the experts?", 
    a: "Every provider undergoes a multi-step verification process, including expertise checks and identity validation, to ensure high-quality guidance.",
    icon: <CheckCircle2 className="text-blue-500" size={18} />
  },
  { 
    q: "Can I report unprofessional behavior?", 
    a: "Yes. We maintain a zero-tolerance policy. You can report and block any user immediately during or after a call through the call menu.",
    icon: <Info className="text-rose-400" size={18} />
  },
  { 
    q: "Are my voice calls recorded?", 
    a: "No. BigSuno respects absolute privacy. We do not record, listen to, or store any part of your private voice consultations.",
    icon: <Lock className="text-slate-500" size={18} />
  },
  { 
    q: "How do I update my profile?", 
    a: "Go to your Profile page. You can change your display name and select a professional avatar that represents your personality.",
    icon: <User className="text-indigo-500" size={18} />
  },
  { 
    q: "Can I use the app on my iPhone?", 
    a: "Yes! BigSuno is a Progressive Web App (PWA). Just open bigsuno.app in Safari, tap 'Share', and select 'Add to Home Screen'.",
    icon: <Zap className="text-amber-400" size={18} />
  },
  { 
    q: "How do I check my call history?", 
    a: "The 'History' tab in the bottom navigation provides a detailed log of your past consultations, durations, and credits spent.",
    icon: <Clock className="text-slate-400" size={18} />
  },
  { 
    q: "Is there a minimum recharge amount?", 
    a: "The minimum recharge amount is currently set at ₹100 to ensure you have enough balance for a meaningful consultation.",
    icon: <IndianRupee className="text-emerald-600" size={18} />
  },
  { 
    q: "How do I become a Provider?", 
    a: "If you have expertise to share, click 'Become a Provider' in your profile settings. You'll need to complete a separate onboarding process.",
    icon: <Star className="text-amber-500" size={18} />
  },
  { 
    q: "Are my financial details safe?", 
    a: "We use top-tier, SSL-encrypted payment gateways. BigSuno never stores your card or bank account details on our servers.",
    icon: <Shield className="text-emerald-500" size={18} />
  },
  { 
    q: "What are 'Verified' badges?", 
    a: "Experts with high ratings and consistent positive feedback are awarded the Blue Verified checkmark for their exceptional service.",
    icon: <BadgeCheck className="text-blue-400" size={18} />
  },
  { 
    q: "How to reach Official Support?", 
    a: "For immediate assistance, click the WhatsApp button at the bottom of this screen or message us at +91-8302829465.",
    icon: <MessageCircle className="text-emerald-500" size={18} />
  }
];

export default function SupportSheet({ onClose }: SupportSheetProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        {/* Content Card */}
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="w-full max-w-xl bg-white rounded-t-[3rem] md:rounded-[3rem] relative z-10 shadow-2xl flex flex-col h-[90vh] md:h-auto md:max-h-[85vh] border border-slate-100"
        >
          {/* Header Branding */}
          <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-[#ff4d6d] to-indigo-500" />

          {/* Header */}
          <div className="p-8 md:p-10 pb-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shadow-inner">
                      <HelpCircle size={24} />
                   </div>
                   <h3 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-none mt-1">
                     Help & FAQ
                   </h3>
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] px-1 italic">Solutions for every query ✨</p>
             </div>
             <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
             >
                <X size={24} />
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-2 space-y-4 custom-scrollbar">
             {FAQS.map((faq, i) => (
               <div key={i} className={`rounded-3xl border transition-all duration-300 ${openIndex === i ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-50 bg-white hover:border-slate-200'}`}>
                  <button 
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left group"
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${openIndex === i ? 'bg-white scale-110' : 'bg-slate-50 opacity-70'}`}>
                           {faq.icon}
                        </div>
                        <span className={`text-[14px] md:text-[15px] font-black uppercase tracking-tight leading-snug ${openIndex === i ? 'text-slate-900' : 'text-slate-600'}`}>
                          {faq.q}
                        </span>
                     </div>
                     {openIndex === i ? (
                        <div className="w-8 h-8 rounded-full bg-indigo-100/50 flex items-center justify-center text-indigo-500">
                           <ChevronUp size={18} />
                        </div>
                     ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                           <ChevronDown size={18} />
                        </div>
                     )}
                  </button>
                  <AnimatePresence>
                     {openIndex === i && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                          <div className="px-5 pb-6 ml-14">
                             <p className="text-[13px] md:text-[14px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-indigo-200 pl-4 py-1">
                                {faq.a}
                             </p>
                          </div>
                       </motion.div>
                     )}
                  </AnimatePresence>
               </div>
             ))}
          </div>

          {/* Support Footer */}
          <div className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <a 
                  href="https://wa.me/918302829465" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] gap-2 group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all active:scale-95"
                >
                   <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                      <MessageCircle size={24} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">WhatsApp</span>
                </a>

                <button 
                  onClick={() => alert('Joining Community... 👥')}
                  className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] gap-2 group hover:shadow-2xl hover:shadow-rose-500/10 transition-all active:scale-95"
                >
                   <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Community</span>
                </button>
             </div>
             
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                   <div className="h-px w-8 bg-slate-200" />
                   <Sparkles size={12} className="text-amber-400" />
                   <div className="h-px w-8 bg-slate-200" />
                </div>
                <p className="text-[9px] text-slate-400 font-black text-center uppercase tracking-[0.4em] italic leading-none">
                  BigSuno v3.0 Official Support
                </p>
                <div className="flex items-center gap-2 text-rose-500/30">
                   <Sparkles size={8} className="fill-current" />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
