'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { Specialty, Gender, Plan } from '@/types';
import { Heart, User, Image as ImageIcon, Smile, ArrowRight, ArrowLeft, CheckCircle2, Phone, Briefcase, Star, Info, Sparkles } from 'lucide-react';

const SPECIALTIES: { id: Specialty; label: string }[] = [
  { id: 'relationship', label: 'Relationship 💔' },
  { id: 'stress', label: 'Stress 😤' },
  { id: 'loneliness', label: 'Loneliness 🌧' },
  { id: 'family', label: 'Family 👨‍👩‍👦' },
  { id: 'work', label: 'Work 💼' },
  { id: 'grief', label: 'Grief 🕯' },
  { id: 'anxiety', label: 'Anxiety 😰' },
  { id: 'motivation', label: 'Motivation 🔥' },
  { id: 'general', label: 'General 💬' },
];

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'non-binary', label: 'Non-binary' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const LISTENER_AVATARS = ['🧑‍💼', '👩‍💼', '🧑‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻'];

export default function SunneOnboarding() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Step 1: DP
  const [dpMode, setDpMode] = useState<'photo' | 'avatar' | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  // Step 2: Name + Headline
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');

  // Step 3: Bio
  const [bio, setBio] = useState('');

  // Step 4: Specialties
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  // Step 5: Gender + Age
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState('');

  // Step 6: Plans
  const [plans, setPlans] = useState<Partial<Plan>[]>([
    { heading: '', minutes: 5, price: 50, description: '' },
    { heading: '', minutes: 15, price: 100, description: '' },
    { heading: '', minutes: 30, price: 200, description: '' },
  ]);

  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifiedPhone, setIsVerifiedPhone] = useState(false);
  const [loading, setLoading] = useState(false);

  const startPolling = (fullNumber: string) => {
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`/api/twilio/verify?phoneNumber=${encodeURIComponent(fullNumber)}`);
        const data = await resp.json();
        if (data.isVerified) {
          setIsVerifiedPhone(true);
          setOtpSent(false);
          clearInterval(interval);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 120000);
  };

  const toggleSpecialty = (s: Specialty) => {
    if (specialties.includes(s)) {
      setSpecialties(specialties.filter((x) => x !== s));
    } else if (specialties.length < 4) {
      setSpecialties([...specialties, s]);
    }
  };

  const updatePlan = (idx: number, field: string, value: string | number) => {
    const updated = [...plans];
    updated[idx] = { ...updated[idx], [field]: value };
    setPlans(updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return dpMode === 'avatar' ? selectedAvatar !== null : dpMode === 'photo';
      case 2: return displayName.length >= 2 && headline.length >= 5;
      case 3: return bio.length >= 20;
      case 4: return specialties.length >= 1;
      case 5: return gender !== null && Number(age) >= 18 && Number(age) <= 65;
      case 6: return plans.every((p) => p.heading && p.minutes && (p.price || 0) >= 10);
      case 7: return true;
      default: return false;
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const avatar = selectedAvatar !== null
        ? `avatar:${LISTENER_AVATARS[selectedAvatar]}`
        : 'avatar:🧑‍💼';

      const username = displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 20) + '-' + Date.now().toString(36).slice(-4);

      const completePlans: Plan[] = plans.map((p, i) => ({
        id: `plan_${i + 1}`,
        heading: p.heading || '',
        minutes: p.minutes || 5,
        price: p.price || 50,
        description: p.description || '',
        bannerUrl: null,
      }));

      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        avatarUrl: avatar,
        headline,
        bio,
        specialties,
        gender,
        age: Number(age),
        plans: completePlans,
        username,
        isAvailable: false,
        isVerified: isVerifiedPhone,
        verificationStatus: isVerifiedPhone ? 'verified' : 'pending',
        ratingAvg: 0,
        ratingCount: 0,
        totalSessions: 0,
        totalEarnings: 0,
        availableBalance: 0,
        phoneNumber: phone ? `+91${phone}` : null,
        registeredAt: serverTimestamp(),
        activeRole: 'sunne_wala',
      });

      setUser({
        ...user,
        displayName,
        avatarUrl: avatar,
        headline,
        bio,
        specialties,
        gender: gender!,
        age: Number(age),
        plans: completePlans,
        username,
        isAvailable: false,
        isVerified: false,
        verificationStatus: 'pending',
        activeRole: 'sunne_wala',
      });

      router.push('/sunne/dashboard');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Progress Dots */}
      <div className="absolute top-10 flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step > i ? 'w-10 bg-accent' : 'w-3 bg-accent/20'}`} 
          />
        ))}
      </div>

      <div className="w-full max-w-[460px] glass-container rounded-main p-8 relative z-10 stagger-children">
        
        {/* Step Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-black uppercase tracking-widest mb-8">
           <Heart size={14} fill="currentColor" strokeWidth={0} />
           Step {step} / {totalSteps}
        </div>

        {/* Content Area */}
        <div className="min-h-[440px] flex flex-col justify-start gap-6">
          
          {/* Step 1: DP */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Pehchan Chunein ✨</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed">Sunane wale log aapka chehra ya profile design dekhkar aapse judenge.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDpMode('photo')}
                  className={`group p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${
                    dpMode === 'photo' ? 'border-accent bg-accent/5 shadow-inner' : 'border-white/20 glass-container hover:border-accent/30'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-accent shadow-sm">
                    <ImageIcon size={28} />
                  </div>
                  <p className="text-[14px] font-black uppercase tracking-wider text-text">Real Photo</p>
                </button>

                <button
                  onClick={() => setDpMode('avatar')}
                  className={`group p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${
                    dpMode === 'avatar' ? 'border-accent bg-accent/5 shadow-inner' : 'border-white/20 glass-container hover:border-accent/30'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-accent shadow-sm">
                    <Smile size={28} />
                  </div>
                  <p className="text-[14px] font-black uppercase tracking-wider text-text">Cool Avatar</p>
                </button>
              </div>

              {dpMode === 'avatar' && (
                <div className="grid grid-cols-3 gap-3 p-4 glass-container rounded-2xl animate-scale-up border-accent/20">
                  {LISTENER_AVATARS.map((av, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAvatar(i)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all ${
                        selectedAvatar === i ? 'bg-accent text-white scale-110 shadow-lg' : 'bg-white/40 hover:bg-white/80'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Name + Headline */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Aapka Naam ❤️</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed">Headline aisi likhein jo dil ko chhu jaye!</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2 relative group">
                  <label className="text-[12px] font-black text-text-secondary/60 px-3 uppercase tracking-widest">Display Name</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/30 group-focus-within:text-accent transition-colors">
                      <User size={20} />
                    </div>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value.slice(0, 30))}
                      placeholder="Ex: Kush"
                      className="w-full h-16 px-14 rounded-2xl bg-white/40 border border-white/20 text-[18px] font-medium focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative group">
                  <label className="text-[12px] font-black text-text-secondary/60 px-3 uppercase tracking-widest">Headline</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/30 group-focus-within:text-accent transition-colors">
                      <Sparkles size={20} />
                    </div>
                    <input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value.slice(0, 60))}
                      placeholder="Hum hain na sunne ke liye... 💙"
                      className="w-full h-16 px-14 rounded-2xl bg-white/40 border border-white/20 text-[16px] font-medium focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Bio */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent leading-tight">Thoda Khulkar Bataiye ✍️</h2>
                <p className="text-text-secondary text-[15px]">Log aapke baare mein padhna chahenge.</p>
              </div>

              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  placeholder="Aap ek acche listener kyun hain? Aap logon ki help kaise karte hain? Thoda detail mein likhein..."
                  rows={6}
                  className="w-full p-6 rounded-2xl bg-white/40 border border-white/20 text-[16px] leading-relaxed resize-none focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                />
                <div className="absolute bottom-5 right-5 text-[11px] font-black text-white bg-accent px-3 py-1 rounded-full shadow-lg">
                  {bio.length} / 300
                </div>
              </div>
              {bio.length < 20 && bio.length > 0 && (
                <p className="text-[11px] text-error flex items-center gap-1.5 px-2 font-medium">
                  <Info size={12} /> Minimum 20 characters required.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Specialties */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent leading-tight">Aapki Specialties? 🌟</h2>
                <p className="text-text-secondary text-[15px]">Kin problems mein aap best advice dete hain?</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSpecialty(s.id)}
                    className={`px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                      specialties.includes(s.id) 
                        ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105' 
                        : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Gender + Age */}
          {step === 5 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent leading-tight">Basic Details</h2>
                <p className="text-text-secondary text-[15px]">Taki hum aapko sahi listener se connect kar sakein.</p>
              </div>

              <div className="space-y-4">
                 <label className="text-[12px] font-black text-text-secondary/60 px-3 uppercase tracking-widest">Gender</label>
                 <div className="grid grid-cols-2 gap-3">
                  {GENDERS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      className={`h-14 rounded-2xl text-[14px] font-bold transition-all ${
                        gender === g.id ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'bg-white/40 border border-white/20 text-text hover:bg-white/60'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[12px] font-black text-text-secondary/60 px-3 uppercase tracking-widest">Aapki Umra (Age)</label>
                <div className="flex justify-start">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-28 h-18 text-center text-[28px] font-black rounded-2xl bg-white/40 border border-white/20 outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Plans */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent leading-tight">Pricing & Plans 💸</h2>
                <p className="text-text-secondary text-[15px]">Teen alag options dijiye for different needs.</p>
              </div>

              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {plans.map((plan, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/40 border border-white/20 relative group space-y-5">
                    <div className="flex justify-between items-center">
                       <div className="px-3 py-1 bg-accent/10 rounded-full text-[11px] font-black text-accent uppercase flex items-center gap-1.5 border border-accent/20">
                         <Star size={12} fill="currentColor" /> Plan {i + 1}
                       </div>
                    </div>
                    
                    <input
                      value={plan.heading}
                      onChange={(e) => updatePlan(i, 'heading', e.target.value)}
                      placeholder={i === 0 ? 'Sirf sunne ke liye' : i === 1 ? 'Deep conversation' : 'Full session'}
                      className="w-full h-12 px-0 bg-transparent border-b border-accent/20 text-[18px] font-black focus:border-accent outline-none transition-all placeholder:text-text-secondary/40"
                    />
                    
                    <div className="flex gap-4">
                      <select
                        value={plan.minutes}
                        onChange={(e) => updatePlan(i, 'minutes', Number(e.target.value))}
                        className="flex-1 h-14 px-4 rounded-xl bg-white/80 text-[14px] font-black outline-none shadow-sm border border-white/40"
                      >
                        {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                          <option key={m} value={m}>{m} mins</option>
                        ))}
                      </select>
                      <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-black text-[15px]">₹</span>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => updatePlan(i, 'price', Number(e.target.value))}
                          className="w-full h-14 pl-8 pr-4 rounded-xl bg-white/80 text-[16px] font-black outline-none shadow-sm border border-white/40"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Phone (Verification) */}
          {step === 7 && (
            <div className="space-y-6">
               <div className="space-y-3">
                  <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Verification 📞</h2>
                  <p className="text-text-secondary text-[16px] font-medium leading-relaxed">Ek automatic verification call ayega, kyunki aapki suraksha hamari zimmedari hai.</p>
               </div>
               
              <div className="p-8 rounded-2xl glass-container border-accent/20">
                {!isVerifiedPhone ? (
                  <div className="space-y-8">
                    <div className="flex gap-3">
                      <div className="w-20 h-16 rounded-xl bg-white/80 flex items-center justify-center font-black text-accent shadow-sm border border-white/40">🇮🇳</div>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Phone number..."
                        className="flex-1 h-16 px-6 rounded-xl bg-white/80 text-[20px] font-black outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm border border-white/40"
                      />
                    </div>

                    {!otpSent ? (
                      <button 
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const fullNumber = `+91${phone}`;
                            const resp = await fetch('/api/twilio/verify', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phoneNumber: fullNumber })
                            });
                            const data = await resp.json();
                            if (data.validationCode) {
                              setOTP(data.validationCode);
                              setOtpSent(true);
                              startPolling(fullNumber);
                            } else { alert(data.error); }
                          } catch (e) { console.error(e); }
                          finally { setLoading(false); }
                        }}
                        disabled={phone.length < 10 || loading}
                        className="w-full h-18 btn-primary rounded-full shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 group"
                      >
                        {loading ? 'Please wait...' : <>Call Me Now <Phone size={22} className="group-hover:translate-x-1 transition-transform" /></>}
                      </button>
                    ) : (
                      <div className="text-center animate-scale-up space-y-5">
                         <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-accent/20">
                            <Phone size={28} />
                         </div>
                         <div className="space-y-2">
                            <p className="text-[14px] font-black text-text-secondary uppercase tracking-widest">Keypad pe ye code dalein:</p>
                            <div className="text-[54px] font-black text-accent tracking-[12px]">{otp}</div>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-2">
                               <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                               <div className="w-2 h-2 rounded-full bg-accent animate-bounce animation-delay-[200ms]" />
                               <div className="w-2 h-2 rounded-full bg-accent animate-bounce animation-delay-[400ms]" />
                            </div>
                            <p className="text-[12px] text-accent font-black uppercase tracking-[0.3em]">Detecting call...</p>
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 animate-scale-up space-y-6">
                     <div className="w-24 h-24 bg-success text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-success/40">
                        <CheckCircle2 size={48} />
                     </div>
                     <h3 className="text-[28px] font-black text-success tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Verified! 🎉</h3>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Navigation Section */}
        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-16 h-18 rounded-2xl bg-white/40 border border-white/20 flex items-center justify-center text-text-secondary hover:bg-white/60 transition-all active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 h-18 btn-primary rounded-full shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-[17px] tracking-wide">{step === totalSteps ? 'Ready to Shine ✨' : 'Continue'}</span>
                {step < totalSteps && <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
