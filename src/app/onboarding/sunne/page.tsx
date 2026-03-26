'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { Specialty, Gender, Plan } from '@/types';
import { Heart, User, Image as ImageIcon, Smile, ArrowRight, ArrowLeft, CheckCircle2, Phone, Briefcase, Star, Info, Sparkles, Upload } from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';

const SPECIALTIES: { id: Specialty; label: string }[] = [
  { id: 'relationship', label: 'रिश्ते (Relationship) 💔' },
  { id: 'stress', label: 'तनाव (Stress) 😤' },
  { id: 'loneliness', label: 'अकेलापन (Loneliness) 🌧' },
  { id: 'family', label: 'परिवार (Family) 👨‍👩‍👦' },
  { id: 'work', label: 'काम (Work) 💼' },
  { id: 'grief', label: 'शोक (Grief) 🕯' },
  { id: 'anxiety', label: 'घबराहट (Anxiety) 😰' },
  { id: 'motivation', label: 'प्रेरणा (Motivation) 🔥' },
  { id: 'general', label: 'सामान्य चर्चा (General) 💬' },
];

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'पुरुष' },
  { id: 'female', label: 'महिला' },
  { id: 'non-binary', label: 'अन्य' },
  { id: 'prefer_not_to_say', label: 'बताना नहीं चाहते' },
];

interface Avatar {
  id: string;
  url: string;
  category: 'boy' | 'girl' | 'baby';
}

