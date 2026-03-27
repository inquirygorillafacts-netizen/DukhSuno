'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Phone, User, Wallet, Heart, 
  Moon, Sun, Radio, ChevronRight, Search, 
  History, Sparkles, Download
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import PWAInstall from './shared/PWAInstall';
import WelcomeTour from './shared/WelcomeTour';
import { Spinner } from './ui/spinner';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, activeRole, showTour, setShowTour } = useAuthStore();
  const [isLive, setIsLive] = useState(false);
  const [mounted, setMounted] = useState(false);

  const path = pathname || '';
  const isFullPage = path === '/' ||
                    path === '/login' || 
                    path === '/blocked' ||
                    path.includes('onboarding');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (path.includes('/history')) return 'history';
    if (path.includes('/me')) return 'me';
    if (path.includes('/wallet')) return 'wallet';
    if (path.includes('/home')) return 'home';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Unified Navigation Items (YouTube Style)
  const navItems = [
    { id: 'home', label: 'Home', href: '/home', icon: <Search /> },
    { id: 'history', label: 'Call', href: '/history', icon: <History /> },
    { id: 'wallet', label: 'Wallet', href: '/wallet', icon: <Wallet /> },
    { id: 'me', label: 'Me', href: '/me', icon: <User /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#fdfcff] transition-colors duration-500 overflow-x-hidden relative">
      <AuroraBackground />
      
      {!mounted ? (
        <main className="flex-1 flex items-center justify-center h-screen w-full bg-white relative z-[2000]">
          <Spinner size="md" />
        </main>
      ) : isFullPage ? (
        <>{children}</>
      ) : (
        <>
          {/* डेस्कटॉप साइडबार (Sidebar - Desktop Only) */}
          <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-slate-100 p-8 z-50 bg-white/40 backdrop-blur-md">
            <Link href="/home" className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-100">
                <Heart className="text-white fill-current w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">Big<span className="text-primary italic font-serif">Suno</span></h1>
            </Link>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <SidebarLink 
                   key={item.id}
                   href={item.href} 
                   active={activeTab === item.id} 
                   icon={item.icon} 
                   label={item.label} 
                />
              ))}
            </nav>

            <div className="mt-auto space-y-4">
              <PWAInstall 
                renderTrigger={(onClick: () => void, isVisible: boolean) => isVisible && (
                  <button 
                    onClick={onClick}
                    className="w-full p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between group hover:scale-[1.02] transition-all shadow-xl shadow-slate-200"
                  >
                    <div className="flex items-center gap-3">
                       <Download size={18} className="text-rose-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Install App</span>
                    </div>
                    <Sparkles size={14} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              />

              <div className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Light Mode v3.0</span>
                <Sun className="w-4 h-4 text-[#ff4d6d]" />
              </div>
            </div>
          </aside>

          {/* मुख्य कंटेंट (Main Content) */}
          <main className="flex-1 flex flex-col min-h-screen overflow-y-auto" suppressHydrationWarning>
            <div className="flex-1 w-full max-w-[1240px] mx-auto p-3 md:p-6 lg:p-8 pb-32">
              <header className="flex justify-between items-center mb-6 px-2 lg:px-0">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    {activeTab === 'home' && "Home"}
                    {activeTab === 'history' && "Call History"}
                    {activeTab === 'wallet' && "My Wallet"}
                    {activeTab === 'me' && "Me"}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                     <div className="h-1 w-8 bg-[#ff4d6d] rounded-full" />
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                       BigSuno Unified Space
                     </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <div 
                      className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-slate-100 text-slate-900 font-black shadow-sm overflow-hidden"
                      style={{ backgroundColor: user?.avatarUrl?.split(':')[2] || '#ffffff' }}
                   >
                      {user?.avatarUrl?.includes(':') ? user.avatarUrl.split(':')[1] : '😊'}
                   </div>
                </div>
              </header>

              <div className="relative">
                {children}
              </div>
            </div>
          </main>

          {/* मोबाइल नेविगेशन (Mobile Bottom Nav) */}
          <nav className="lg:hidden fixed bottom-0 left-0 w-full glass bg-white/95 border-t border-slate-100 px-6 pt-2 pb-5 flex justify-between items-center z-[100] backdrop-blur-xl">
            {navItems.map(item => (
              <NavIconButton key={item.id} href={item.href} active={activeTab === item.id} icon={item.icon} label={item.label} />
            ))}
          </nav>
        </>
      )}

      {/* Global Welcome Tour */}
      {showTour && (
        <WelcomeTour 
          role="sunane_wala" // Defaulting to Seeker for tour
          onClose={handleTourClose} 
        />
      )}
    </div>
  );
}

const AuroraBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-[0.15]" suppressHydrationWarning>
    <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-400 rounded-full blur-[120px] animate-blob" />
    <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#ff4d6d] rounded-full blur-[120px] animate-blob-delay" />
    <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-400 rounded-full blur-[120px] animate-blob opacity-50" />
  </div>
);

const SidebarLink = ({ active, icon, label, href }: { active: boolean, icon: React.ReactNode, label: string, href: string }) => (
  <Link href={href} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] font-black transition-all group ${active ? 'bg-rose-50 text-[#ff4d6d] shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
    <div className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
       {React.cloneElement(icon as any, { size: 20, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className="text-xs uppercase tracking-widest">{label}</span>
  </Link>
);

const NavIconButton = ({ active, icon, label, href }: { active: boolean, icon: React.ReactNode, label: string, href: string }) => (
  <Link href={href} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-[#ff4d6d]' : 'text-slate-300'}`}>
    {React.cloneElement(icon as any, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
  </Link>
);
