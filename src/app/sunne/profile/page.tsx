'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  User, 
  Camera, 
  Sparkles, 
  Share2, 
  QrCode, 
  Heart, 
  LogOut,
  ChevronRight,
  X,
  Download
} from 'lucide-react';
import { SPECIALTY_LABELS } from '@/types';
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function SunneProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/p/${user?.uid}`;
    if (navigator.share) {
      await navigator.share({ title: `${user?.displayName} - BigSuno`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied! ✓');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24">
      
      {/* Profile Hero Section */}
      <div className="relative mb-16">
        {/* Banner */}
        <div className="h-32 md:h-44 w-full bg-gradient-to-br from-rose-50 to-indigo-50 rounded-3xl md:rounded-[2rem] border border-white/50 shadow-inner" />
        
        {/* Avatar */}
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#c7d2fe] flex items-center justify-center text-white">
                   <User size={64} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[#ff4d6d] text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Header */}
      <div className="px-2">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
            {user?.displayName || 'Listener'}
          </h3>
          {user?.isVerified && (
            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <Sparkles size={12} className="fill-current" /> Verified
            </div>
          )}
        </div>
        <p className="text-[#ff4d6d] font-bold italic text-sm mb-3 leading-tight">
          {user?.headline || "Aapki dost hu, sab sunti hu 💙"}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-black uppercase tracking-widest">
          <span className="flex items-center gap-1 text-amber-500">★ {user?.ratingAvg?.toFixed(1) || '0.0'}</span>
          <span>• {user?.totalSessions || 0} sessions</span>
          <span>• Female</span>
        </div>
      </div>

      {/* Bio Card */}
      <div className="glass bg-white p-5 md:p-8 rounded-3xl md:rounded-[1.5rem] border border-white shadow-sm relative group">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-3">Mera Bio</span>
        <p className="text-xs md:text-sm font-medium leading-relaxed">
           Main ek acchi listener hu. Aap apni koi bhi baat share kar sakte hain — bina judge hue. Relationship, career, ya life — sab ke baare mein baat karein.
        </p>
      </div>

      {/* Specialties */}
      <div className="space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Main Expert Hu</span>
        <div className="flex flex-wrap gap-2">
          {(user?.specialties || ['relationship', 'stress', 'anxiety']).map((s) => (
            <span key={s} className="glass bg-white px-4 py-2 rounded-xl text-[10px] font-black border border-slate-100 flex items-center gap-2 hover:scale-105 transition-transform cursor-default">
              {SPECIALTY_LABELS[s] || s}
            </span>
          ))}
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mere Plans</span>
          <div className="flex gap-4">
             <button onClick={() => router.push('/sunne/profile/edit')} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Edit Profile</button>
             <button onClick={() => alert('Plans Editing coming soon! 🚀')} className="text-[#ff4d6d] text-[10px] font-black uppercase tracking-widest hover:underline">Edit Plans</button>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {(user?.plans || [
            { heading: 'Chhoti Baat', minutes: 5, price: 49 },
            { heading: 'Lambi Baat', minutes: 15, price: 99 },
            { heading: 'Dill Khol Ke', minutes: 30, price: 199 }
          ]).map((plan: any) => (
            <div key={plan.heading} className="min-w-[120px] md:min-w-[150px] bg-white p-4 rounded-2xl border border-slate-100 text-center hover:border-[#ff4d6d]/30 transition-all group shadow-sm">
              <h4 className="font-bold text-[10px] mb-1 uppercase tracking-tighter">{plan.heading}</h4>
              <p className="text-[8px] text-slate-400 font-bold uppercase mb-3">{plan.minutes} min</p>
              <p className="text-lg font-black text-[#ff4d6d] group-hover:scale-110 transition-transform leading-none">₹{plan.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share Section */}
      <div className="glass bg-white p-6 rounded-3xl border border-white shadow-sm">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-4">Profile Share Karein</span>
        <div className="grid grid-cols-2 gap-3 mb-3">
           <button onClick={handleShare} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#ff4d6d] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-[1.02] transition-all">
              <Share2 size={16} /> Share
           </button>
           <button onClick={() => setShowQr(true)} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-50 border border-slate-100 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
              <QrCode size={16} /> QR Code
           </button>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">bigsuno.app/p/{user?.uid}</p>
        </div>
      </div>

      {/* Role Switcher */}
      <button onClick={() => router.push('/select-role')} className="w-full p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between group">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
               <User size={20} className="text-indigo-500" />
            </div>
            <div className="text-left">
               <h4 className="font-bold text-sm leading-tight uppercase tracking-tighter">Sunane Wala Bano</h4>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Apna dukh share karein</p>
            </div>
         </div>
         <ChevronRight size={16} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Logout */}
      <div className="text-center pt-8">
        <button onClick={handleLogout} className="inline-flex items-center gap-3 text-[#ff4d6d] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-transform active:scale-95">
          <LogOut size={18} strokeWidth={3} /> Logout Session
        </button>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
           <Heart size={10} className="fill-current text-[#ff4d6d]/40" /> BIGSUNO v3.0
        </div>
      </div>

      {/* QR MODAL */}
      {showQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 relative animate-in zoom-in duration-300 shadow-2xl">
              <button 
                onClick={() => setShowQr(false)}
                className="absolute top-6 right-8 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={24} strokeWidth={3} />
              </button>
              
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Apna QR Code 📲</h3>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Ise apne doston ke saath share karein</p>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 inline-block shadow-inner">
                  <QRCodeSVG 
                    value={`https://bigsuno.app/p/${user?.uid}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "emoji:👤",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">bigsuno.app/p/{user?.uid}</p>
                  <button 
                    onClick={() => {
                      const svg = document.querySelector('svg');
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx?.drawImage(img, 0, 0);
                          const pngFile = canvas.toDataURL("image/png");
                          const downloadLink = document.createElement("a");
                          downloadLink.download = "BigSuno-QR.png";
                          downloadLink.href = pngFile;
                          downloadLink.click();
                        };
                        img.src = "data:image/svg+xml;base64," + btoa(svgData);
                      }
                    }}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                  >
                    <Download size={18} /> Download QR
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
