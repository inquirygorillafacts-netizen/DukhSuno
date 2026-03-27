'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    PhoneCall,
    Wallet,
    Database,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Terminal,
    Lock
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { useAuthStore } from "@/stores/auth-store";

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [isExpanded, setIsExpanded] = useState(true);

    const isOwner = user?.owner === true;

    const navCategories = [
        {
            title: "Insights",
            links: [
                { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
                { name: "Call Logs", href: "/admin/calls", icon: PhoneCall },
            ]
        },
        {
            title: "Management",
            links: [
                { name: "User Base", href: "/admin/users", icon: Users },
                { name: "Verification", href: "/admin/verification", icon: ShieldCheck },
                { name: "Withdrawals", href: "/admin/wallet/requests", icon: Wallet },
                { name: "Revenue", href: "/admin/payments", icon: Wallet },
            ]
        },
        {
            title: "Infrastructure",
            links: [
                { name: "Twilio Settings", href: "/admin/twilio", icon: Database },
                { name: "Global Config", href: "/admin/settings", icon: Settings },
                { name: "System Audit", href: "/admin/logs", icon: Terminal },
            ]
        }
    ];

    return (
        <aside
            className={cn(
                "h-screen hidden md:flex flex-col shrink-0 relative overflow-visible z-[100] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isExpanded ? "w-64" : "w-[76px]"
            )}
            style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
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
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <img src="/logo.png" alt="BigSuno" className="w-full h-full object-cover" />
                    </div>
                    {isExpanded && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 tracking-tighter leading-tight uppercase">BigSuno</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-[-2px]">Admin Portal</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Nav Categories */}
            <div className="flex-1 overflow-y-auto px-3 no-scrollbar mt-4 space-y-6">
                {navCategories.map((category) => (
                    <div key={category.title} className="space-y-1.5">
                        {isExpanded && (
                            <h3 className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">
                                {category.title}
                            </h3>
                        )}
                        <div className="flex flex-col gap-1">
                            {category.links.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center h-11 rounded-xl transition-all duration-200 group/item",
                                            isExpanded ? "px-4" : "justify-center",
                                            isActive ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon size={18} className={cn("shrink-0", isActive ? "scale-110" : "group-hover/item:scale-110 shadow-indigo-100")} />
                                        {isExpanded && (
                                            <span className="ml-3 font-bold text-[13px] whitespace-nowrap tracking-tight">
                                                {link.name}
                                            </span>
                                        )}
                                        {isActive && !isExpanded && (
                                            <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50/50">
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
            </div>
        </aside>
    );
}
