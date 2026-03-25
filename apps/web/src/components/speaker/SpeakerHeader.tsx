'use client';

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight, User, Sparkles } from "lucide-react";
import PanelSwitcher from "@/components/shared/PanelSwitcher";

export default function SpeakerHeader() {
    const pathname = usePathname();
    
    const segments = pathname.split('/').filter(Boolean);
    const pageTitle = segments.pop()?.replace(/-/g, ' ') || 'Home';
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <header className="h-20 shrink-0 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
            <div className="flex items-center gap-6">
                <PanelSwitcher />
                <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:flex">
                    <span>Aap Apne</span>
                    <ChevronRight size={10} className="text-slate-300" />
                    <span className="text-slate-900">{capitalize(pageTitle)}</span>
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full">
                    <Sparkles size={14} className="text-rose-500" />
                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Premium User</span>
                </div>

                <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
                </button>

                <button className="flex items-center gap-2 ml-1 p-1 pl-1 pr-1 hover:bg-slate-50 rounded-full transition-colors">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200">
                        <User size={18} />
                    </div>
                </button>
            </div>
        </header>
    );
}
