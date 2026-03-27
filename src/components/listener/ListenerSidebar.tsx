'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PhoneCall,
    History,
    Wallet,
    User,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Radio,
    Zap,
    HeartPulse,
    Headphones,
    Sparkles
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function ListenerSidebar() {
    const pathname = usePathname();
    const { setShowTour } = useAuthStore();
    const [isExpanded, setIsExpanded] = useState(true);

    const links = [
        { name: "My Dashboard", href: "/sunne/dashboard", icon: LayoutDashboard, highlight: false },
        { name: "Call History", href: "/sunne/calls", icon: History, highlight: false },
        { name: "My Earnings", href: "/sunne/earnings", icon: Wallet, highlight: false },
        { name: "My Profile", href: "/sunne/profile", icon: User, highlight: false },
        { name: "Settings", href: "/sunne/settings", icon: Settings, highlight: false },
    ];

    return (
        <aside
            className={cn(
                "h-screen hidden md:flex flex-col shrink-0 relative overflow-visible z-[100] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isExpanded ? "w-64" : "w-[76px]"
            )}
            style={{
                background: '#ffffff',
                borderRight: '1px solid rgba(226, 232, 240, 0.8)',
            }}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-4 top-6 w-9 h-9 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg z-[500] transition-all hover:scale-110 active:scale-95 group/toggle"
            >
                {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            {/* Brand */}
            <div className={`shrink-0 p-6 ${isExpanded ? 'px-6' : 'px-0 flex justify-center'}`}>
                <Link href="/sunne/dashboard" className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <img src="/logo.png" alt="BigSuno" className="w-full h-full object-cover" />
                    </div>
                    {isExpanded && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 tracking-tighter leading-tight uppercase">BigSuno</span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-[-2px]">Listener</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-3 no-scrollbar mt-4">
                <nav className="flex flex-col gap-1.5">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center h-11 rounded-xl transition-all duration-200 group/item",
                                    isExpanded ? "px-4" : "justify-center",
                                    isActive ? "bg-white text-emerald-600 shadow-sm border border-emerald-50" : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900",
                                    link.highlight && !isActive && "text-emerald-500"
                                )}
                            >
                                <Icon size={18} className={cn("shrink-0", isActive ? "scale-110" : "group-hover/item:scale-110")} />
                                {isExpanded && (
                                    <span className="ml-3 font-bold text-[13px] whitespace-nowrap tracking-tight">
                                        {link.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="shrink-0 p-4 border-t border-slate-100 space-y-2 bg-slate-50/30">
                <button
                    onClick={async () => { await signOut(auth); window.location.href = "/login"; }}
                    className={cn(
                        "flex items-center gap-3 h-10 rounded-xl transition-all duration-200 group w-full",
                        isExpanded ? "px-4" : "justify-center",
                        "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    )}
                >
                    <LogOut size={16} />
                    {isExpanded && <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5">Logout</span>}
                </button>

                <button
                    onClick={() => setShowTour(true)}
                    className={cn(
                        "flex items-center gap-3 h-10 rounded-xl transition-all duration-200 group w-full",
                        isExpanded ? "px-4" : "justify-center",
                        "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 border border-emerald-50 bg-white"
                    )}
                >
                    <Sparkles size={16} className="animate-pulse" />
                    {isExpanded && <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5">How it Works?</span>}
                </button>
            </div>
        </aside>
    );
}
