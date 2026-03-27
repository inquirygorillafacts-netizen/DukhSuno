'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  User, Camera, Sparkles, Share2, QrCode, Heart, LogOut, 
  ChevronRight, X, Download, ShieldCheck, Power, Settings, 
  Trash2, HelpCircle, ArrowRight, Star
} from 'lucide-react';
import { SPECIALTY_LABELS, PROVIDER_TYPE_LABELS } from '@/types';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function MePage() {
  const { user, logout, setUser } = useAuthStore();
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Smart Earning Introduction State
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  const handleToggleOnline = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const newStatus = !user.isAvailable;
      await updateDoc(doc(db, 'users', user.uid), {
        isAvailable: newStatus,
        lastActive: new Date()
      });
      setUser({ ...user, isAvailable: newStatus });
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
       await deleteDoc(doc(db, 'users', user.uid));
       await auth.currentUser?.delete();
       logout();
       router.push('/login');
    } catch (err) {
       console.error('Delete failed:', err);
       alert('Koshish nakaam rahi. Kripya login karke dubara koshish karein.');
    }
  };

  const isProvider = user?.roles?.includes('sunne_wala') || user?.providerType;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-32">
      
      {/* Header / Basic Info */}
      <section className="flex items-center gap-5 px-2">
         <div className="relative">
            <div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center text-4xl"
              style={{ backgroundColor: user?.avatarUrl?.split(':')[2] || '#f1f5f9' }}
            >
               {user?.avatarUrl?.includes(':') ? user.avatarUrl.split(':')[1] : '👤'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
               <Camera size={14} />
            </button>
         </div>
         <div className="flex-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">
               {user?.displayName || 'BigSuno User'}
            </h3>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Seeker ID: #{user?.uid?.slice(-6).toUpperCase()}</span>
               {user?.isVerified && (
                  <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100">
                     <ShieldCheck size={10} fill="currentColor" className="text-white" /> Verified
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* Online/Offline Toggle (For Providers Only) */}
      {isProvider && (
        <section className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${user?.isAvailable ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${user?.isAvailable ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Power size={20} strokeWidth={3} />
                 </div>
                 <div>
                    <h4 className="font-black text-sm uppercase tracking-tight leading-none mb-1">
                       Status: {user?.isAvailable ? 'Online' : 'Offline'}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                       {user?.isAvailable ? 'Aap Home page par live hain' : 'Abhi koi aapko nahi dekh sakta'}
                    </p>
                 </div>
              </div>
              <button 
                onClick={handleToggleOnline}
                disabled={isUpdating}
                className={`relative w-14 h-8 rounded-full transition-colors duration-500 flex items-center px-1 ${user?.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-500 transform ${user?.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
           </div>
        </section>
      )}

      {/* Smart Earning Flow / Provider Dashboard */}
      {!isProvider ? (
        <section className="p-8 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
           <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#ff4d6d] rounded-full blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity" />
           <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                 <Sparkles className="text-[#ff4d6d]" size={28} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black italic tracking-tighter leading-none">Smart Earning Shuru Karein?</h3>
                 <p className="text-xs text-white/60 font-medium leading-relaxed max-w-[280px]">
                    YouTube ki tarah apna channel banaiye aur logon ki madad karke paise kamaiye.
                 </p>
              </div>
              <button 
                onClick={() => setOnboardingStep(0)}
                className="w-full h-14 bg-[#ff4d6d] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-rose-900/40 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
              >
                 Start Earning Flow <ArrowRight size={18} />
              </button>
           </div>
        </section>
      ) : (
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mera Provider Profile</h4>
              <button onClick={() => router.push('/me/edit')} className="text-[#ff4d6d] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                 <Settings size={12} /> Edit
              </button>
           </div>

           {/* Provider Layout Mock (Brief) */}
           <div className="glass bg-white p-6 rounded-[2.5rem] border border-white shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl">
                    {user?.avatarUrl?.includes(':') ? user.avatarUrl.split(':')[1] : '👤'}
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h5 className="font-black text-slate-900 uppercase tracking-tight">{user?.displayName}</h5>
                       <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
                          {PROVIDER_TYPE_LABELS[user?.providerType || 'listener']}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold italic mt-1 leading-tight">{user?.headline || "Abhi koi headline nahi hai."}</p>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 {[
                   { label: 'Earning', value: `₹${user?.totalEarnings || 0}`, icon: <TrendingUp size={10} className="text-green-500" /> },
                   { label: 'Rating', value: user?.ratingAvg?.toFixed(1) || '0.0', icon: <Star size={10} className="text-amber-500" /> },
                   { label: 'Sessions', value: user?.totalSessions || 0, icon: <Heart size={10} className="text-rose-500" /> },
                 ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-2xl text-center">
                       <div className="flex items-center justify-center gap-1 mb-1">
                          {stat.icon}
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                       </div>
                       <p className="text-sm font-black text-slate-900">{stat.value}</p>
                    </div>
                 ))}
              </div>

              <button 
                onClick={() => router.push('/me/plans')}
                className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                 Manage 3 Plans <ChevronRight size={14} />
              </button>
           </div>
        </div>
      )}

      {/* Account Settings */}
      <section className="space-y-3">
         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Account & Support</h4>
         
         <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            {[
              { label: 'Helpline & Support', icon: <HelpCircle className="text-blue-500" />, action: () => router.push('/help') },
              { label: 'Privacy Policy', icon: <ShieldCheck className="text-emerald-500" />, action: () => router.push('/privacy') },
              { label: 'Sign Out Session', icon: <LogOut className="text-rose-500" />, action: handleLogout },
            ].map((item, i) => (
               <button 
                 key={i}
                 onClick={item.action}
                 className={`w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all ${i !== 2 ? 'border-b border-slate-50' : ''}`}
               >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        {React.cloneElement(item.icon as any, { size: 18 })}
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-200" />
               </button>
            ))}
         </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-4">
         <button 
           onClick={() => setShowDeleteConfirm(true)}
           className="w-full p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-100 transition-all"
         >
            <Trash2 size={16} /> Apna Account Delete Karein
         </button>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-10 text-center animate-in zoom-in duration-300 shadow-2xl relative">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <Trash2 size={40} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Pukka Delete Karna Hai? 😟</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 px-4">
                 Yeh karne se aapka pura account, earnings aur profile hamesha ke liye hat jayegi. Ise wapis nahi laya ja sakta.
              </p>
              <div className="space-y-3">
                 <button 
                   onClick={handleDeleteAccount}
                   className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-all"
                 >
                    Haan, Khatam Karo
                 </button>
                 <button 
                   onClick={() => setShowDeleteConfirm(false)}
                   className="w-full h-14 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest"
                 >
                    Nahi, Rehne Do
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* SMART EARNING ONBOARDING OVERLAY */}
      {onboardingStep !== null && (
        <div className="fixed inset-0 z-[2000] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto">
           {/* Close Button */}
           <button 
             onClick={() => setOnboardingStep(null)}
             className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center z-10 shadow-xl"
           >
              <X size={24} />
           </button>

           <div className="p-10 flex flex-col items-center justify-center min-h-screen text-center space-y-12 max-w-md mx-auto">
              {/* Introduction Slides Logic (Simplified for now) */}
              <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-5xl animate-bounce">
                 {['🎓', '💰', '🛡️', '🤝', '🚀'][onboardingStep % 5]}
              </div>
              <div className="space-y-4">
                 <h3 className="text-4xl font-black italic tracking-tighter leading-none text-slate-900">
                    Step {onboardingStep + 1}: Smart Earning
                 </h3>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                    {onboardingStep === 0 && "BigSuno par apna channel banaiye aur logon se baatein karke paise kamaiye."}
                    {onboardingStep === 1 && "Har minute ke paise aap khud set kar sakte hain (e.g. ₹5/min)."}
                    {onboardingStep === 2 && "Aapki gumnami aur privacy hamari pehli zimmedari hai."}
                    {onboardingStep === 3 && "Verified badge milne par aapki visibility 10x badh jayegi."}
                    {onboardingStep === 4 && "Chaliye profile setup karte hain aur live jaate hain!"}
                 </p>
              </div>

              <div className="flex items-center gap-2">
                 {[0,1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 transition-all rounded-full ${i === onboardingStep ? 'w-8 bg-[#ff4d6d]' : 'w-2 bg-slate-100'}`} />
                 ))}
              </div>

              <button 
                onClick={() => {
                  if (onboardingStep < 4) setOnboardingStep(onboardingStep + 1);
                  else {
                     // Trigger registration form (Redirecting for now)
                     router.push('/onboarding/provider');
                     setOnboardingStep(null);
                  }
                }}
                className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 group"
              >
                 {onboardingStep < 4 ? 'Agla Step' : 'Chaliye Shuru Karein'} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

const TrendingUp = ({ size, className }: { size: number, className?: string }) => (
  <svg height={size} width={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
