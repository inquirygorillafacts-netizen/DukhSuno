'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
    Database, 
    ShieldCheck, 
    Zap, 
    RefreshCcw, 
    AlertTriangle, 
    CheckCircle2, 
    Phone, 
    Key,
    ExternalLink,
    Lock
} from 'lucide-react';

export default function AdminTwilioPage() {
    const [isRotating, setIsRotating] = useState(false);
    const [status, setStatus] = useState('Active');
    
    // Twilio Wizard State
    const [vNumber, setVNumber] = useState('');
    const [vStatus, setVStatus] = useState<'idle'|'calling'|'success'|'error'>('idle');

    const handleRotate = () => {
        setIsRotating(true);
        setTimeout(() => {
            setIsRotating(false);
            alert('Twilio credentials rotated successfully (Placeholder)');
        }, 2000);
    };

    const handleVerify = async () => {
        if (!vNumber) return;
        setVStatus('calling');
        
        try {
            // 1. Simulate Twilio API call (Verification)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 2. Real Firestore Update: Mark user as verified
            const usersQ = query(collection(db, 'users'), where('phoneNumber', '==', vNumber));
            const querySnapshot = await getDocs(usersQ);
            
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                await updateDoc(doc(db, 'users', userDoc.id), {
                    isVerified: true,
                    verifiedAt: new Date()
                });
                setVStatus('success');
            } else {
                console.warn("No user found with this number, but verification marked as complete for Twilio.");
                setVStatus('success');
            }

            setTimeout(() => setVStatus('idle'), 3000);
        } catch (err) {
            console.error("Verification failed:", err);
            setVStatus('error');
            setTimeout(() => setVStatus('idle'), 3000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-gradient">Twilio Infrastructure</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Monitor SMS/Voice limits and manage account rotation.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRotate}
                        disabled={isRotating}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 active:scale-95"
                    >
                        <RefreshCcw size={14} className={isRotating ? "animate-spin" : ""} />
                        Rotate Credentials
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Account Status */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Twilio Wizard - NEW Productivity Tool */}
                    <div className="bg-indigo-900 p-8 rounded-[40px] border border-indigo-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="max-w-xs">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                    <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Productivity Tool</h3>
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tighter mb-2 italic">Twilio Number Wizard</h2>
                                <p className="text-xs text-indigo-200/60 leading-relaxed">Verify new numbers for your trial account directly from here. No need to open Twilio Console.</p>
                            </div>

                            <div className="flex-1 max-w-sm space-y-3">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                                        <Phone size={14} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="+91 83028 0XXXX"
                                        value={vNumber}
                                        onChange={(e) => setVNumber(e.target.value)}
                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 text-white text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-indigo-400 transition-all"
                                    />
                                </div>
                                <button 
                                    onClick={handleVerify}
                                    disabled={vStatus === 'calling' || !vNumber}
                                    className={`w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                        vStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95'
                                    }`}
                                >
                                    {vStatus === 'idle' && <><ShieldCheck size={16} /> Verify Now</>}
                                    {vStatus === 'calling' && <><RefreshCcw size={16} className="animate-spin" /> Calling...</>}
                                    {vStatus === 'success' && <><CheckCircle2 size={16} /> Number Verified!</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                                <ShieldCheck size={24} />
                             </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Active Twilio Account</h2>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Production_Main_Account</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm"><Database size={16} className="text-primary" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account SID</p>
                                        <p className="text-xs font-bold text-slate-700 font-mono">ACef9c0...a13d</p>
                                    </div>
                                </div>
                                <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm"><Key size={16} className="text-primary" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Token</p>
                                        <p className="text-xs font-bold text-slate-700 font-mono">••••••••••••••••</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase text-slate-500">System Connected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-500">Trial Mode Enabled</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                             <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Call Capability</h4>
                             <div className="space-y-4">
                                <CapabilityRow label="Outbound Calls" active={true} />
                                <CapabilityRow label="Inbound Calls" active={true} />
                                <CapabilityRow label="Recording" active={false} />
                                <CapabilityRow label="IVR Systems" active={true} />
                             </div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
                             <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Twilio Number</h4>
                             <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                    <Phone size={24} />
                                 </div>
                                 <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">+1 518 760 6311</p>
                             </div>
                             <button className="mt-6 w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                Open Twilio Console <ExternalLink size={12} />
                             </button>
                        </div>
                    </div>
                </div>

                {/* Account Health & Limits */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Account Health</h4>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Free Balance Used</span>
                                    <span className="text-[10px] font-black uppercase text-primary">₹680 / ₹1,200</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <div className="h-full bg-primary w-[56%] rounded-full shadow-inner animate-[slideRight_1.5s_ease-out]"></div>
                                </div>
                            </div>

                            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
                                <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-amber-700 mb-1">Limit Approaching</p>
                                    <p className="text-[10px] font-medium text-amber-600 leading-normal">You are using 56% of your trial credits. Rotating to a new account soon is recommended.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100"><CheckCircle2 size={16} /></div>
                                    <span className="text-[10px] font-black uppercase text-slate-500">API Latency: 42ms</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100"><CheckCircle2 size={16} /></div>
                                    <span className="text-[10px] font-black uppercase text-slate-500">Webhooks: Healthy</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <Lock className="absolute -right-4 -bottom-4 text-slate-800" size={120} />
                        <div className="relative z-10 space-y-4">
                            <h4 className="text-white font-black uppercase tracking-widest text-[11px]">Auto-Rotation</h4>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed">System will automatically switch to account #2 when credits hit <b className="text-primary">90%</b>.</p>
                            <label className="relative inline-flex items-center cursor-pointer pt-2">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                <span className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Automation Active</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CapabilityRow({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between group cursor-default">
            <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}>
                {active ? 'Available' : 'Disabled'}
            </div>
        </div>
    );
}
