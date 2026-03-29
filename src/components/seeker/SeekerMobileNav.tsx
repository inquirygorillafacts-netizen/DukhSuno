'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Home, 
    Wallet, 
    User, 
    History,
    Download
} from "lucide-react";
import PWAInstall from "../shared/PWAInstall";

export default function SeekerMobileNav() {
    const pathname = usePathname();

    const links = [
        { name: "Home", href: "/seeker/home", icon: Home },
        { name: "History", href: "/seeker/history", icon: History },
        { name: "Wallet", href: "/seeker/wallet", icon: Wallet },
        { name: "Profile", href: "/seeker/profile", icon: User },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-4 h-16 flex items-center justify-around z-50 pb-safe">
            {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                            isActive ? "text-indigo-600 scale-110" : "text-slate-400"
                        }`}
                    >
                        <Icon size={20} className={isActive ? "fill-indigo-100" : ""} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {link.name}
                        </span>
                    </Link>
                );
            })}

            <PWAInstall 
                renderTrigger={(onClick: () => void, isVisible: boolean) => isVisible && (
                    <button 
                        onClick={onClick}
                        className="flex flex-col items-center gap-1 text-slate-800 active:scale-95 transition-all"
                    >
                        <Download size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Install</span>
                    </button>
                )}
            />
        </nav>
    );
}
