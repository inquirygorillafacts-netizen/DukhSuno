'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Users, 
    ShieldCheck, 
    Wallet, 
    Settings,
    PhoneCall,
    Database,
    Terminal,
    Command
} from "lucide-react";

export default function AdminMobileNav() {
    const pathname = usePathname();

    const links = [
        { name: "Live", href: "/admin/headroom", icon: Command },
        { name: "Dash", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Calls", href: "/admin/calls", icon: PhoneCall },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Verify", href: "/admin/verification", icon: ShieldCheck },
        { name: "Money", href: "/admin/payments", icon: Wallet },
        { name: "Twilio", href: "/admin/twilio", icon: Database },
        { name: "Config", href: "/admin/settings", icon: Settings },
        { name: "Audit", href: "/admin/logs", icon: Terminal },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center overflow-x-auto no-scrollbar py-3 px-4 gap-6 scroll-smooth">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 shrink-0 transition-all duration-300 ${
                                isActive ? "text-indigo-600 scale-110" : "text-slate-400"
                            }`}
                        >
                            <Icon size={20} className={isActive ? "fill-indigo-50" : ""} />
                            <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </nav>
    );
}
