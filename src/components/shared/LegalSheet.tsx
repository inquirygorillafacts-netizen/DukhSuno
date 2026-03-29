'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, ChevronRight, Sparkles, Scale } from 'lucide-react';

interface LegalSheetProps {
  onClose: () => void;
}

export default function LegalSheet({ onClose }: LegalSheetProps) {
  const [tab, setTab] = useState<'privacy' | 'terms'>('privacy');

  const privacyContent = `
# Privacy Policy for BigSuno
**Last Updated: March 2026**

At BigSuno, accessible from bigsuno.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by BigSuno and how we use it.

## 1. Professional Data Handling
BigSuno provides a secure technological bridge between users. We do NOT sell, trade, or otherwise transfer your personally identifiable information to outside parties. Your interactions are protected by industry-standard encryption.

## 2. Anonymity by Design
Our platform is built on the principle of anonymity. Users are identified by pseudonyms and avatars. We do not display your real name, email, or mobile number to other users unless you explicitly choose to share them in personal conversation, which we advise against for your safety.

## 3. Technology Provider Status
BigSuno acts strictly as an intermediary technology provider. We facilitate communication but do not monitor, record, or store the content of private live voice calls. Users are responsible for the content of their conversations.

## 4. Data Security
We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
  `;

  const termsContent = `
# Terms of Service
**Last Updated: March 2026**

By accessing or using the BigSuno platform, you agree to comply with and be bound by the following Terms and Conditions of use.

## 1. Technological Intermediary
BigSuno is a technology platform that connects individual users for consultation and conversation. We are NOT a medical, psychological, or legal service. We do not employ the providers on the platform; they are independent third parties.

## 2. Limitation of Liability
BigSuno, its directors, and employees shall not be held liable for any interactions, advice, or outcomes resulting from the use of the platform. You use the service at your own risk. We are strictly a technology service provider and have no control over the conduct of users or providers.

## 3. User Responsibility
It is the user's responsibility to remain updated with these terms. We reserves the right to change these terms and conditions at any time without prior notice. Continued use of the platform constitutes acceptance of the updated terms.

## 4. Prohibited Conduct
Users are prohibited from engaging in illegal activities, sharing personal financial information, or harassing other users. We reserve the right to terminate access for any user violating these professional standards.
  `;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="w-full max-w-2xl bg-white rounded-t-[3rem] md:rounded-[3rem] relative z-10 shadow-2xl flex flex-col h-[90vh] md:h-auto md:max-h-[85vh] border border-slate-100"
        >
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-slate-900" />

          <div className="p-8 md:p-10 pb-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <Scale size={24} />
                   </div>
                   <h3 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tighter uppercase leading-none mt-1">
                     Legal Center
                   </h3>
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] px-1 italic text-left">Compliance & Transparency ✨</p>
             </div>
             <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
             >
                <X size={24} />
             </button>
          </div>

          <div className="px-8 md:px-10 flex gap-2 mb-4">
             <button 
                onClick={() => setTab('privacy')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'privacy' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
             >
                Privacy Policy
             </button>
             <button 
                onClick={() => setTab('terms')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'terms' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
             >
                Terms of Service
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-10 pt-2 space-y-6 custom-scrollbar text-left">
             <div className="prose prose-slate max-w-none">
                {tab === 'privacy' ? (
                   <div className="space-y-6">
                      <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-4">
                         <ShieldCheck className="text-indigo-600 shrink-0" size={32} />
                         <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">
                            Your security is our priority. We are a technology provider and do not store private call data.
                         </p>
                      </div>
                      <div className="text-slate-600 text-sm leading-7 whitespace-pre-line font-medium">
                         {privacyContent}
                      </div>
                   </div>
                ) : (
                   <div className="space-y-6">
                      <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex items-center gap-4 text-white">
                         <Scale className="text-indigo-400 shrink-0" size={32} />
                         <p className="text-xs font-bold leading-relaxed italic">
                            By using BigSuno, you acknowledge that we are strictly a technology intermediary.
                         </p>
                      </div>
                      <div className="text-slate-600 text-sm leading-7 whitespace-pre-line font-medium">
                         {termsContent}
                      </div>
                   </div>
                )}
             </div>

             <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-2 opacity-30">
                <div className="flex items-center gap-3">
                   <div className="h-px w-8 bg-slate-200" />
                   <Sparkles size={12} className="text-amber-400" />
                   <div className="h-px w-8 bg-slate-200" />
                </div>
                <p className="text-[9px] font-black text-center uppercase tracking-[0.4em] italic mb-8">
                  BigSuno v3.0 Official Legal Documentation
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
