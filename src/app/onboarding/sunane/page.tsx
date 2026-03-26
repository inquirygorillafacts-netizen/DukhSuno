'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { AVATAR_OPTIONS } from '@/types';
import type { Specialty } from '@/types';
import { Heart, User, Sparkles, Smile, ArrowRight, ArrowLeft, Info, Phone } from 'lucide-react';

const MOOD_CHIPS: { id: Specialty; label: string }[] = [
  { id: 'relationship', label: 'रिश्ते (Relationship) 💔' },
  { id: 'stress', label: 'तनाव (Stress) 😤' },
  { id: 'loneliness', label: 'अकेलापन (Loneliness) 🌧' },
  { id: 'family', label: 'परिवार (Family) 👨‍👩‍👦' },
  { id: 'work', label: 'काम (Work) 💼' },
  { id: 'grief', label: 'शोक (Grief) 🕯' },
  { id: 'general', label: 'सामान्य चर्चा 💬' },
];

export default function SunaneOnboarding() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [moodTag, setMoodTag] = useState<Specialty | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canProceed = () => {
    switch (step) {
      case 1: return displayName.length >= 2;
      case 2: return selectedAvatar !== null;
      case 3: return moodTag !== null;
      case 4: return phone.length === 10;
      default: return false;
    }
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (!canProceed()) {
      setErrorMsg('क्षमा करें! सभी जानकारी भरना अनिवार्य है।');
      return;
    }
    if (step < totalSteps) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const avatar = selectedAvatar !== null
        ? `emoji:${AVATAR_OPTIONS[selectedAvatar].emoji}:${AVATAR_OPTIONS[selectedAvatar].bg}`
        : 'emoji:😊:#FFE3E8';

      const updateData = {
        displayName,
        avatarUrl: avatar,
        activeRole: 'sunane_wala',
        roles: arrayUnion('sunane_wala'),
        phoneNumber: phone ? `+91${phone}` : null,
        verificationStatus: 'pending',
        isVerified: false,
        registeredAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);

      setUser({
        ...user,
        ...updateData,
        roles: Array.isArray(user.roles) ? [...user.roles, 'sunane_wala'] : ['sunane_wala'],
      } as any);

      router.push('/sunane/home');
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('सबमिट करते समय त्रुटि हुई। कृपया पुन: प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-white">
      {/* Progress Dots */}
      <div className="absolute top-12 flex items-center justify-center gap-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step > i ? 'w-10 bg-accent' : 'w-4 bg-accent/20'}`} 
          />
        ))}
      </div>

      <div className="w-full max-w-[440px] glass-container rounded-main p-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-black uppercase tracking-widest mb-8">
           <Heart size={14} fill="currentColor" strokeWidth={0} />
           चरण {step} / {totalSteps}
        </div>

        <div className="min-h-[380px] flex flex-col justify-start gap-8">
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight">गुप्त नाम ✨</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed">अपनी पहचान छुपाएं, दुख सुनाएं। कोई अच्छा सा नाम चुनें!</p>
              </div>
              <div className="space-y-3">
                <label className="text-[12px] font-black text-slate-400 px-3 uppercase tracking-widest">आपका नाम</label>
                <div className="relative">
                  <User size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/40" />
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                    placeholder="जैसे: कबीर..."
                    className="w-full h-18 px-14 rounded-2xl bg-slate-50 border border-slate-100 text-[18px] font-bold focus:ring-4 focus:ring-accent/10 focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-3">
                 <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
                 <p className="text-[13px] text-accent/80 leading-relaxed font-bold">यह नाम आपकी सुरक्षा के लिए है। इसे कोई देख नहीं सकेगा।</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight">अवतार चुनें 🦋</h2>
                <p className="text-text-secondary text-[16px] font-medium">असली फोटो की ज़रूरत नहीं, एक प्यारा सा इमोजी चुनें।</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {AVATAR_OPTIONS.map((avatar, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAvatar(i)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all ${
                      selectedAvatar === i ? 'bg-accent text-white scale-110 shadow-lg' : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight">आज का मूड? 🌈</h2>
                <p className="text-text-secondary text-[16px] font-medium">ताकि हम आपको सही लिसनर से जोड़ सकें।</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {MOOD_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setMoodTag(chip.id)}
                    className={`px-5 py-3 rounded-xl text-[14px] font-bold transition-all ${
                      moodTag === chip.id ? 'bg-accent text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                 <div className="px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-[14px] animate-pulse">
                   यह जानकारी किसी को नहीं दिखाई जाएगी।
                 </div>
                 <h2 className="text-[32px] font-black text-gradient tracking-tight">वेरिफिकेशन 📞</h2>
                 <p className="text-text-secondary text-[16px] font-medium">अंतिम चरण: सुरक्षित भविष्य के लिए।</p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-400 px-3 uppercase tracking-widest block">मोबाइल नंबर</label>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-accent">+91</div>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876XXXXXX"
                      className="flex-1 h-16 px-6 rounded-2xl bg-white border border-slate-200 text-[20px] font-black tracking-widest focus:ring-4 focus:ring-accent/10 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 text-[13px] font-bold animate-shake flex items-center gap-2">
              <Info size={14} /> {errorMsg}
            </div>
          )}
          <div className="flex gap-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="w-16 h-18 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-accent transition-all">
                <ArrowLeft size={24} />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 h-18 bg-accent text-white rounded-2xl font-black text-[17px] shadow-xl shadow-accent/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{step === totalSteps ? 'शुरू करें ✨' : 'आगे बढ़ें'}</span>
                  {step < totalSteps && <ArrowRight size={22} />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
