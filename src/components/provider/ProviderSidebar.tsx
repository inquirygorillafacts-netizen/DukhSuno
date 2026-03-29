'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    History,
    Wallet,
    User,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Sparkles,
    Download,
    IndianRupee
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import PWAInstall from "@/components/shared/PWAInstall";

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function ProviderSidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);

    const links = [
        { name: "My Dashboard", href: "/provider/dashboard", icon: LayoutDashboard, highlight: false },
        { name: "Call History", href: "/provider/calls", icon: History, highlight: false },
        { name: "My Earnings", href: "/provider/earnings", icon: Wallet, highlight: false },
        { name: "My Wallet", href: "/provider/wallet", icon: IndianRupee, highlight: false },
        { name: "My Profile", href: "/provider/profile", icon: User, highlight: false },
        { name: "Settings", href: "/provider/settings", icon: Settings, highlight: false },
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
                className="absolute -right-4 top-6 w-9 h-9 bg-slate-900 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg z-[500] transition-all hover:scale-110 active:scale-95 group/toggle"
            >
                {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            {/* Brand */}
            <div className={`shrink-0 p-6 ${isExpanded ? 'px-6' : 'px-0 flex justify-center'}`}>
                <Link href="/provider/dashboard" className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <img src="/logo.png" alt="BigSuno" className="w-full h-full object-cover" />
                    </div>
                    {isExpanded && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 tracking-tighter leading-tight uppercase">BigSuno</span>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-[-2px]">Provider Hub</span>
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
                                    isActive ? "bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-50" : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900",
                                    link.highlight && !isActive && "text-indigo-500"
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
                        "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    )}
                >
                    <LogOut size={16} />
                    {isExpanded && <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5">Logout</span>}
                </button>

                <PWAInstall 
                    renderTrigger={(onClick, isVisible) => isVisible && (
                        <button
                            onClick={onClick}
                            className={cn(
                                "flex items-center gap-3 h-12 rounded-[1.25rem] transition-all duration-300 group w-full overflow-hidden relative active:scale-95 shadow-lg",
                                isExpanded ? "px-4" : "justify-center",
                                "bg-emerald-600 text-white shadow-emerald-100 hover:shadow-emerald-200 overflow-hidden"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <Download size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
                            {isExpanded && (
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Install App</span>
                                    <span className="text-[7px] opacity-70 font-bold uppercase tracking-tighter mt-1 whitespace-nowrap">Premium Provider Experience</span>
                                </div>
                            )}
                        </button>
                    )}
                />
            </div>
        </aside>
    );
}
