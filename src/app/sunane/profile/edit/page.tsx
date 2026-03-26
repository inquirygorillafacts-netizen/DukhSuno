'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AVATAR_OPTIONS } from '@/types';
import { 
    ArrowLeft, 
    Save, 
    Smile, 
    Lock,
    CheckCircle2,
    Info,
    Clock
} from 'lucide-react';

export default function SunaneEditProfilePage() {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            // Try to match avatar from emoji string
            if (user.avatarUrl?.startsWith('emoji:')) {
                const emoji = user.avatarUrl.split(':')[1];
                const idx = AVATAR_OPTIONS.findIndex(a => a.emoji === emoji);
                if (idx !== -1) setSelectedAvatar(idx);
            }
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const avatar = selectedAvatar !== null
                ? `emoji:${AVATAR_OPTIONS[selectedAvatar].emoji}:${AVATAR_OPTIONS[selectedAvatar].bg}`
                : user.avatarUrl;

            const updateData = {
                displayName,
                avatarUrl: avatar,
                updatedAt: new Date(),
            };

            await updateDoc(doc(db, 'users', user.uid), updateData);
            setUser({ ...user, ...updateData });
            alert('प्रोफ़ाइल अपडेट हो गई! ✨');
            router.push('/sunane/profile');
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
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> अपडेट करें</>}
                </button>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="glass bg-white p-8 rounded-[3rem] border border-white shadow-sm space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">गुप्त नाम (Pseudo Name)</label>
                        <input 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                        />
                    </div>
                </div>

                {/* Avatar Selection */}
                <div className="glass bg-white p-8 rounded-[3rem] border border-white shadow-sm space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">अवतार बदलें (Change Avatar)</label>
                    <div className="grid grid-cols-4 gap-4">
                        {AVATAR_OPTIONS.map((avatar, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedAvatar(i)}
                                className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all ${
                                    selectedAvatar === i ? 'bg-accent text-white scale-110 shadow-lg' : 'bg-slate-50 border border-slate-100 opacity-60'
                                }`}
                            >
                                {avatar.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PHONE LOCK SECTION */}
                <div className="glass bg-white p-8 rounded-[3rem] border border-white shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">फ़ोन वेरिफिकेशन</label>
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

                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3">
                    <Info size={16} className="text-amber-400 shrink-0" />
                    <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                        सुरक्षा कारणों से फ़ोन नंबर बदला नहीं जा सकता। अन्य जानकारी आप कभी भी बदल सकते हैं।
                    </p>
                </div>
            </div>
        </div>
    );
}
