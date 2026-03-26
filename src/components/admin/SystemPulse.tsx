'use client';

import React, { useState, useEffect } from "react";
import { Activity, Database, Globe, Shield } from "lucide-react";

export default function SystemPulse() {
    const [status, setStatus] = useState({
        db: "online",
        api: "online",
        twilio: "online"
    });

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
            <PulseItem icon={<Database size={10} />} label="DB" status={status.db} />
            <div className="w-[1px] h-3 bg-slate-200" />
            <PulseItem icon={<Globe size={10} />} label="API" status={status.api} />
            <div className="w-[1px] h-3 bg-slate-200" />
            <PulseItem icon={<Shield size={10} />} label="TW" status={status.twilio} />
        </div>
    );
}

function PulseItem({ icon, label, status }: { icon: any, label: string, status: string }) {
    const isOnline = status === "online";
    return (
        <div className="flex items-center gap-1.5 group cursor-help relative">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase tracking-widest">
                {label}: {isOnline ? 'Functional' : 'Error'}
            </div>
        </div>
    );
}
