'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Radio, 
    History, 
    Wallet, 
    User,
    Sparkles,
    Download
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import PWAInstall from "@/components/shared/PWAInstall";

export default function ProviderMobileNav() {
    const pathname = usePathname();
    const { setShowTour } = useAuthStore();

    const links = [
        { name: "Home", href: "/provider/dashboard", icon: LayoutDashboard },
        { name: "Calls", href: "/provider/calls", icon: History },
        { name: "Earnings", href: "/provider/earnings", icon: Wallet },
        { name: "Me", href: "/provider/profile", icon: User },
    ];

    return (
        <nav className="md:hidden fixed bottom-1 left-4 right-4 bg-white border border-slate-100/80 px-4 h-16 rounded-[2rem] flex items-center justify-around z-50 shadow-2xl shadow-slate-200/50 pb-safe">
            {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                            isActive ? "text-emerald-600 scale-110" : "text-slate-400"
                        }`}
                    >
                        <Icon size={20} className={isActive ? "fill-emerald-100" : ""} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {link.name}
                        </span>
                    </Link>
                );
            })}

            <PWAInstall 
                renderTrigger={(onClick, isVisible) => isVisible && (
                    <button
                        onClick={onClick}
                        className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group relative"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100 group-active:scale-95 transition-all overflow-hidden relative">
                             <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer" />
                             <Download size={20} className="relative z-10" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 leading-none">Install</span>
                    </button>
                )}
            />
        </nav>
    );
}

