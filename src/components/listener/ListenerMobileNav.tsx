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
    Sparkles
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function ListenerMobileNav() {
    const pathname = usePathname();
    const { setShowTour } = useAuthStore();

    const links = [
        { name: "Home", href: "/provider/dashboard", icon: LayoutDashboard },
        { name: "Calls", href: "/provider/calls", icon: History },
        { name: "Wallet", href: "/provider/earnings", icon: Wallet },
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

            {/* Intro Button (Static) */}
            <button
                onClick={() => setShowTour(true)}
                className="flex flex-col items-center gap-1 text-emerald-400 animate-pulse active:scale-95 transition-all"
            >
                <Sparkles size={20} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Intro</span>
            </button>
        </nav>
    );
}

