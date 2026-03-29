'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    ChevronLeft, 
    Save, 
    User, 
    Sparkles, 
    Lock,
    CheckCircle2,
    Info,
    Clock,
    Camera
} from 'lucide-react';
import { Gender } from '@/types';

const GENDER_OPTIONS = [
  { id: 'male', label: 'MALE' },
  { id: 'female', label: 'FEMALE' },
  { id: 'non-binary', label: 'NON-BINARY' },
  { id: 'prefer_not_to_say', label: 'PRIVATE' },
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

            if (!user.isGenderLocked) {
                updates.gender = formData.gender;
            }

            await updateDoc(userRef, updates);
            setUser({ ...user, ...updates });
            router.push('/provider/profile');
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50/50 flex flex-col overflow-hidden">
            {/* Elite Action Header — fixed, not sticky */}
            <div className="flex-shrink-0 glass bg-white/80 backdrop-blur-xl border-b border-white shadow-sm z-10">
                <div className="max-w-2xl mx-auto px-4 h-20 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <h1 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900">
                        Expert Profile
                    </h1>

                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="h-10 px-5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>SAVE CHANGES</>
                        )}
                    </button>
                </div>
            </div>

            {/* Scrollable content area — isolated scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 pt-8 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Hero Section */}
                <div className="relative mb-12">
                    <div className="h-40 w-full bg-gradient-to-br from-indigo-50 to-rose-50 rounded-[2.5rem] border border-white shadow-inner" />
                    <div className="absolute -bottom-8 left-8 flex items-end gap-5">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="P" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        <User size={48} strokeWidth={1} />
                                    </div>
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl hover:scale-110 transition-transform">
                                <Camera size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Identity Cards */}
                <div className="grid gap-6">
                    {/* Display Name */}
                    <div className="glass bg-white p-7 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-4 ml-1">Professional Display Name</label>
                        <input 
                            value={formData.displayName}
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                            placeholder="Enter your professional name"
                            className="w-full h-14 px-1 rounded-none bg-transparent border-b-2 border-slate-50 focus:border-indigo-500 font-bold text-lg outline-none transition-all placeholder:text-slate-200"
                        />
                    </div>

                    {/* Headline */}
                    <div className="glass bg-white p-7 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-4 ml-1">Profile Headline</label>
                        <input 
                            value={formData.headline}
                            onChange={(e) => setFormData({...formData, headline: e.target.value})}
                            placeholder="Your professional bio tag"
                            className="w-full h-14 px-1 rounded-none bg-transparent border-b-2 border-slate-50 focus:border-indigo-500 font-bold text-sm outline-none transition-all placeholder:text-slate-200"
                        />
                    </div>

                    {/* Long Bio */}
                    <div className="glass bg-white p-7 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-all">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-4 ml-1">Detailed Introduction</label>
                        <textarea 
                            value={formData.bio}
                            rows={6}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Describe your expertise..."
                            className="w-full p-1 rounded-none bg-transparent border-none font-medium text-sm outline-none resize-none leading-relaxed placeholder:text-slate-200"
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="glass bg-white p-7 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Identity Recognition</label>
                            {user?.isGenderLocked && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">
                                    <Lock size={10} /> VERIFIED
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {GENDER_OPTIONS.map((g) => (
                                <button
                                    key={g.id}
                                    disabled={user?.isGenderLocked}
                                    onClick={() => setFormData({...formData, gender: g.id as any})}
                                    className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        formData.gender === g.id 
                                        ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' 
                                        : 'bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900'
                                    } ${user?.isGenderLocked ? 'opacity-50 contrast-75 cursor-not-allowed' : ''}`}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Age */}
                    <div className="glass bg-white p-7 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-4 ml-1">Expert Age</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                                className="w-20 h-14 text-center rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest underline decoration-indigo-500/30 underline-offset-4">Years Old</p>
                        </div>
                    </div>
                </div>

                {/* Verification Meta */}
                <div className="p-8 rounded-[3rem] bg-indigo-50 border border-indigo-100/50 flex items-center justify-between group overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Platform Security</p>
                        <p className="text-xs font-bold text-indigo-400">{user?.phoneNumber || 'Identity Secured'}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm relative z-10">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-100 rounded-full blur-3xl group-hover:bg-indigo-200 transition-colors" />
                </div>
              </div>
            </div>
        </div>
    );
}

