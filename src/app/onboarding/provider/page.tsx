'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, Check, Sparkles, 
  Wallet, ShieldCheck, Heart, 
  Camera, User, Phone, Star,
  Smartphone, Shield, Plus, Upload, Languages as LangIcon,
  TrendingUp, Users, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { AVATAR_OPTIONS } from '@/types';

export default function SmartEarningOnboarding() {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Onboarding State
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    age: '',
    gender: '',
    bio: '',
    categories: [] as string[],   // BUG #3 Fix: Multi-select (max 3)
    languages: ['Hindi'],
    payoutQR: '',
    phoneNumber: '',
    avatarUrl: user?.avatarUrl || 'emoji:😊:#f3f4f6',  // BUG #7: Avatar selection
    plans: [                       // BUG #6: Plan creation
      { name: 'Quick Chat', minutes: 5, price: 49 },
      { name: 'Deep Session', minutes: 15, price: 149 },
      { name: 'Premium Hour', minutes: 30, price: 299 },
    ]
  });

  // 3 Professional Success Slides
  const slides = [
    {
      title: 'Join the Elite Network',
      desc: 'Connect with a global audience seeking your unique expertise and professional mentorship.',
      icon: <div className="p-6 bg-indigo-50 rounded-full shadow-inner"><img src="/logo.png" alt="BigSuno" className="w-16 h-16 object-contain" /></div>,
      bullets: ['Global Reach', 'Premium Branding', 'Corporate Standards']
    },
    {
       title: 'Command Your Value',
       desc: 'Set professional session rates that reflect your experience. Manage earnings with total transparency.',
       icon: <div className="p-6 bg-indigo-50 rounded-full shadow-inner"><TrendingUp className="text-indigo-600 w-16 h-16" /></div>,
       bullets: ['Instant Payouts', 'Dynamic Pricing', 'Revenue Analytics']
    },
    {
       title: 'Verified Excellence',
       desc: 'Build lasting corporate trust through our rigorous verification and professional ranking system.',
       icon: <div className="p-6 bg-indigo-50 rounded-full shadow-inner"><ShieldCheck className="text-indigo-600 w-16 h-16" /></div>,
       bullets: ['Identity Verified', 'Trust Badges', 'Top Tier Support']
    }
  ];

  // BUG #2: Unified 7-category list
  const CATEGORIES = [
    { id: 'listener', label: 'Listener', emoji: '👂' },
    { id: 'influencer', label: 'Influencer', emoji: '⭐' },
    { id: 'mentor', label: 'Mentor / Coach', emoji: '🎓' },
    { id: 'sex-health', label: 'Sex Health Expert', emoji: '💊' },
    { id: 'gm-expert', label: 'GM Expert', emoji: '🧠' },
    { id: 'romantic', label: 'Romantic & Couple', emoji: '💕' },
    { id: 'other', label: 'Other', emoji: '🔮' },
  ];

  // Total steps: 3 slides + name/avatar + categories + gender/age + plans + phone = 8
  const TOTAL_STEPS = 8;

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
      case 1: case 2: case 3: return true; // 3 Intro slides
      case 4: return formData.displayName.length >= 3; // Name + Avatar
      case 5: return formData.categories.length >= 1 && formData.categories.length <= 3; // Categories
      case 6: return formData.gender !== '' && formData.age.length >= 2; // Gender + Age
      case 7: return formData.plans.every(p => p.name.length >= 2 && p.minutes > 0 && p.price >= 10); // Plans
      case 8: return formData.phoneNumber.length === 10; // Phone
      default: return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(step) && step < TOTAL_STEPS) setStep(step + 1);
  };

  const toggleCategory = (catId: string) => {
    const current = formData.categories;
    if (current.includes(catId)) {
      setFormData({ ...formData, categories: current.filter(c => c !== catId) });
    } else if (current.length < 3) {
      setFormData({ ...formData, categories: [...current, catId] });
    }
  };

  const updatePlan = (index: number, field: string, value: string | number) => {
    const newPlans = [...formData.plans];
    (newPlans[index] as any)[field] = value;
    setFormData({ ...formData, plans: newPlans });
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload-qr', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, payoutQR: data.url });
      }
    } catch (err) {
      console.error('QR upload failed:', err);
    }
  };

  const finalizeOnboarding = async () => {
    if (!user?.uid || !isStepValid(TOTAL_STEPS)) return;
    setLoading(true);
    try {
        const userRef = doc(db, 'users', user.uid);
        const updateData = {
            displayName: formData.displayName,
            avatarUrl: formData.avatarUrl,
            bio: formData.bio,
            phoneNumber: formData.phoneNumber,
            age: parseInt(formData.age),
            gender: formData.gender,
            languages: formData.languages,
            providerType: formData.categories[0] || 'listener',
            providerCategories: formData.categories,
            plans: formData.plans,
            paymentQrUrl: '', // QR setup is now moved to withdrawal page settings
            roles: Array.from(new Set([...(user.roles || []), 'provider'])),
            activeRole: 'provider',
            isProvider: true,
            availableBalance: 0,
            onboardingCompleted: true,
            verificationStatus: 'pending', // CRITICAL: Shows up in Admin Verification
            isVerified: false,
            isBlocked: false,
            lastActive: serverTimestamp(), // CRITICAL: Required for Seeker Panel Ordering
            providerStartedAt: serverTimestamp()
        };
        await updateDoc(userRef, updateData);
        setUser({ ...user, ...updateData } as any);
        router.push('/provider/dashboard'); 
    } catch (err) {
        console.error(err);
        alert('Something went wrong. Please check your internet connection.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(0,245,255,0.05)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="max-w-[420px] w-full bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 animate-fade-in relative z-10">
        
        {/* ═══ STEP 1-3: INTRO SLIDES ═══ */}
        {step <= 3 ? (
          <div className="space-y-8 text-center animate-slide-up">
            <div className="flex justify-center">
              <div>
                {slides[step - 1].icon}
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-[28px] font-black tracking-tighter text-slate-900 leading-tight">{slides[step - 1].title}</h1>
              <p className="text-slate-400 font-medium text-[13px] leading-relaxed px-2 italic">{slides[step - 1].desc}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-1">
               {slides[step - 1].bullets.map((b, i) => (
                 <div key={i} className="flex items-center gap-3 bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group">
                    <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                       <Check size={10} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{b}</span>
                 </div>
               ))}
            </div>
            <div className="pt-4 space-y-5">
               <button onClick={handleNext} className="w-full bg-slate-900 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95">
                 <span>Continue Application</span>
                 <ArrowRight size={18} />
               </button>
               <ProgressDots step={step} total={TOTAL_STEPS} />
            </div>
          </div>
        ) : step === 4 ? (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                 <h1 className="text-[28px] font-black tracking-tighter mb-1 text-slate-900">Pro Profile</h1>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Choose your avatar & name</p>
              </div>
              <div className="space-y-5">
                 {/* Avatar Grid */}
                 <div className="grid grid-cols-6 gap-2 justify-items-center">
                    {AVATAR_OPTIONS.slice(0, 12).map((av, idx) => (
                       <button
                          key={idx}
                          onClick={() => setFormData({...formData, avatarUrl: `emoji:${av.emoji}:${av.bg}`})}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${formData.avatarUrl === `emoji:${av.emoji}:${av.bg}` ? 'ring-2 ring-indigo-500 scale-110 shadow-lg' : 'hover:scale-105'}`}
                          style={{ backgroundColor: av.bg }}
                       >
                          {av.emoji}
                       </button>
                    ))}
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Full Name *</label>
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full h-14 bg-slate-50 border border-slate-200 rounded-3xl px-6 text-sm font-black focus:border-slate-900 outline-none transition-all"
                    />
                 </div>
              </div>
              <button 
                 onClick={handleNext}
                 disabled={!isStepValid(4)}
                 className="w-full bg-slate-900 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
               >
                 <span>Next</span>
                 <ArrowRight size={18} />
               </button>
              <ProgressDots step={step} total={TOTAL_STEPS} />
            </div>

        /* ═══ STEP 5: CATEGORIES (Multi-select, max 3) ═══ */
        ) : step === 5 ? (
            <div className="space-y-8 animate-fade-in">
                 <div className="text-center">
                    <h1 className="text-[28px] font-black tracking-tighter mb-1 text-slate-900">Your Expertise</h1>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Select 1-3 categories</p>
                 </div>
                 <div className="space-y-3">
                     {CATEGORIES.map(cat => (
                         <button
                             key={cat.id}
                             onClick={() => toggleCategory(cat.id)}
                             className={`w-full py-4 px-5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${formData.categories.includes(cat.id) ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                         >
                             <span className="text-lg">{cat.emoji}</span>
                             <span>{cat.label}</span>
                             {formData.categories.includes(cat.id) && <Check size={16} className="ml-auto" />}
                         </button>
                     ))}
                 </div>
                 <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">
                    Selected: {formData.categories.length}/3
                 </p>
                 <button 
                    onClick={handleNext}
                    disabled={!isStepValid(5)}
                    className="w-full bg-slate-900 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <span>Next</span>
                    <ArrowRight size={18} />
                  </button>
                 <ProgressDots step={step} total={TOTAL_STEPS} />
            </div>

        /* ═══ STEP 6: GENDER + AGE ═══ */
        ) : step === 6 ? (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                 <h1 className="text-[28px] font-black tracking-tighter mb-1 text-slate-900">About You</h1>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Personal Details</p>
              </div>
              <div className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Age *</label>
                        <input 
                          type="number" 
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                          className="w-full h-14 bg-slate-50 border border-slate-200 rounded-3xl px-6 text-sm font-black focus:border-slate-900 outline-none transition-all text-center"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Gender *</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full h-14 bg-slate-50 border border-slate-200 rounded-3xl px-4 text-sm font-black focus:border-slate-900 outline-none transition-all appearance-none text-center"
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Languages</label>
                     <div className="flex flex-wrap gap-2">
                         {['Hindi', 'English', 'Bengali', 'Marathi', 'Tamil'].map(lang => (
                             <button
                                 key={lang}
                                 onClick={() => {
                                     const next = formData.languages.includes(lang) 
                                         ? formData.languages.filter(l => l !== lang)
                                         : [...formData.languages, lang];
                                     setFormData({...formData, languages: next});
                                 }}
                                 className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase border flex items-center gap-2 transition-all ${formData.languages.includes(lang) ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                             >
                                 <LangIcon size={12} />
                                 {lang}
                             </button>
                         ))}
                     </div>
                 </div>

                 <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Bio / Headline *</label>
                     <textarea 
                        placeholder="Describe your expertise in one sentence..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full h-24 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium focus:border-slate-900 outline-none transition-all resize-none"
                     />
                 </div>
              </div>
              <button 
                 onClick={handleNext}
                 disabled={!isStepValid(6)}
                 className="w-full bg-slate-900 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
               >
                 <span>Next</span>
                 <ArrowRight size={18} />
               </button>
              <ProgressDots step={step} total={TOTAL_STEPS} />
            </div>

        /* ═══ STEP 7: PLAN CREATION (BUG #6 FIX) ═══ */
        ) : step === 7 ? (
            <div className="space-y-6 animate-fade-in">
                 <div className="text-center">
                    <div className="p-4 bg-indigo-50 rounded-[2rem] inline-block mb-3 shadow-inner">
                       <Zap className="text-indigo-600 w-8 h-8" />
                    </div>
                    <h1 className="text-[28px] font-black tracking-tighter mb-1 text-slate-900">Create Your Plans</h1>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Set minutes, price & name for 3 plans</p>
                 </div>
                 <div className="space-y-3">
                     {formData.plans.map((plan, idx) => (
                         <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                               <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">{idx + 1}</div>
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan {idx + 1}</span>
                            </div>
                            <input 
                               type="text" 
                               value={plan.name}
                               onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                               placeholder="Plan Name"
                               className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-black focus:border-indigo-500 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-black">MIN</span>
                                   <input 
                                      type="number" 
                                      value={plan.minutes}
                                      onChange={(e) => updatePlan(idx, 'minutes', parseInt(e.target.value) || 0)}
                                      className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-black text-center focus:border-indigo-500 outline-none"
                                   />
                                </div>
                                <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-black">₹</span>
                                   <input 
                                      type="number" 
                                      value={plan.price}
                                      onChange={(e) => updatePlan(idx, 'price', parseInt(e.target.value) || 0)}
                                      className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-8 pr-4 text-xs font-black text-center focus:border-indigo-500 outline-none"
                                   />
                                </div>
                            </div>
                         </div>
                     ))}
                 </div>
                 <button 
                    onClick={handleNext}
                    disabled={!isStepValid(7)}
                    className="w-full bg-slate-900 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <span>Next</span>
                    <ArrowRight size={18} />
                  </button>
                 <ProgressDots step={step} total={TOTAL_STEPS} />
            </div>

        /* ═══ FINAL STEP 8: PHONE NUMBER & FINALIZE ═══ */
        ) : (
            <div className="space-y-8 animate-fade-in">
                 <div className="text-center">
                    <div className="p-6 bg-slate-900 rounded-[2rem] inline-block mb-4 shadow-2xl">
                       <Smartphone className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-[28px] font-black tracking-tighter mb-1">Connect Mobile</h1>
                    <p className="text-slate-500 font-medium text-[13px] leading-relaxed italic px-2">Enter your professional contact number for secure call routing.</p>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Indian Mobile Number *</label>
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">+91</span>
                          <input 
                            type="tel" 
                            placeholder="00000 00000"
                            value={formData.phoneNumber}
                            maxLength={10}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '')})}
                            className="w-full h-16 bg-slate-50 border border-slate-200 rounded-3xl pl-16 pr-6 text-sm font-black focus:border-slate-900 outline-none transition-all placeholder:text-slate-200"
                          />
                       </div>
                    </div>
                 </div>
                 <button 
                   onClick={finalizeOnboarding}
                   disabled={loading || !isStepValid(8)}
                   className="w-full bg-indigo-600 text-white h-16 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                 >
                   {loading ? 'Processing Expertise...' : (
                       <>
                        <span>Finish & Go Online</span>
                        <ShieldCheck size={18} />
                       </>
                   )}
                 </button>
                 <ProgressDots step={step} total={TOTAL_STEPS} />
              </div>
        )}
      </div>
    </div>
  );
}

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map(i => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i ? 'w-8 bg-slate-900' : i < step ? 'w-2 bg-indigo-400' : 'w-2 bg-slate-100'}`} />
      ))}
    </div>
  );
}
