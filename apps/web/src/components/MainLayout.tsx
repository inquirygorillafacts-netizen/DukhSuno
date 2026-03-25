'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Phone, User, Wallet, Heart, 
  Moon, Sun, Radio, ChevronRight, Search, 
  History, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, activeRole } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Theme Management
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Sync isLive with user.isAvailable if they are a sunne_wala
  useEffect(() => {
    if (activeRole === 'sunne_wala') {
      setIsLive(!!user?.isAvailable);
    }
  }, [user?.isAvailable, activeRole]);

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes('calls') || pathname.includes('history')) return 'history';
    if (pathname.includes('profile')) return 'profile';
    if (pathname.includes('wallet') || pathname.includes('earning')) return 'wallet';
    if (pathname.includes('search') || (activeRole === 'sunane_wala' && pathname.includes('home'))) return 'home';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Hide layout for login, role selection, and new premium panels
  const path = pathname || '';
  const isAuthPage = path === '/login' || 
                    path === '/select-role' || 
                    path === '/choose-role' || 
                    path.includes('onboarding') ||
                    path.includes('admin') ||
                    path.includes('sunne') ||
                    path.includes('sunane');

  if (isAuthPage) {
    return <main className="min-h-screen relative z-[1000] bg-white">{children}</main>;
  }

  // Define navigation based on activeRole
  const navItems = activeRole === 'sunne_wala' ? [
    { id: 'home', label: 'Dashboard', href: '/sunne/dashboard', icon: <LayoutGrid /> },
    { id: 'history', label: 'Calls', href: '/sunne/calls', icon: <Phone /> },
    { id: 'wallet', label: 'Earnings', href: '/sunne/earnings', icon: <Wallet /> },
    { id: 'profile', label: 'Profile', href: '/sunne/profile', icon: <User /> },
  ] : [
    { id: 'home', label: 'Home', href: '/sunane/home', icon: <Search /> },
    { id: 'history', label: 'History', href: '/sunane/home', icon: <History /> }, // Or a specific history page if available
    { id: 'wallet', label: 'Wallet', href: '/sunane/wallet', icon: <Wallet /> },
    { id: 'profile', label: 'Profile', href: '/sunane/profile', icon: <User /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#fdfcff] dark:bg-[#0a0a0c] transition-colors duration-500 overflow-x-hidden relative">
      <AuroraBackground />

      {/* डेस्कटॉप साइडबार (Sidebar - Desktop Only) */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-slate-100 dark:border-white/5 p-8 z-50 bg-white/40 dark:bg-transparent backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#ff4d6d] rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Heart className="text-white fill-current w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter dark:text-white">Dukh<span className="text-[#ff4d6d] italic font-serif">Suno</span></h1>
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
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:shadow-lg transition-all">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Appearance</span>
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </aside>

      {/* मुख्य कंटेंट (Main Content) */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-10 lg:p-14 pb-32">
          <header className="flex justify-between items-center mb-10 px-2 lg:px-0">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
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
                 <div className="hidden md:flex items-center gap-2 bg-white dark:bg-white/5 p-1.5 pr-4 rounded-full border border-slate-100 dark:border-white/10 shadow-sm">
                   <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                   <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-green-500' : 'text-slate-400'}`}>
                     {isLive ? 'Abhi Online' : 'Offline'}
                   </span>
                 </div>
               )}
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white font-black shadow-sm">
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
      <nav className="lg:hidden fixed bottom-0 left-0 w-full glass bg-white/95 dark:bg-[#0a0a0c]/95 border-t border-slate-100 dark:border-white/10 px-6 pt-3 pb-8 flex justify-between items-center z-[100] backdrop-blur-xl">
        {navItems.slice(0, 2).map(item => (
          <NavIconButton key={item.id} href={item.href} active={activeTab === item.id} icon={item.icon} label={item.label} />
        ))}
        
        <div className="relative -translate-y-6">
          <button 
            disabled={activeRole === 'sunane_wala'}
            onClick={() => setIsLive(!isLive)} 
            className={`w-15 h-15 rounded-full flex items-center justify-center shadow-2xl border-4 border-[#fdfcff] dark:border-[#0a0a0c] transition-all active:scale-95 ${isLive ? 'bg-[#ff4d6d] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
          >
            {activeRole === 'sunne_wala' ? <Radio size={28} className={isLive ? 'animate-pulse' : ''} /> : <Heart size={28} className="text-[#ff4d6d] fill-current" />}
          </button>
        </div>

        {navItems.slice(2).map(item => (
          <NavIconButton key={item.id} href={item.href} active={activeTab === item.id} icon={item.icon} label={item.label} />
        ))}
      </nav>
    </div>
  );
}

const AuroraBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-[0.15] dark:opacity-[0.1]">
    <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-400 rounded-full blur-[120px] animate-blob" />
    <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#ff4d6d] rounded-full blur-[120px] animate-blob-delay" />
    <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-indigo-400 rounded-full blur-[120px] animate-blob opacity-50" />
  </div>
);

const SidebarLink = ({ active, icon, label, href }: { active: boolean, icon: React.ReactNode, label: string, href: string }) => (
  <Link href={href} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] font-black transition-all group ${active ? 'bg-rose-50 text-[#ff4d6d] dark:bg-rose-500/10 shadow-sm' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
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
