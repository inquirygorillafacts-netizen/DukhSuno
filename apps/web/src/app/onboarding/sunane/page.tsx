'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { AVATAR_OPTIONS, SPECIALTY_LABELS } from '@/types';
import type { Specialty } from '@/types';
import { Heart, User, Sparkles, Smile, ArrowRight, ArrowLeft } from 'lucide-react';

type Step = 1 | 2 | 3;

const MOOD_CHIPS: { id: Specialty; label: string }[] = [
  { id: 'relationship', label: 'Relationship 💔' },
  { id: 'stress', label: 'Stress 😤' },
  { id: 'loneliness', label: 'Loneliness 🌧' },
  { id: 'family', label: 'Family 👨‍👩‍👦' },
  { id: 'work', label: 'Work 💼' },
  { id: 'grief', label: 'Grief 🕯' },
  { id: 'general', label: 'Just venting 💬' },
];

export default function SunaneOnboarding() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [moodTag, setMoodTag] = useState<Specialty | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else handleComplete();
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const avatar = selectedAvatar !== null
        ? `emoji:${AVATAR_OPTIONS[selectedAvatar].emoji}:${AVATAR_OPTIONS[selectedAvatar].bg}`
        : 'emoji:😊:#FFE3E8';

      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        avatarUrl: avatar,
        activeRole: 'sunane_wala',
      });

      setUser({
        ...user,
        displayName,
        avatarUrl: avatar,
        activeRole: 'sunane_wala',
      });

      router.push('/sunane/home');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const canProceed = step === 1 ? displayName.length >= 2 : step === 2 ? selectedAvatar !== null : true;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* Progress Heart Mask */}
      <div className="absolute top-12 flex items-center justify-center gap-3">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-10 bg-accent' : 'w-4 bg-accent/20'}`} 
          />
        ))}
      </div>

      <div className="w-full max-w-[440px] glass-container rounded-main p-8 relative z-10 stagger-children">
        
        {/* Step Indicator Tooltip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-black uppercase tracking-widest mb-8">
           <Heart size={14} fill="currentColor" strokeWidth={0} />
           Step {step} / 3
        </div>

        {/* content */}
        <div className="min-h-[380px] flex flex-col justify-start gap-8">
          
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Secret Naam ✨</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed">Identity chhupayein, dukh sunayein. Kuch cool sa chuna na!</p>
              </div>

              <div className="space-y-3 relative group">
                <label className="text-[12px] font-black text-text-secondary/60 px-3 uppercase tracking-widest">Pseudo Name</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-accent/40 group-focus-within:text-accent transition-colors">
                    <User size={22} />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                    placeholder="Ex: Chand ka Mussafir..."
                    className="w-full h-18 px-14 rounded-2xl bg-white/40 border border-white/20 text-[18px] font-medium focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-accent-soft border border-accent-border/30 flex items-start gap-3">
                 <Sparkles size={20} className="text-accent shrink-0 mt-0.5" />
                 <p className="text-[13px] text-accent/80 leading-relaxed font-medium">Ye naam aapki security ke liye hai. Yeh koi nahi dekh sakega.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Ek Avatar 🦋</h2>
                <p className="text-text-secondary text-[16px] font-medium">Real photo ki zaroorat nahi, ek piyara sa emoji chunein.</p>
              </div>

              <div className="grid grid-cols-4 gap-4 pb-4">
                {AVATAR_OPTIONS.map((avatar, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAvatar(i)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 relative ${
                      selectedAvatar === i
                        ? 'bg-accent text-white scale-110 shadow-xl shadow-accent/20 z-10'
                        : 'bg-white/40 border border-white/20 grayscale-[0.5] hover:grayscale-0'
                    }`}
                  >
                    {avatar.emoji}
                    {selectedAvatar === i && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-accent">
                        <Smile size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Aaj ka Mood? 🌈</h2>
                <p className="text-text-secondary text-[16px] font-medium">Taki hum sahi listener se connect kar sakein.</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {MOOD_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setMoodTag(moodTag === chip.id ? null : chip.id)}
                    className={`px-5 py-3 rounded-xl text-[14px] font-bold transition-all duration-300 ${
                      moodTag === chip.id
                        ? 'bg-accent text-white shadow-xl shadow-accent/20 scale-105'
                        : 'bg-white/40 border border-white/20 text-text-secondary hover:bg-white/60'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="w-16 h-18 rounded-2xl bg-white/40 border border-white/20 flex items-center justify-center text-text-secondary hover:bg-white/60 transition-all active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="flex-1 h-18 btn-primary rounded-full shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-[17px] tracking-wide">{step === 3 ? 'Shuru Karein' : 'Next Step'}</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center">
         <p className="text-accent/30 font-black uppercase tracking-[0.4em] text-[11px]">DukhSuno Premium</p>
      </div>
    </div>
  );
}
