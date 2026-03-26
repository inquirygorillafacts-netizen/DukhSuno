'use client';

import { useState, useEffect } from 'react';
import { 
    Monitor, 
    ArrowLeft, 
    Save, 
    Terminal, 
    CheckCircle2, 
    AlertCircle,
    Copy,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EnvControlPage() {
    const [envText, setEnvText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message?: string }>({ type: 'idle' });

    useEffect(() => {
        const fetchCurrentConfig = async () => {
            try {
                const configDoc = await getDoc(doc(db, 'admin_config', 'secrets'));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    const text = Object.entries(data)
                        .map(([key, value]) => `${key}=${value}`)
                        .join('\n');
                    setEnvText(text);
                }
            } catch (err) {
                console.error("Failed to fetch config:", err);
            }
        };
        fetchCurrentConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setStatus({ type: 'idle' });

        try {
            // Parse .env style text
            const lines = envText.split('\n');
            const newConfig: Record<string, string> = {};

            lines.forEach(line => {
                const trimmed = line.trim();
                // Ignore comments and empty lines
                if (!trimmed || trimmed.startsWith('#')) return;

                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    let value = valueParts.join('=').trim();
                    // Remove quotes if present
                    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                        value = value.substring(1, value.length - 1);
                    }
                    newConfig[key.trim()] = value;
                }
            });

            if (Object.keys(newConfig).length === 0) {
                throw new Error("No valid environment variables found to save.");
            }

            // Save to Firestore
            await setDoc(doc(db, 'admin_config', 'secrets'), newConfig);
            
            setStatus({ type: 'success', message: 'Secrets updated and synced successfully!' });
            setTimeout(() => setStatus({ type: 'idle' }), 3000);
        } catch (err: any) {
            console.error("Failed to save config:", err);
            setStatus({ type: 'error', message: err.message || 'Failed to update secrets.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/settings" className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            Dynamic ENV Control
                            <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-black uppercase tracking-widest">Beta</span>
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Manage keys for Twilio, PayU & external services at runtime.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all
                        ${isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black hover:shadow-2xl shadow-xl shadow-slate-900/20 active:scale-95'}
                    `}
                >
                    {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save to Cloud'}
                </button>
            </div>

            {/* Main Area */}
            <div className="grid gap-6">
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-slate-800">
                            <Terminal size={20} className="text-rose-500" />
                            <h3 className="text-lg font-black tracking-tight">Configuration Editor</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Runtime Sync</span>
                        </div>
                    </div>

                    <div className="relative group">
                         <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent rounded-[2rem] -m-1 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                         <textarea
                            value={envText}
                            onChange={(e) => setEnvText(e.target.value)}
                            placeholder="PASTE YOUR ENV CONTENT HERE...&#10;EXAMPLE:&#10;TWILIO_ACCOUNT_SID=AC...&#10;PAYU_KEY=gtKFFx"
                            className="relative w-full h-[400px] bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 font-mono text-sm text-slate-700 focus:outline-none focus:border-rose-200 focus:bg-white transition-all shadow-inner resize-none"
                            spellCheck={false}
                         />
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                         <div className="flex items-center gap-6">
                             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                 <CheckCircle2 size={14} className="text-emerald-500" />
                                 Auto-Parses Key=Value
                             </div>
                             <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                 <CheckCircle2 size={14} className="text-emerald-500" />
                                 Ignores Comments (#)
                             </div>
                         </div>
                         <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight italic">Values are encrypted at rest via Firebase</p>
                    </div>
                </div>

                {/* Status Messages */}
                {status.type !== 'idle' && (
                    <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 duration-300 flex items-center gap-4
                        ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
                    `}>
                        {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <p className="text-sm font-bold tracking-tight">{status.message}</p>
                    </div>
                )}

                {/* Information Card */}
                <div className="p-8 bg-rose-50/50 rounded-[3rem] border border-rose-100/50 flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-1">Runtime Sync active</h4>
                        <p className="text-xs text-rose-600/80 font-medium leading-relaxed max-w-xl">
                            Changes saved here will be reflected across all API routes within 30 seconds. 
                            This allows you to switch Twilio credentials or payment gateways instantly without downtime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
