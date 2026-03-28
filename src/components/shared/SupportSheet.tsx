'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, HelpCircle, ChevronDown, ChevronUp, MessageCircle, 
  Users, Shield, PhoneCall, IndianRupee, Star,
  Wallet, CheckCircle2, Zap, User, TrendingUp, Image, Wifi, Info,
  Sparkles,
  Heart
} from 'lucide-react';

interface SupportSheetProps {
  onClose: () => void;
}

const FAQS = [
  { 
    q: "कमाई कैसे शुरू करें?", 
    a: "बस अपने डैशबोर्ड पर 'Online' बटन को ऑन करें। जैसे ही कोई यूजर कॉल करेगा, आपकी कमाई शुरू हो जाएगी।",
    icon: <IndianRupee className="text-emerald-500" size={18} />
  },
  { 
    q: "पेमेंट कब मिलती है?", 
    a: "आपकी कमाई आपके वॉलेट में तुरंत जुड़ जाती है। आप इसे 24 घंटे के भीतर अपने बैंक अकाउंट या UPI में विड्रॉल कर सकते हैं।",
    icon: <Wallet className="text-amber-500" size={18} />
  },
  { 
    q: "क्या मेरा नंबर सुरक्षित है?", 
    a: "जी हाँ, 100%। BigSuno पर आपकी पहचान और मोबाइल नंबर पूरी तरह से गुप्त रहता है। यूजर को सिर्फ आपका गुप्त नाम दिखता है।",
    icon: <Shield className="text-rose-500" size={18} />
  },
  { 
    q: "प्राइसिंग कैसे बदलें?", 
    a: "प्रोफाइल सेक्शन में 'Edit Pricing' बटन पर क्लिक करके आप अपनी सुविधा अनुसार प्रति मिनट रेट बदल सकते हैं।",
    icon: <Star className="text-indigo-500" size={18} />
  },
  { 
    q: "यूजर गाली दे तो क्या करें?", 
    a: "कॉल के दौरान या बाद में आप यूजर को 'Report & Block' कर सकते हैं। हमारी टीम तुरंत उस पर एक्शन लेगी।",
    icon: <PhoneCall className="text-rose-400" size={18} />
  },
  { 
    q: "वेरिफ़ाइड लिसनर कैसे बनें?", 
    a: "आपकी पहली 50 कॉल्स और 4.5+ रेटिंग होने पर ऑटोमैटिकली आपके प्रोफाइल पर ब्लू टिक (Verified Badge) आ जाएगा।",
    icon: <CheckCircle2 className="text-blue-500" size={18} />
  },
  { 
    q: "सक्सेस रेट क्या है?", 
    a: "यह दर्शाता है कि आपने कितनी कॉल्स अटेंड की हैं। हाई सक्सेस रेट मतलब ज्यादा कॉल्स और ज्यादा कमाई!",
    icon: <Zap className="text-amber-400" size={18} />
  },
  { 
    q: "एक साथ दो रोल कैसे यूज़ करें?", 
    a: "आप सेटिंग्स में जाकर 'Switch Role' कर सकते हैं। इससे आप सुनने वाले और सुनाने वाले, दोनों बन सकते हैं।",
    icon: <User className="text-slate-500" size={18} />
  },
  { 
    q: "कॉल्स कैसे बढ़ाएं?", 
    a: "अपनी हेडलाइन और बायो को अट्रैक्टिव बनाएं और ज्यादा समय ऑनलाइन रहें। इससे आपकी विजिबिलिटी बढ़ेगी।",
    icon: <TrendingUp className="text-emerald-400" size={18} />
  },
  { 
    q: "मिनिमम विड्रॉल कितना है?", 
    a: "आप कम से कम ₹100 होने पर विड्रॉल रिक्वेस्ट डाल सकते हैं।",
    icon: <IndianRupee className="text-emerald-600" size={18} />
  },
  { 
    q: "प्रोफाइल फोटो कैसे बदलें?", 
    a: "प्रोफाइल एडिट में जाकर 'Change Photo' पर क्लिक करें। आप गैलरी से अपनी फोटो या अवतार चुन सकते हैं।",
    icon: <Image className="text-slate-400" size={18} />
  },
  { 
    q: "इंटरनेट स्लो हो तो क्या करें?", 
    a: "अच्छी क्वालिटी की कॉल के लिए कम से कम 4G या वाईफाई का इस्तेमाल करें। स्लो नेट पर कॉल ड्रॉप हो सकती है।",
    icon: <Wifi className="text-indigo-400" size={18} />
  },
  { 
    q: "लिसनर कम्युनिटी कैसे ज्वाइन करें?", 
    a: "नीचे दिए गए 'Join Community' बटन पर क्लिक करके हमारे एक्सक्लूसिव टेलीग्राम/व्हाट्सएप ग्रुप से जुड़ें।",
    icon: <Users className="text-emerald-500" size={18} />
  },
  { 
    q: "प्लेटफॉर्म के नियम क्या हैं?", 
    a: "यूजर के साथ सम्मान से बात करें, अपनी कोई भी पर्सनल जानकारी शेयर न करें और कॉल के बाहर पेमेंट न मांगें।",
    icon: <Info className="text-rose-400" size={18} />
  },
  { 
    q: "सपोर्ट टीम से कैसे जुड़ें?", 
    a: "किसी भी समस्या के लिए सीधे WhatsApp (8302829465) पर मैसेज करें। हम आपकी मदद के लिए हमेशा तैयार हैं।",
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
                   <Heart size={8} className="fill-current" />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