export default function SunneOnboarding() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Step 1: DP
  const [dpMode, setDpMode] = useState<'photo' | 'avatar' | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarCategory, setAvatarCategory] = useState<'all' | 'boy' | 'girl' | 'baby'>('all');
  const [dbAvatars, setDbAvatars] = useState<Avatar[]>([]);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
  const [plans, setPlans] = useState<Plan[]>([
    { id: '1', heading: 'मन की बात', minutes: 5, price: 50, description: '', bannerUrl: null },
    { id: '2', heading: 'गहरी चर्चा', minutes: 15, price: 150, description: '', bannerUrl: null },
    { id: '3', heading: 'दिल से जुड़ाव', minutes: 30, price: 300, description: '', bannerUrl: null },
  ]);

  // Step 7: Phone (Manual Verification)
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvatars = async () => {
      setAvatarLoading(true);
      try {
        const q = avatarCategory === 'all' 
          ? query(collection(db, 'avatars'))
          : query(collection(db, 'avatars'), where('category', '==', avatarCategory));
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Avatar));
        setDbAvatars(data);
      } catch (err) {
        console.error('Error fetching avatars:', err);
      } finally {
        setAvatarLoading(false);
      }
    };
    fetchAvatars();
  }, [avatarCategory]);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCustomUrl(null);
    setErrorMsg(null);
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
      case 1: return dpMode === 'avatar' ? selectedAvatarUrl !== null : previewUrl !== null;
      case 2: return displayName.length >= 2 && headline.length >= 5;
      case 3: return bio.length >= 20;
      case 4: return specialties.length >= 1;
      case 5: return gender !== null && Number(age) >= 18 && Number(age) <= 65;
      case 6: return plans.every((p) => p.heading && p.minutes && (p.price || 0) >= 10);
      case 7: return phone.length === 10;
      default: return false;
    }
  };

  const handleNext = async () => {
    setErrorMsg(null);
    if (!canProceed()) {
      setErrorMsg('क्षमा करें! सभी जानकारी भरना अनिवार्य है।');
      return;
    }

    if (step === 1 && dpMode === 'photo' && customFile && !customUrl) {
      setUploadLoading(true);
      try {
        const url = await uploadToImgBB(customFile);
        setCustomUrl(url);
        setStep(2);
      } catch (err: any) {
        setErrorMsg('फोटो अपलोड विफल हो गया। कृपया पुन: प्रयास करें।');
      } finally {
        setUploadLoading(false);
      }
      return;
    }

    if (step < totalSteps) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const avatar = dpMode === 'avatar' ? selectedAvatarUrl : customUrl;
      const finalAvatar = avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=kush'; 

      const username = displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 20) + '-' + Date.now().toString(36).slice(-4);

      const completePlans: Plan[] = plans.map((p, i) => ({
        id: p.id || `plan_${i + 1}`,
        heading: p.heading || '',
        minutes: p.minutes || 5,
        price: p.price || 50,
        description: p.description || '',
        bannerUrl: p.bannerUrl || null,
      }));

      const updateData = {
        displayName,
        avatarUrl: finalAvatar,
        headline,
        bio,
        specialties,
        gender,
        age: Number(age),
        plans: completePlans,
        username,
        isAvailable: false,
        isVerified: false,
        verificationStatus: 'pending',
        phoneNumber: phone ? `+91${phone}` : null,
        registeredAt: serverTimestamp(),
        activeRole: 'sunne_wala',
        roles: arrayUnion('sunne_wala'),
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);

      setUser({
        ...user,
        ...updateData,
        roles: Array.isArray(user.roles) ? [...user.roles, 'sunne_wala'] : ['sunne_wala']
      } as any);

      router.push('/sunne/dashboard');
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
      <div className="absolute top-10 flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step > i ? 'w-10 bg-accent' : 'w-3 bg-accent/20'}`} 
          />
        ))}
      </div>

      <div className="w-full max-w-[460px] glass-container rounded-main p-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-black uppercase tracking-widest mb-8">
           <Heart size={14} fill="currentColor" strokeWidth={0} />
           चरण {step} / {totalSteps}
        </div>

        <div className="min-h-[420px] flex flex-col justify-start gap-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight tracking-tight">पहचान चुनें ✨</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed">सुनने वाले लोग आपका चेहरा या प्रोफाइल देखकर आपसे जुड़ेंगे।</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setDpMode('photo'); setCustomUrl(null); }}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${
                    dpMode === 'photo' ? 'border-accent bg-accent/5' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <Upload size={28} className="text-accent" />
                  <p className="text-[14px] font-black text-text">अपनी फोटो</p>
                </button>

                <button
                  onClick={() => { setDpMode('avatar'); setSelectedAvatarUrl(null); }}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${
                    dpMode === 'avatar' ? 'border-accent bg-accent/5' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <Smile size={28} className="text-accent" />
                  <p className="text-[14px] font-black text-text">अवतार चुनें</p>
                </button>
              </div>

              {dpMode === 'photo' && (
                <div className="relative p-8 rounded-2xl border-2 border-dashed border-accent/20 bg-accent/5 flex flex-col items-center gap-4 cursor-pointer">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCustomUpload} />
                  {uploadLoading ? (
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                       <p className="text-[10px] font-black text-accent uppercase animate-pulse">सबमिट हो रहा है...</p>
                    </div>
                  ) : (previewUrl || customUrl) ? (
                    <img src={previewUrl || customUrl || ''} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-accent/40" />
                      <p className="text-[13px] font-bold text-text-secondary text-center">फोटो अपलोड करने के लिए यहाँ क्लिक करें</p>
                    </>
                  )}
                </div>
              )}

              {dpMode === 'avatar' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
                    {(['all', 'boy', 'girl', 'baby'] as const).map(cat => (
                      <button key={cat} onClick={() => setAvatarCategory(cat)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${avatarCategory === cat ? 'bg-white text-accent shadow-sm' : 'text-slate-400'}`}>
                        {cat === 'all' ? 'सभी' : cat === 'boy' ? 'लड़का' : cat === 'girl' ? 'लड़की' : 'बच्चा'}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-2">
                    {avatarLoading ? [1,2,3].map(i => <div key={i} className="aspect-square rounded-xl bg-slate-50 animate-pulse" />) :
                     dbAvatars.map((av) => (
                      <button key={av.id} onClick={() => setSelectedAvatarUrl(av.url)} className={`aspect-square rounded-xl overflow-hidden border-4 transition-all ${selectedAvatarUrl === av.url ? 'border-accent scale-105' : 'border-transparent'}`}>
                        <img src={av.url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-[36px] font-black text-gradient leading-tight">आपका नाम ❤️</h2>
                <p className="text-text-secondary text-[16px] font-medium leading-relaxed">एक सुंदर सा नाम और हेडलाइन लिखें।</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-400 px-3 uppercase tracking-widest">डिस्प्ले नाम</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="जैसे: कबीर" className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-[18px] font-bold focus:outline-none focus:ring-4 focus:ring-accent/10" />
                </div>
                <div className="space-y-2">
                   <label className="text-[12px] font-black text-slate-400 px-3 uppercase tracking-widest">हेडलाइन</label>
                   <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="मैं हूँ आपकी बात सुनने के लिए..." className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-[16px] font-bold focus:outline-none focus:ring-4 focus:ring-accent/10" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent">अपने बारे में बतायें ✍️</h2>
                <p className="text-text-secondary text-[15px]">लोग आपके बारे में पढ़ना चाहेंगे।</p>
              </div>
              <div className="relative">
                <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 300))} placeholder="आप एक अच्छे लिसनर क्यों हैं? थोड़ा विस्तार से लिखिये..." rows={8} className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-100 text-[16px] leading-relaxed resize-none focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm" />
                <div className="absolute bottom-5 right-5 text-[11px] font-black text-white bg-accent px-3 py-1 rounded-full">{bio.length} / 300</div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent">आपकी विशेषज्ञता? 🌟</h2>
                <p className="text-text-secondary text-[15px]">किन विषयों पर आप अच्छी बातचीत कर सकते हैं?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button key={s.id} onClick={() => toggleSpecialty(s.id)} className={`px-5 py-3 rounded-2xl text-[14px] font-bold transition-all ${specialties.includes(s.id) ? 'bg-accent text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}>{s.label}</button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent">व्यक्तिगत विवरण</h2>
                <p className="text-text-secondary text-[15px]">ताकि हम आपको सही लोगों से मिला सकें।</p>
              </div>
              <div className="space-y-6">
                 <div>
                   <label className="text-[12px] font-black text-slate-400 px-3 uppercase tracking-widest block mb-3">जेंडर</label>
                   <div className="grid grid-cols-2 gap-3">
                    {GENDERS.map((g) => (
                      <button key={g.id} onClick={() => setGender(g.id)} className={`h-14 rounded-2xl text-[14px] font-bold transition-all ${gender === g.id ? 'bg-accent text-white' : 'bg-slate-50 text-slate-500'}`}>{g.label}</button>
                    ))}
                  </div>
                 </div>
                 <div>
                  <label className="text-[12px] font-black text-slate-400 px-3 uppercase tracking-widest block mb-3">आपकी आयु (वर्ष)</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="w-28 h-16 text-center text-[24px] font-black rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-accent/10" />
                 </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-accent">प्राइजिंग और प्लान 💸</h2>
                <p className="text-text-secondary text-[15px]">अपनी सुविधा अनुसार 3 प्लान चुनें।</p>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {plans.map((plan, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                    <input value={plan.heading} onChange={(e) => updatePlan(i, 'heading', e.target.value)} placeholder="प्लान का नाम..." className="w-full bg-transparent border-b border-accent/20 text-[18px] font-black focus:border-accent outline-none" />
                    <div className="flex gap-4">
                      <select value={plan.minutes} onChange={(e) => updatePlan(i, 'minutes', Number(e.target.value))} className="flex-1 h-14 px-4 rounded-xl bg-white text-[14px] font-bold outline-none border border-slate-200">
                        {[5, 10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} मिनट</option>)}
                      </select>
                      <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-black">₹</span>
                        <input type="number" value={plan.price === 0 ? '' : plan.price} onFocus={(e) => e.target.select()} onChange={(e) => updatePlan(i, 'price', e.target.value === '' ? 0 : Number(e.target.value))} className="w-full h-14 pl-8 pr-4 rounded-xl bg-white text-[16px] font-black outline-none border border-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                 <div className="px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-[14px] leading-snug animate-pulse italic">
                   यह जानकारी किसी को नहीं दिखाई जाएगी, यह सिर्फ वेरिफिकेशन के लिए है।
                 </div>
                 <h2 className="text-[32px] font-black text-gradient leading-tight tracking-tight">अंतिम चरण: वेरिफिकेशन 📞</h2>
                 <p className="text-text-secondary text-[16px] font-medium leading-relaxed italic">वेरिफिकेशन के बाद आप एक 'Verified Listener' बन जायेंगे।</p>
              </div>
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-slate-400 px-3 uppercase tracking-widest block font-bold">आपका मोबाइल नंबर</label>
                  <div className="flex gap-3">
                    <div className="w-20 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-accent shadow-sm">+91</div>
                    <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876XXXXXX" className="flex-1 h-16 px-6 rounded-2xl bg-white border border-slate-200 text-[20px] font-black tracking-widest focus:ring-4 focus:ring-accent/10 focus:outline-none" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                   <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-[12px] text-amber-700 leading-snug font-bold">
                     सबमिट करने के बाद एडमिन आपके जेंडर और नंबर की पुष्टि करेंगे। इसके बाद ये जानकारी बदली नहीं जा सकेगी।
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 space-y-4">
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
              disabled={loading || (step === 1 && dpMode === 'photo' && uploadLoading)}
              className="flex-1 h-18 bg-accent text-white rounded-2xl font-black text-[17px] shadow-xl shadow-accent/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{step === totalSteps ? 'प्रोफाइल सबमिट करें ✨' : 'आगे बढ़ें'}</span>
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
