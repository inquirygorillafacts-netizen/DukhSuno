'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Users, 
    ShieldCheck, 
    Wallet, 
    Settings 
} from "lucide-react";

export default function AdminMobileNav() {
    const pathname = usePathname();

    const links = [
        { name: "Dash", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Verify", href: "/admin/verification", icon: ShieldCheck },
        { name: "Money", href: "/admin/payments", icon: Wallet },
        { name: "Config", href: "/admin/settings", icon: Settings },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 h-16 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
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
                        <Icon size={20} className={isActive ? "fill-indigo-50" : ""} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                            {link.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
