'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, Check, Sparkles, 
  Wallet, ShieldCheck, Heart, 
  Camera, User, 
  Smartphone, Shield, Plus, Upload, Languages as LangIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';

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
    category: 'Listener', // Values: Listener, Influencer, Mentor, Coach
    languages: ['Hindi'],
    payoutQR: '',
    phoneNumber: ''
  });

  const slides = [
    {
      title: 'Welcome to BigSuno Professional',
      desc: 'Join our elite network of professional providers and offer your expertise to those in need.',
      icon: <img src="/logo.png" alt="BigSuno" className="w-12 h-12 object-contain" />,
      bullets: ['Professional Growth', 'Secure Payments', 'Verified Status']
    },
    {
       title: 'Establish Your Presence',
       desc: 'Set professional session rates and manage your consultant profile with ease.',
       icon: <Wallet className="text-indigo-500 w-12 h-12" />,
       bullets: ['Instant Payouts', 'Competitive Fees', 'Revenue Tracking']
    },
    {
       title: 'Build Corporate Trust',
       desc: 'Enhance your professional standing through verified reviews and rankings.',
       icon: <ShieldCheck className="text-indigo-600 w-12 h-12" />,
       bullets: ['Identity Verification', 'Professional Badge', 'Priority Support']
    }
  ];

  const isStepValid = (currentStep: number) => {
    switch (currentStep) {
      case 1: case 2: case 3: return true; // Intro slides
      case 4: return formData.phoneNumber.length === 10;
      case 5: return formData.displayName.length >= 3 && formData.age.length >= 2 && formData.gender !== '';
      case 6: return formData.category !== '' && formData.languages.length > 0 && formData.bio.trim().length >= 10;
      case 7: return formData.payoutQR !== ''; // Placeholder for now, will make it a required interaction
      default: return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(step) && step < 7) setStep(step + 1);
  };

  const finalizeOnboarding = async () => {
    if (!user?.uid || !isStepValid(7)) return;
    setLoading(true);
    try {
        const userRef = doc(db, 'users', user.uid);
        const updateData = {
            ...formData,
            providerType: formData.category.toLowerCase(), // Save as 'listener', 'influencer', etc.
            roles: Array.from(new Set([...(user.roles || []), 'provider'])),
            activeRole: 'provider',
            isProvider: true,
            availableBalance: 0,
            onboardingCompleted: true,
            providerStartedAt: serverTimestamp()
        };
        await updateDoc(userRef, updateData);
        setUser({ ...user, ...updateData } as any);
        router.push('/provider/dashboard'); 
    } catch (err) {
        console.error(err);
        alert('Galti ho gayi check karein internet.');
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(0,245,255,0.05)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-slate-100 animate-fade-in relative z-10">
        
        {step <= 3 ? (
          <div className="space-y-10 text-center animate-slide-up">
            <div className="flex justify-center">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                {slides[step - 1].icon}
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-4 text-slate-900">{slides[step - 1].title}</h1>
              <p className="text-slate-500 font-medium leading-relaxed italic">{slides[step - 1].desc}</p>
            </div>

            <div className="space-y-3 pt-4">
               {slides[step - 1].bullets.map((b, i) => (
                 <div key={i} className="flex items-center gap-4 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100/50">
                    <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                       <Check size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{b}</span>
                 </div>
               ))}
            </div>

            <div className="pt-8 space-y-6">
               <button 
                 onClick={handleNext}
                 className="w-full bg-slate-900 text-white h-16 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
               >
                 <span>Next Journey</span>
                 <ArrowRight size={18} />
               </button>
               <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i ? 'w-10 bg-slate-900' : 'w-2 bg-slate-100'}`} />
                  ))}
               </div>
            </div>
          </div>
        ) : step === 4 ? (
            <div className="space-y-10 animate-fade-in">
                 <div className="text-center">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] inline-block mb-6 shadow-2xl">
                       <Smartphone className="text-white w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter mb-2">Connect Mobile</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">Let's verify your identity.</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Indian Mobile Number</label>
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">+91</span>
                          <input 
                            type="tel" 
                            placeholder="00000 00000"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            className="w-full h-16 bg-slate-50 border border-slate-200 rounded-3xl pl-16 pr-6 text-sm font-black focus:border-slate-900 outline-none transition-all placeholder:text-slate-200"
                          />
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleNext}
                   disabled={!isStepValid(4)}
                   className="w-full bg-slate-900 text-white h-16 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <span>Verify Number</span>
                   <ArrowRight size={18} />
                 </button>
              </div>
        ) : step === 5 ? (
            <div className="space-y-10 animate-fade-in">
              <div className="text-center">
                 <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900">Pro Profile</h1>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Personal Information</p>
              </div>

              <div className="space-y-5">
                 <div className="flex justify-center mb-4">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-[2.2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-all cursor-pointer">
                            <Camera className="text-slate-300" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-2.5 bg-slate-900 rounded-xl text-white shadow-lg">
                            <Plus size={16} />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full h-16 bg-slate-50 border border-slate-200 rounded-3xl px-6 text-sm font-black focus:border-slate-900 outline-none transition-all"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Age</label>
                        <input 
                          type="number" 
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                          className="w-full h-16 bg-slate-50 border border-slate-200 rounded-3xl px-6 text-sm font-black focus:border-slate-900 outline-none transition-all text-center"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Gender</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full h-16 bg-slate-50 border border-slate-200 rounded-3xl px-4 text-sm font-black focus:border-slate-900 outline-none transition-all appearance-none text-center"
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                 </div>
              </div>

              <button 
                 onClick={handleNext}
                 disabled={!isStepValid(5)}
                 className="w-full bg-slate-900 text-white h-16 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
               >
                 <span>Next Details</span>
                 <ArrowRight size={18} />
               </button>
            </div>
        ) : step === 6 ? (
            <div className="space-y-10 animate-fade-in">
                 <div className="text-center">
                    <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900">Expertise</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Set your niche</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Service Category</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Mentor', 'Listener', 'Influencer', 'Coach'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFormData({...formData, category: cat})}
                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.category === cat ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                >
                                    {cat}
                                </button>
                            ))}
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
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Headline / Bio</label>
                        <textarea 
                           placeholder="Describe your expertise in one sentence..."
                           value={formData.bio}
                           onChange={(e) => setFormData({...formData, bio: e.target.value})}
                           className="w-full h-32 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium focus:border-slate-900 outline-none transition-all resize-none"
                        />
                    </div>
                 </div>

                 <button 
                    onClick={handleNext}
                    disabled={!isStepValid(6)}
                    className="w-full bg-slate-900 text-white h-16 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>Almost There</span>
                    <ArrowRight size={18} />
                  </button>
            </div>
        ) : (
            <div className="space-y-10 animate-fade-in">
                 <div className="text-center">
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] inline-block mb-6 shadow-inner text-emerald-500">
                       <Wallet className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900">Payout Setup</h1>
                    <p className="text-slate-500 font-medium leading-relaxed italic">Upload your UPI QR for earnings.</p>
                 </div>

                 <div className="space-y-6">
                    <div 
                        onClick={() => setFormData({...formData, payoutQR: 'verified_qr_placeholder'})}
                        className={`border-2 border-dashed rounded-[3rem] p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${formData.payoutQR ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200 bg-slate-50 hover:bg-emerald-50/30 hover:border-emerald-200'}`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${formData.payoutQR ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                            {formData.payoutQR ? <Check size={24} /> : <Upload className="group-hover:text-emerald-500" />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.payoutQR ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'}`}>
                            {formData.payoutQR ? 'QR Verified Successfully' : 'Upload Professional Payout QR'}
                        </span>
                    </div>

                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest leading-loose">Required for secure professional withdrawals. <br/> BigSuno offers 0% platform fee for the first month! 🎉</p>
                 </div>

                 <button 
                   onClick={finalizeOnboarding}
                   disabled={loading || !isStepValid(7)}
                   className="w-full bg-emerald-500 text-white h-16 rounded-2xl text-[10px] uppercase tracking-[0.25em] font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   {loading ? 'Processing...' : (
                       <>
                        <span>Finish & Go Online</span>
                        <ShieldCheck size={18} />
                       </>
                   )}
                 </button>
            </div>
        )}
      </div>
    </div>
  );
}
