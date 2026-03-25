'use client';

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight, User, Circle } from "lucide-react";
import PanelSwitcher from "@/components/shared/PanelSwitcher";

export default function ListenerHeader() {
    const pathname = usePathname();
    
    const segments = pathname.split('/').filter(Boolean);
    const pageTitle = segments.pop()?.replace(/-/g, ' ') || 'Home';
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <header className="h-20 shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <PanelSwitcher />
                    <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:flex">
                        <span>Partner</span>
                        <ChevronRight size={10} className="text-slate-300" />
                        <span className="text-slate-900">{capitalize(pageTitle)}</span>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Status</span>
                    </div>

                    <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative transition-colors">
                        <Bell size={18} />
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white"></span>
                    </button>

                    <button className="flex items-center gap-2 ml-1 p-1 pl-1 pr-1 hover:bg-slate-50 rounded-full transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                            <User size={18} />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}
