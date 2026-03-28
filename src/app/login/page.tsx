'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import RoleSelectionDrawer from '@/components/shared/RoleSelectionDrawer';
import type { BigSunoUser, Role } from '@/types';
import { Heart, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, user: currentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const nextRole = currentUser.activeRole || (currentUser.roles?.includes('seeker') ? 'seeker' : (currentUser.roles?.[0] || 'seeker'));
      if (nextRole === 'provider') router.push('/provider/dashboard');
      else if (nextRole === 'admin') router.push('/admin/dashboard');
      else router.push('/seeker/home');
    }
  }, [currentUser, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as BigSunoUser;
        setUser(userData);
        
        // Redirect to activeRole or default to seeker
        const nextRole = userData.activeRole || (userData.roles?.includes('seeker') ? 'seeker' : (userData.roles?.[0] || 'seeker'));
        
        if (nextRole === 'provider') router.push('/provider/dashboard');
        else if (nextRole === 'admin') router.push('/admin/dashboard');
        else router.push('/seeker/home');
        
      } else {
        const newUser: BigSunoUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Seeker',
          avatarUrl: 'emoji:😊:#f3f4f6', // Default system avatar
          bannerUrl: '',
          roles: ['seeker'],
          activeRole: 'seeker',
          creditBalance: 0,
          totalCallMinutes: 0,
          createdAt: new Date(),
          lastActive: new Date(),
          registeredAt: new Date(),
        } as any;
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
          registeredAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
        setUser(newUser);
        router.push('/seeker/home');
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
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-200 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-slate-100 rounded-full blur-[120px] animate-blob-delay" />
      </div>

      <div className="w-full max-w-[420px] glass bg-white/70 rounded-[3.5rem] p-12 shadow-2xl text-center relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md border border-slate-50">
          <Zap className="text-white fill-current w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter mb-2">
          Big<span className="text-indigo-600 italic font-serif" style={{ fontFamily: 'var(--font-branding)' }}>Suno</span>
        </h1>
        
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px] mx-auto italic">
          "Expert Guidance & Professional Support... <br/> 
          A secure and confidential space."
        </p>

        <div className="mt-10 space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-slate-900 border border-transparent text-white rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-slate-800 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-sm disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                Continue with Google
              </>
            )}
          </button>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button className="w-full h-14 bg-slate-50 border border-transparent text-slate-400 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-not-allowed opacity-50 text-[10px] uppercase tracking-widest">
            Mobile Access (Coming Soon)
          </button>
        </div>

        <div className="mt-12 p-4 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="text-indigo-600 w-5 h-5" />
           </div>
           <div className="text-left">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Secure & Private</p>
              <p className="text-[9px] text-slate-500 font-medium">Your confidentiality is our priority.</p>
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

