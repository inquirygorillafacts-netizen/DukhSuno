'use client';

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Moon, Sun, ChevronRight, User } from "lucide-react";
import PanelSwitcher from "@/components/shared/PanelSwitcher";
import SystemPulse from "@/components/admin/SystemPulse";

export default function AdminHeader() {
    const pathname = usePathname();
    
    // Generate page title from pathname
    const segments = pathname.split('/').filter(Boolean);
    const pageTitle = segments.pop()?.replace(/-/g, ' ') || 'Dashboard';
    const parent = segments[segments.length - 1] || 'Admin';
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <header className="h-20 shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <PanelSwitcher />
                    <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:flex">
                        <span>{capitalize(parent)}</span>
                        <ChevronRight size={10} className="text-slate-300" />
                        <span className="text-slate-900">{capitalize(pageTitle)}</span>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <SystemPulse />
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">System Monitor</span>
                    </div>

                    <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative transition-colors">
                        <Bell size={18} />
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
                    </button>

                    <button className="flex items-center gap-2 ml-1 p-1 pl-1 pr-1 hover:bg-slate-50 rounded-full transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                            <User size={18} />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}
