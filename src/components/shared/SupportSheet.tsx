'use client';

import React, { useState } from 'react';
import { 
  X, HelpCircle, ChevronDown, ChevronUp, MessageCircle, 
  Users, Shield, PhoneCall, IndianRupee, Star 
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

// Fallback Icons
import { Wallet, CheckCircle2, Zap, User, TrendingUp, Image, Wifi, Info } from 'lucide-react';

export default function SupportSheet({ onClose }: SupportSheetProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-xl transition-all duration-500 p-0 md:p-6">
      <div className="w-full max-w-[550px] bg-white rounded-t-[3rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col h-[85vh] md:h-auto md:max-h-[85vh] animate-in slide-in-from-bottom-5 duration-500">
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <HelpCircle className="text-rose-500" size={24} />
                 <h3 className="text-[28px] font-black text-slate-900 tracking-tighter uppercase italic">Help & FAQ ✨</h3>
              </div>
              <p className="text-[12px] text-slate-400 font-medium px-1 tracking-tight">Pehle in FAQs ko padhein, shayad aapka jawab yahi ho!</p>
           </div>
           <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all border border-slate-100">
              <X size={24} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4 custom-scrollbar">
           {FAQS.map((faq, i) => (
             <div key={i} className={`rounded-3xl border transition-all duration-300 ${openIndex === i ? 'border-rose-100 bg-rose-50/30' : 'border-slate-50 bg-white hover:border-slate-200'}`}>
                <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${openIndex === i ? 'bg-white' : 'bg-slate-50'}`}>
                         {faq.icon}
                      </div>
                      <span className={`text-[15px] font-black tracking-tight ${openIndex === i ? 'text-slate-900' : 'text-slate-600'}`}>
                        {faq.q}
                      </span>
                   </div>
                   {openIndex === i ? <ChevronUp size={20} className="text-rose-500" /> : <ChevronDown size={20} className="text-slate-300" />}
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-6 pl-19 animate-in slide-in-from-top-2 duration-300">
                     <p className="text-[14px] text-slate-500 font-medium leading-relaxed italic">
                        {faq.a}
                     </p>
                  </div>
                )}
             </div>
           ))}
        </div>

        {/* Support Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
           <div className="grid grid-cols-2 gap-4">
              <a 
                href="https://wa.me/918302829465" 
                target="_blank" 
                className="flex flex-col items-center justify-center p-6 bg-white border border-emerald-100 rounded-[2rem] gap-2 group hover:shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-95"
              >
                 <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">WhatsApp Help</span>
              </a>

              <button 
                onClick={() => alert('Joining Community... 👥')}
                className="flex flex-col items-center justify-center p-6 bg-white border border-rose-100 rounded-[2rem] gap-2 group hover:shadow-xl hover:shadow-rose-500/10 transition-all active:scale-95"
              >
                 <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-widest text-rose-600">Join Community</span>
              </button>
           </div>
           
           <p className="text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest italic pt-2">
              BigSuno is here for you 24/7 ❤️ Made in India
           </p>
        </div>
      </div>
    </div>
  );
}
