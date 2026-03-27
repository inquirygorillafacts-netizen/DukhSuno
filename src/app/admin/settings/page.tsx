'use client';

import {
    Settings,
    Bell,
    Shield,
    Zap,
    Server,
    Globe,
    Database,
    ChevronRight,
    ToggleLeft,
    Monitor,
    ArrowLeft,
    Percent,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function OwnerSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [platformConfig, setPlatformConfig] = useState<any>({
        defaultCommissionRate: 0.02,
        minWithdrawalAmount: 99
    });

    useEffect(() => {
        fetch('/api/admin/config').then(res => res.json()).then(data => {
            if (!data.error) setPlatformConfig(data);
        });
    }, []);

    const saveConfig = async () => {
        setSaving(true);
        try {
            // Save Platform Config (Centralized)
            const configToSave = (window as any)._platformConfig || platformConfig;
            await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configToSave)
            });
            
            setPlatformConfig(configToSave);
            alert('System Settings saved successfully! ✅');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                        System Settings ⚙️
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">
                        Global configuration and platform controls.
                    </p>
                </div>
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all font-bold"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid gap-8">
                <SettingsSection
                    title="Platform Controls"
                    icon={<Zap className="text-amber-500" />}
                    description="Manage core platform features and availability."
                >
                    <SettingRow label="Maintenance Mode" description="Temporarily disable public access to the app." enabled={false} />
                    <SettingRow label="Registration Open" description="Allow new callers and listeners to sign up." enabled={true} />
                    <SettingRow label="Real-time Analytics" description="Process live call data for the owner panel." enabled={true} />
                </SettingsSection>

                <SettingsSection
                    title="Security & Safety"
                    icon={<Shield className="text-primary" />}
                    description="Verification policies and user safety protocols."
                >
                    <SettingRow label="Manual Verification Only" description="All listeners must be approved by admin before going live." enabled={true} />
                    <SettingRow label="Strict Spam Filters" description="Automatically block suspicious call patterns." enabled={true} />
                </SettingsSection>

                <SettingsSection
                    title="Financial Controls"
                    icon={<Percent className="text-emerald-500" />}
                    description="Manage platform fees, commissions, and withdrawal limits."
                >
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Default Commission Rate (%)</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input 
                                            type="number" 
                                            step="1"
                                            value={isNaN(platformConfig.defaultCommissionRate) ? '' : Math.round(platformConfig.defaultCommissionRate * 100)}
                                            className="w-full h-14 px-5 pr-12 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const rate = val === '' ? NaN : parseFloat(val) / 100;
                                                const newConfig = { ...platformConfig, defaultCommissionRate: rate };
                                                setPlatformConfig(newConfig);
                                                (window as any)._platformConfig = newConfig;
                                            }}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">%</span>
                                    </div>
                                    <button 
                                        onClick={saveConfig}
                                        disabled={saving || isNaN(platformConfig.defaultCommissionRate)}
                                        className="h-14 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-30"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Min Withdrawal (₹)</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        value={isNaN(platformConfig.minWithdrawalAmount) ? '' : platformConfig.minWithdrawalAmount}
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const weight = val === '' ? NaN : parseInt(val);
                                            const newConfig = { ...platformConfig, minWithdrawalAmount: weight };
                                            setPlatformConfig(newConfig);
                                            (window as any)._platformConfig = newConfig;
                                        }}
                                    />
                                    <button 
                                        onClick={saveConfig}
                                        disabled={saving || isNaN(platformConfig.minWithdrawalAmount)}
                                        className="h-14 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-30"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="API & Integrations"
                    icon={<Server className="text-indigo-500" />}
                    description="External services and infrastructure connections."
                >
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 transition-all group-hover:text-primary">
                                <Database size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 tracking-tight">Firebase Real-time Sync</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connected (Region: asia-southeast1)</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                    </div>

                    <Link href="/admin/settings/twilio-manager" className="p-6 flex items-center justify-between hover:bg-indigo-50/50 transition-colors group cursor-pointer border-t border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 transition-all group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                                <Database size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 tracking-tight">Twilio Account Manager</p>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Manage Multiple Twilio Instances</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                    </Link>

                    <Link href="/admin/settings/env-control" className="p-6 flex items-center justify-between hover:bg-rose-50/50 transition-colors group cursor-pointer border-t border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-rose-500 transition-all group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-rose-500/20">
                                <Monitor size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 tracking-tight">Dynamic ENV Control</p>
                                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Manage Payment & Global Keys</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-500 transition-all group-hover:translate-x-1" />
                    </Link>
                </SettingsSection>
            </div>
        </div>
    );
}

function SettingsSection({ title, icon, description, children }: any) {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-3 mb-1">
                    {icon}
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{title}</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium ml-8">{description}</p>
            </div>
            <div className="flex flex-col">
                {children}
            </div>
        </div>
    );
}

function SettingRow({ label, description, enabled }: { label: string, description: string, enabled: boolean }) {
    return (
        <div className="p-8 border-b border-slate-50 flex items-center justify-between last:border-0 hover:bg-slate-50/50 transition-colors">
            <div>
                <p className="text-sm font-bold text-slate-800 tracking-tight">{label}</p>
                <p className="text-[10px] text-slate-400 font-bold leading-normal uppercase mt-1 max-w-[280px] tracking-tighter">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={enabled} />
                <div className="w-12 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-slate-200"></div>
            </label>
        </div>
    );
}
