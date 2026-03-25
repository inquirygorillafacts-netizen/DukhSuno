'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Radio, 
    History, 
    Wallet, 
    User 
} from "lucide-react";

export default function ListenerMobileNav() {
    const pathname = usePathname();

    const links = [
        { name: "Home", href: "/sunne/dashboard", icon: LayoutDashboard },
        { name: "Live", href: "/sunne/live", icon: Radio },
        { name: "Calls", href: "/sunne/calls", icon: History },
        { name: "Wallet", href: "/sunne/earnings", icon: Wallet },
        { name: "Me", href: "/sunne/profile", icon: User },
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
        </nav>
    );
}
