'use client';

import { useState, useRef, useEffect } from "react";

import { useRouter, usePathname } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
    ChevronDown, 
    ShieldCheck, 
    Headphones, 
    MessageCircle, 
    Sparkles,
    Zap
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const PANELS = [
    { 
        name: "Admin Portal", 
        href: "/admin/dashboard", 
        icon: ShieldCheck, 
        color: "text-indigo-600", 
        bg: "bg-indigo-50",
        description: "Global system administration"
    },
    { 
        name: "Provider Dashboard", 
        href: "/provider/dashboard", 
        icon: Headphones, 
        color: "text-slate-900", 
        bg: "bg-slate-100",
        description: "Professional consultant portal"
    },
    { 
        name: "Client Space", 
        href: "/seeker/home", 
        icon: MessageCircle, 
        color: "text-indigo-600", 
        bg: "bg-indigo-50",
        description: "Access professional support"
    },
];

export default function PanelSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, hasRole } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter panels based on user roles
    const availablePanels = PANELS.filter(panel => {
        if (panel.name === "Owner Portal") return user?.owner === true;
        if (panel.name === "Admin Portal") return hasRole('admin');
        if (panel.name === "Provider Dashboard") return hasRole('provider');
        if (panel.name === "Client Space") return hasRole('seeker');
        return true;
    });

    // Identify current panel
    const currentPanel = availablePanels.find(p => {
        const segment = p.href.split('/')[1];
        return pathname.startsWith(`/${segment}`);
    }) || availablePanels[0] || PANELS[2];

    // If only one panel is available, show a static label (no dropdown)
    if (availablePanels.length <= 1) {
        const singlePanel = availablePanels[0] || PANELS[2]; // Default to Client Space
        return (
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className={`w-8 h-8 rounded-xl ${singlePanel.bg} flex items-center justify-center ${singlePanel.color} border border-white shadow-sm shrink-0`}>
                    <singlePanel.icon size={18} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Context</p>
                    <p className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">{singlePanel.name.split(' ')[0]}</p>
                </div>
            </div>
        );
    }

    // Close dropdown on navigation
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 transition-all shadow-sm group active:scale-95"
            >
                <div className={`w-8 h-8 rounded-xl ${currentPanel.bg} flex items-center justify-center ${currentPanel.color} border border-white shadow-sm shrink-0`}>
                    <currentPanel.icon size={18} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Context</p>
                    <p className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">{currentPanel.name.split(' ')[0]}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-3 w-[280px] bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-3 z-[1000] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Switch Context</p>
                    </div>
                    <div className="grid gap-2">
                        {availablePanels.map((panel) => {
                            const segment = panel.href.split('/')[1];
                            const isActive = pathname.startsWith(`/${segment}`);
                            return (
                                <button
                                    key={panel.name}
                                    onClick={async () => {
                                        const nextRole = segment === 'seeker' ? 'seeker' : (segment === 'provider' ? 'provider' : 'admin');
                                        if (user) {
                                            await updateDoc(doc(db, 'users', user.uid), { activeRole: nextRole });
                                            useAuthStore.getState().setUser({ ...user, activeRole: nextRole as any });
                                        }
                                        router.push(panel.href);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group text-left ${
                                        isActive ? 'bg-slate-50 border border-slate-100' : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${panel.bg} flex items-center justify-center ${panel.color} border border-white shadow-sm transition-transform group-hover:scale-110`}>
                                        <panel.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {panel.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-1">
                                            {panel.description}
                                        </p>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="mt-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                        <Zap size={16} className="text-primary fill-primary" />
                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-relaxed">
                            Role-based access is active. Switching may require re-auth.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

