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
                    path === '/select-role' || 
                    path === '/choose-role' || 
                    path === '/blocked' ||
                    path.includes('onboarding');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync isLive with user.isAvailable if they are a sunne_wala
  useEffect(() => {
    if (activeRole === 'sunne_wala') {
      setIsLive(!!user?.isAvailable);
    }
  }, [user?.isAvailable, activeRole]);

  // Check for Welcome Tour
  useEffect(() => {
    if (mounted && user && !isFullPage && activeRole) {
      const tourKey = `hasSeenWelcomeTour_${user.uid}_${activeRole}`;
      const hasSeen = localStorage.getItem(tourKey);
      if (!hasSeen) {
        setShowTour(true);
      }
    }
  }, [mounted, user, isFullPage, activeRole, setShowTour]);

  const handleTourClose = () => {
    if (user && activeRole) {
      localStorage.setItem(`hasSeenWelcomeTour_${user.uid}_${activeRole}`, 'true');
    }
    setShowTour(false);
  };

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes('calls') || pathname.includes('history')) return 'history';
    if (pathname.includes('profile')) return 'profile';
    if (pathname.includes('wallet') || pathname.includes('earning')) return 'wallet';
    if (pathname.includes('search') || (activeRole === 'sunane_wala' && pathname.includes('home'))) return 'home';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Navigation items logic remains same...
  

  // Define navigation based on activeRole
  const navItems = activeRole === 'sunne_wala' ? [
    { id: 'home', label: 'Dashboard', href: '/sunne/dashboard', icon: <LayoutGrid /> },
    { id: 'history', label: 'Calls', href: '/sunne/calls', icon: <Phone /> },
    { id: 'wallet', label: 'Wallet', href: '/sunne/wallet', icon: <Wallet /> },
    { id: 'profile', label: 'Profile', href: '/sunne/profile', icon: <User /> },
  ] : [
    { id: 'home', label: 'Home', href: '/sunane/home', icon: <Search /> },
    { id: 'history', label: 'History', href: '/sunane/home', icon: <History /> }, // Or a specific history page if available
    { id: 'wallet', label: 'Wallet', href: '/sunane/wallet', icon: <Wallet /> },
    { id: 'profile', label: 'Profile', href: '/sunane/profile', icon: <User /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#fdfcff] transition-colors duration-500 overflow-x-hidden relative">
      <AuroraBackground />
      
      {!mounted ? (
        <main className="flex-1 flex items-center justify-center h-screen w-full bg-white relative z-[2000]">
          <Spinner size="md" />
        </main>
      ) : isFullPage ? (
        <>
          {/* डेस्कटॉप साइडबार (Sidebar - Desktop Only) */}
          <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-slate-100 p-8 z-50 bg-white/40 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-3 mb-12">
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
                    {activeTab === 'home' && (activeRole === 'sunne_wala' ? "Listener Hub" : "Dhundhein Dost")}
                    {activeTab === 'history' && "Calls History"}
                    {activeTab === 'profile' && "Meri Profile"}
                    {activeTab === 'wallet' && (activeRole === 'sunne_wala' ? "Earnings" : "My Wallet")}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                     <div className="h-1 w-8 bg-[#ff4d6d] rounded-full" />
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                       {activeRole === 'sunne_wala' ? "Safe Space Listener" : "Safe Space Speaker"}
                     </p>
                  </div>
                </div>
                
                {/* Status indicator / Role switch shortcut */}
                <div className="flex items-center gap-4">
                   {activeRole === 'sunne_wala' && (
                     <div className="hidden md:flex items-center gap-2 bg-white p-1.5 pr-4 rounded-full border border-slate-100 shadow-sm">
                       <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-green-500' : 'text-slate-400'}`}>
                         {isLive ? 'Abhi Online' : 'Offline'}
                       </span>
                     </div>
                   )}
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
            {navItems.slice(0, 1).map(item => (
              <NavIconButton key={item.id} href={item.href} active={activeTab === item.id} icon={item.icon} label={item.label} />
            ))}

            <PWAInstall 
              renderTrigger={(onClick: () => void, isVisible: boolean) => isVisible && (
                <button onClick={onClick} className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-rose-500 transition-all">
                  <Download size={22} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Install</span>
                </button>
              )}
            />
            
            <div className="relative -translate-y-6">
              <button 
                disabled={activeRole === 'sunane_wala'}
                onClick={() => setIsLive(!isLive)} 
                className={`w-15 h-15 rounded-full flex items-center justify-center shadow-2xl border-4 border-[#fdfcff] transition-all active:scale-95 ${isLive ? 'bg-[#ff4d6d] text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {activeRole === 'sunne_wala' ? <Radio size={28} className={isLive ? 'animate-pulse' : ''} /> : <Heart size={28} className="text-[#ff4d6d] fill-current" />}
              </button>
            </div>

            {navItems.slice(2).map(item => (
              <NavIconButton key={item.id} href={item.href} active={activeTab === item.id} icon={item.icon} label={item.label} />
            ))}
          </nav>
        </>
      ) : (
        <>{children}</>
      )}

      {/* Global Welcome Tour - Rendered outside conditional layouts for proper z-index */}
      {showTour && activeRole && (
        <WelcomeTour 
          role={activeRole as 'sunne_wala' | 'sunane_wala'} 
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
