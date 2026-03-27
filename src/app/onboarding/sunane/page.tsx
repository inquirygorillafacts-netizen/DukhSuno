'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { AVATAR_OPTIONS } from '@/types';
import type { Specialty } from '@/types';
import { Heart, User, Sparkles, Smile, ArrowRight, ArrowLeft, Info, Phone, Upload, X, Image as ImageIcon } from 'lucide-react';

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
  const totalSteps = 2;
  const [displayName, setDisplayName] = useState('');
  
  // Avatar State
  const [dpMode, setDpMode] = useState<'upload' | 'skip' | null>(null);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCustomUrl(null);
    setErrorMsg(null);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return displayName.length >= 2;
      case 2: return dpMode !== null && (dpMode === 'skip' || previewUrl !== null);
      default: return false;
    }
  };

  const handleNext = async () => {
    setErrorMsg(null);
    if (!canProceed()) {
      setErrorMsg('कृपया संबंधित जानकारी भरें।');
      return;
    }

    if (step === 2 && dpMode === 'upload' && customFile && !customUrl) {
      setUploadLoading(true);
      try {
        const url = await uploadToImgBB(customFile);
        setCustomUrl(url);
        // After upload, since it's the last step, complete it.
        handleCompleteWithAvatar(url);
      } catch (err) {
        setErrorMsg('फोटो अपलोड विफल रहा। कृपया पुन: प्रयास करें।');
      } finally {
        setUploadLoading(false);
      }
      return;
    }

    if (step < totalSteps) setStep(step + 1);
    else handleComplete();
  };

  const handleCompleteWithAvatar = async (avatarUrl: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const updateData = {
        displayName,
        avatarUrl: avatarUrl,
        activeRole: 'sunane_wala',
        roles: arrayUnion('sunane_wala'),
        isVerified: true,
        verificationStatus: 'verified',
        registeredAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'users', user.uid), updateData);
      setUser({ ...user, ...updateData, roles: Array.isArray(user.roles) ? [...user.roles, 'sunane_wala'] : ['sunane_wala'] } as any);
      router.push('/sunane/home');
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('सबमिट करते समय त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const avatar = dpMode === 'upload' && customUrl 
        ? customUrl 
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=DukhSuno_Speaker'; // Premium Professional Default

      const updateData = {
        displayName,
        avatarUrl: avatar,
        activeRole: 'sunane_wala',
        roles: arrayUnion('sunane_wala'),
        isVerified: true,
        verificationStatus: 'verified',
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

      <div className="w-full max-w-[480px] glass-container rounded-[3rem] p-8 md:p-12 relative z-10 shadow-2xl border border-slate-50">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[11px] font-black uppercase tracking-widest mb-10">
           <Heart size={14} fill="currentColor" strokeWidth={0} />
           {step === 1 ? 'नाम (Name)' : 'पहचान (DP)'} — चरण {step} / {totalSteps}
        </div>

        <div className="min-h-[440px] flex flex-col justify-start gap-8">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <h2 className="text-[40px] font-black text-gradient leading-tight tracking-tighter italic">Swagat Hai! ✨</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed italic">Dil ki baat sunaane ke liye bas ek gupt naam chunein.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 px-3 uppercase tracking-[0.3em] font-bold">Aapka Gupt Naam</label>
                <div className="relative group">
                  <User size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-accent/40 group-focus-within:text-accent transition-colors" />
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                    placeholder="Jaise: Kabir, Rahul..."
                    className="w-full h-20 px-16 rounded-[2rem] bg-slate-50 border border-slate-100 text-[20px] font-black tracking-tight focus:ring-8 focus:ring-accent/5 focus:bg-white focus:border-accent/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight italic">Profile Photo 🦋</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed italic">Aap apni real photo laga sakte hain ya hamara professional avatar.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDpMode('upload')}
                  className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all shadow-sm ${
                    dpMode === 'upload' ? 'border-accent bg-accent/5 scale-105' : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dpMode === 'upload' ? 'bg-accent text-white' : 'bg-white text-accent shadow-inner'}`}>
                    <Upload size={28} />
                  </div>
                  <p className="text-[14px] font-black text-slate-800 uppercase tracking-tighter">Photo Upload</p>
                </button>

                <button
                  onClick={() => { setDpMode('skip'); setPreviewUrl(null); setCustomFile(null); }}
                  className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all shadow-sm ${
                    dpMode === 'skip' ? 'border-accent bg-accent/5 scale-105' : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dpMode === 'skip' ? 'bg-accent text-white' : 'bg-white text-accent shadow-inner'}`}>
                    <Smile size={28} />
                  </div>
                  <p className="text-[14px] font-black text-slate-800 uppercase tracking-tighter">Skip & Default</p>
                </button>
              </div>

              {dpMode === 'upload' && (
                <div className="relative p-10 rounded-[2.5rem] border-2 border-dashed border-accent/20 bg-accent/5 flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-300">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCustomUpload} />
                  {uploadLoading ? (
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                       <p className="text-[11px] font-black text-accent uppercase tracking-widest animate-pulse">Photo Upload ho rahi hai...</p>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative">
                        <img src={previewUrl} className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl" alt="Preview" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setCustomFile(null); setCustomUrl(null); }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                           <X size={16} />
                        </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-accent/20 border border-accent/10 shadow-inner">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-[14px] font-black text-accent/60 text-center uppercase tracking-tight">Tap to pick your best photo</p>
                    </>
                  )}
                </div>
              )}

              {dpMode === 'skip' && (
                 <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-start gap-4 animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                       <Heart size={24} fill="currentColor" strokeWidth={0} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[14px] font-black text-emerald-900 leading-tight">Professional Default Settings</p>
                       <p className="text-[12px] text-emerald-600 font-medium italic">Humne aapke liye ek professional avatar select kar liya hai. Aap isse baad mein badal sakte hain.</p>
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-18 h-20 rounded-[1.8rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-accent transition-all active:scale-90">
              <ArrowLeft size={28} />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading || uploadLoading}
            className="flex-1 h-20 bg-accent text-white rounded-[2rem] font-black text-[18px] shadow-2xl shadow-accent/30 flex items-center justify-center gap-4 transition-all active:scale-95 hover:brightness-110 disabled:opacity-50"
          >
            {loading || uploadLoading ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="uppercase tracking-widest leading-none">
                    {step === totalSteps ? 'Finish Setting Up ✨' : 'Continue'}
                </span>
                {step < totalSteps && <ArrowRight size={24} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
