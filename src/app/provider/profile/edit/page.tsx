'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    ArrowLeft, 
    Save, 
    User, 
    Sparkles, 
    Lock,
    CheckCircle2,
    Info,
    Clock
} from 'lucide-react';
import { Gender, Specialty } from '@/types';

const GENDER_OPTIONS = [
  { id: 'male', label: 'पुरुष' },
  { id: 'female', label: 'महिला' },
  { id: 'non-binary', label: 'अन्य' },
  { id: 'prefer_not_to_say', label: 'बताना नहीं चाहते' },
];

export default function SunneEditProfilePage() {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        gender: user?.gender || 'female',
        age: user?.age || 18,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                headline: user.headline || '',
                bio: user.bio || '',
                gender: user.gender || 'female',
                age: user.age || 18,
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            const updates: any = {
                displayName: formData.displayName,
                headline: formData.headline,
                bio: formData.bio,
                age: Number(formData.age),
                updatedAt: new Date(),
            };

            // STRICT GENDER LOCK CHECK
            if (!user.isGenderLocked) {
                updates.gender = formData.gender;
            }

            await updateDoc(userRef, updates);
            setUser({ ...user, ...updates });
            alert('प्रोफ़ाइल अपडेट हो गई! ✨');
            router.push('/provider/profile');
        } catch (err) {
            console.error('Update failed:', err);
            alert('क्षमा करें, कुछ गलती हो गई।');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4">
            <div className="flex items-center justify-between">
                <button 
                  onClick={() => router.back()}
                  className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tighter">प्रोफ़ाइल एडिट करें</h1>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-accent text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> ऑपडेट करें</>}
                </button>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="glass bg-white p-8 rounded-[3rem] border border-white shadow-sm space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">नाम (Display Name)</label>
                        <input 
                            value={formData.displayName}
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">हेडलाइन (Headline)</label>
                        <input 
                            value={formData.headline}
                            onChange={(e) => setFormData({...formData, headline: e.target.value})}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="glass bg-white p-8 rounded-[3rem] border border-white shadow-sm">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">आपके बारे में (Bio)</label>
                        <textarea 
                            value={formData.bio}
                            rows={5}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-accent/10 transition-all resize-none"
                        />
                    </div>
                </div>

                {/* PHONE LOCK SECTION */}
                <div className="glass bg-white p-8 rounded-[3rem] border border-white shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">फ़ोन वेरिफिकेशन</label>
                            <p className="text-[11px] text-slate-500 font-medium px-2">वेरिफाइड फ़ोन आपकी सुरक्षा के लिए है।</p>
                        </div>
                        {user?.isVerified ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/5 text-success rounded-xl text-[10px] font-black uppercase tracking-widest border border-success/10 shadow-sm">
                                <CheckCircle2 size={12} strokeWidth={3} /> वेरिफाइड
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                                <Clock size={12} strokeWidth={3} /> पेंडिंग
                            </div>
                        )}
                    </div>
                    
                    <div className="px-6 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between opacity-70">
                        <span className="font-black text-slate-400 text-[16px] tracking-widest">{user?.phoneNumber || 'No Number'}</span>
                        <Lock size={16} className="text-slate-300" />
                    </div>
                </div>

                {/* GENDER LOCK SECTION */}
                <div className="glass bg-white p-8 rounded-[3rem] border border-white shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">जेंडर (Gender)</label>
                            <p className="text-[11px] text-slate-500 font-medium px-2">वेरिफाइड जेंडर से भरोसा बढ़ता है।</p>
                        </div>
                        {user?.isGenderLocked && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">
                                <Lock size={12} strokeWidth={3} /> लॉक (Locked)
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {GENDER_OPTIONS.map((g) => (
                            <button
                                key={g.id}
                                disabled={user?.isGenderLocked}
                                onClick={() => setFormData({...formData, gender: g.id as any})}
                                className={`h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
                                    formData.gender === g.id 
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]' 
                                    : 'bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900'
                                } ${user?.isGenderLocked ? 'opacity-50 cursor-not-allowed contrast-75' : ''}`}
                            >
                                {g.label}
                                {user?.isGenderLocked && formData.gender === g.id && <CheckCircle2 size={12} className="inline ml-2 fill-current" />}
                            </button>
                        ))}
                    </div>

                    {user?.isGenderLocked && (
                        <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3 animate-in slide-in-from-top-2">
                            <Info size={16} className="text-amber-400" />
                            <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                                आपका जेंडर एडमिन द्वारा वेरीफाई कर दिया गया है। अब ये बदला नहीं जा सकता।
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-2 px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">आपकी उम्र (Age)</label>
                    <input 
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                        className="w-24 h-14 text-center rounded-2xl bg-white border border-slate-100 font-black text-xl outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
}

