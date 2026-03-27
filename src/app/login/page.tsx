'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import RoleSelectionDrawer from '@/components/shared/RoleSelectionDrawer';
import type { BigSunoUser, Role } from '@/types';
import { Heart, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as BigSunoUser;
        setUser(userData);
        setUserRoles(userData.roles || []);

        if (!userData.roles || userData.roles.length === 0) {
          router.push('/select-role');
        } else if (userData.roles.length === 1) {
          const role = userData.roles[0];
          if (role === 'sunne_wala') {
            router.push('/sunne/dashboard');
          } else if (role === 'sunane_wala') {
            router.push('/sunane/home');
          } else if (role === 'admin') {
            router.push('/admin/dashboard');
          }
        } else {
          // Show drawer for multiple roles
          setIsDrawerOpen(true);
          setLoading(false);
        }
      } else {
        const newUser: Partial<BigSunoUser> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          avatarUrl: firebaseUser.photoURL || '',
          bannerUrl: '',
          roles: [],
          creditBalance: 0,
          totalCallMinutes: 0,
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
        });
        setUser(newUser as BigSunoUser);
        router.push('/select-role');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#fdfcff]" suppressHydrationWarning>
      {/* Background Blobs (Master Design) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-200 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] animate-blob-delay" />
      </div>

      <div className="w-full max-w-[420px] glass bg-white/70 rounded-[3.5rem] p-12 shadow-2xl text-center relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md border border-slate-50">
          <Heart className="text-[#ff4d6d] fill-current w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter mb-2">
          Dukh<span className="text-[#ff4d6d] italic font-serif" style={{ fontFamily: 'var(--font-branding)' }}>Suno</span>
        </h1>
        
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px] mx-auto italic">
          "Dil ki baat sune koi apna... <br/> 
          ek surakshit aur gumnam jagah."
        </p>

        <div className="mt-10 space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-4 hover:border-[#ff4d6d]/30 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-sm disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#ff4d6d]/30 border-t-[#ff4d6d] rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                Google se Login Karein
              </>
            )}
          </button>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Ya Phir</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button className="w-full h-14 bg-slate-50 border border-transparent text-slate-400 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-not-allowed opacity-50 text-[10px] uppercase tracking-widest">
            Mobile Number (Jald Aa Raha Hai)
          </button>
        </div>

        <div className="mt-12 p-4 bg-[#ff4d6d]/5 rounded-3xl border border-[#ff4d6d]/10 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="text-[#ff4d6d] w-5 h-5" />
           </div>
           <div className="text-left">
              <p className="text-[10px] font-black text-[#ff4d6d] uppercase tracking-widest leading-none mb-1">Privacy Safe</p>
              <p className="text-[9px] text-slate-500 font-medium">Aapki gumnami hamari zimmedari hai.</p>
           </div>
        </div>
      </div>

      <RoleSelectionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        roles={userRoles} 
      />
    </div>
  );
}
