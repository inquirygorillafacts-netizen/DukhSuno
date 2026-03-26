'use client';

import { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Edit2, 
    CheckCircle2, 
    AlertCircle,
    Phone,
    Shield,
    Database,
    RefreshCw,
    X,
    Save,
    Users,
    Search,
    Filter,
    ArrowRightLeft
} from 'lucide-react';
import Link from 'next/link';
import { 
    collection, 
    getDocs, 
    doc, 
    setDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TwilioAccount {
    id: string;
    name: string;
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt?: any;
}

export default function TwilioManagerPage() {
    const [accounts, setAccounts] = useState<TwilioAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<TwilioAccount | null>(null);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message?: string }>({ type: 'idle' });

    const [formData, setFormData] = useState({
        name: '',
        accountSid: '',
        authToken: '',
        phoneNumber: '',
        isActive: true
    });

    // Migration State
    const [activeTab, setActiveTab] = useState<'accounts' | 'migration'>('accounts');
    const [selectedSourceAccount, setSelectedSourceAccount] = useState('');
    const [migrationUsers, setMigrationUsers] = useState<any[]>([]);
    const [isMigrationLoading, setIsMigrationLoading] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'admin_config', 'twilio_config', 'accounts'));
            const snap = await getDocs(q);
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TwilioAccount));
            setAccounts(list);
        } catch (err) {
            console.error("Fetch failed:", err);
            setStatus({ type: 'error', message: 'Failed to load accounts.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: 'idle' });

        try {
            const id = editingAccount?.id || `tw_${Date.now()}`;
            const accountRef = doc(db, 'admin_config', 'twilio_config', 'accounts', id);
            
            await setDoc(accountRef, {
                ...formData,
                id,
                updatedAt: new Date().toISOString()
            });

            setStatus({ type: 'success', message: editingAccount ? 'Account updated!' : 'New account added!' });
            setEditingAccount(null);
            setShowForm(false);
            setFormData({ name: '', accountSid: '', authToken: '', phoneNumber: '', isActive: true });
            fetchAccounts();
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this account?')) return;
        try {
            await deleteDoc(doc(db, 'admin_config', 'twilio_config', 'accounts', id));
            fetchAccounts();
            setStatus({ type: 'success', message: 'Account deleted.' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        }
    };

    const startEdit = (acc: TwilioAccount) => {
        setEditingAccount(acc);
        setFormData({
            name: acc.name,
            accountSid: acc.accountSid,
            authToken: acc.authToken,
            phoneNumber: acc.phoneNumber,
            isActive: acc.isActive
        });
        setShowForm(true);
    };

    const fetchMigrationUsers = async (accountId: string) => {
        if (!accountId) return;
        setIsMigrationLoading(true);
        try {
            const resp = await fetch(`/api/admin/users/twilio-migration?accountId=${accountId}`);
            if (resp.ok) {
                const data = await resp.json();
                setMigrationUsers(data.users || []);
            }
        } catch (err) {
            console.error("Migration fetch failed:", err);
        } finally {
            setIsMigrationLoading(false);
        }
    };

    const handleSwitchAccount = async (uid: string, targetAccountId: string) => {
        if (!targetAccountId) return;
        setUpdatingUserId(uid);
        try {
            const resp = await fetch('/api/admin/users/twilio-migration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, targetAccountId })
            });

            if (resp.ok) {
                // Remove from list
                setMigrationUsers(prev => prev.filter(u => u.uid !== uid));
                setStatus({ type: 'success', message: 'User account switched successfully!' });
            } else {
                const err = await resp.json();
                setStatus({ type: 'error', message: err.error || 'Switch failed' });
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/settings" className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            Twilio Account Manager
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight whitespace-pre-wrap">Manage multiple Twilio credentials for verification and alerts.</p>
                    </div>
                </div>
                
                <div className="flex items-center bg-slate-100 p-1.5 rounded-[1.5rem]">
                    <button 
                        onClick={() => setActiveTab('accounts')}
                        className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all
                            ${activeTab === 'accounts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        Accounts
                    </button>
                    <button 
                        onClick={() => setActiveTab('migration')}
                        className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all
                            ${activeTab === 'migration' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        Migration
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200 mx-2" />
                    <button 
                        onClick={() => {
                            setEditingAccount(null);
                            setFormData({ name: '', accountSid: '', authToken: '', phoneNumber: '', isActive: true });
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Plus size={14} />
                        Add Account
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {status.type !== 'idle' && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2
                    ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
                `}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-xs font-bold">{status.message}</p>
                    <button onClick={() => setStatus({ type: 'idle' })} className="ml-auto"><X size={14} /></button>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'accounts' ? (
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="h-64 bg-slate-50 rounded-3xl flex items-center justify-center animate-pulse">
                                    <RefreshCw className="animate-spin text-slate-300" size={32} />
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Database size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No accounts linked yet</h3>
                                    <p className="text-sm text-slate-400 mt-2">Start by adding your first Twilio instance.</p>
                                </div>
                            ) : (
                                accounts.map(acc => (
                                    <div key={acc.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                                        {!acc.isActive && <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10" />}
                                        <div className="flex items-center justify-between relative z-20">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm
                                                    ${acc.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}
                                                `}>
                                                    <Phone size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{acc.name}</h3>
                                                        {acc.isActive ? (
                                                            <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-black uppercase tracking-wider">Active</span>
                                                        ) : (
                                                            <span className="text-[9px] px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full font-black uppercase tracking-wider">Paused</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                        <span>SID: {acc.accountSid.substring(0, 10)}...</span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                        <span className="text-indigo-500">{acc.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => startEdit(acc)}
                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(acc.id)}
                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Migration Tool */}
                            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Filter size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Source Account Migration</h3>
                                        <p className="text-xs text-slate-500 font-medium">Select an account with zero credit to move users to a fresh one.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <select 
                                        value={selectedSourceAccount}
                                        onChange={(e) => {
                                            setSelectedSourceAccount(e.target.value);
                                            fetchMigrationUsers(e.target.value);
                                        }}
                                        className="flex-1 h-14 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 font-bold text-slate-700 focus:bg-white focus:border-amber-200 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Exhausted Account...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.phoneNumber})</option>
                                        ))}
                                    </select>
                                    
                                    <button 
                                        onClick={() => fetchMigrationUsers(selectedSourceAccount)}
                                        className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all"
                                    >
                                        <RefreshCw className={isMigrationLoading ? 'animate-spin' : ''} size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Migration User List */}
                            <div className="space-y-4">
                                {isMigrationLoading ? (
                                    <div className="h-32 bg-slate-50 rounded-3xl flex items-center justify-center animate-pulse text-slate-300 font-bold">
                                        SCANNING USERS...
                                    </div>
                                ) : selectedSourceAccount && migrationUsers.length === 0 ? (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                                        <p className="text-sm font-bold text-slate-400">No users found for this account.</p>
                                    </div>
                                ) : (
                                    migrationUsers.map(user => (
                                        <MigrationUserRow 
                                            key={user.uid} 
                                            user={user} 
                                            accounts={accounts.filter(a => a.id !== selectedSourceAccount)}
                                            onSwitch={handleSwitchAccount}
                                            isUpdating={updatingUserId === user.uid}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Area */}
                {showForm && (
                     <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-2xl shadow-indigo-100 h-fit sticky top-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                {editingAccount ? 'Edit Account' : 'New Configuration'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Display Name</label>
                                <input 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Primary Account"
                                    className="w-full h-14 bg-slate-50 rounded-2xl border-2 border-slate-50 px-6 font-bold text-slate-700 focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Account SID</label>
                                <input 
                                    required
                                    value={formData.accountSid}
                                    onChange={e => setFormData({...formData, accountSid: e.target.value})}
                                    placeholder="ACxxxxxxxxxxxx"
                                    className="w-full h-14 bg-slate-50 rounded-2xl border-2 border-slate-50 px-6 font-mono text-xs focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Auth Token</label>
                                <input 
                                    required
                                    type="password"
                                    value={formData.authToken}
                                    onChange={e => setFormData({...formData, authToken: e.target.value})}
                                    placeholder="••••••••••••"
                                    className="w-full h-14 bg-slate-50 rounded-2xl border-2 border-slate-50 px-6 font-mono text-xs focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Twilio Number</label>
                                <input 
                                    required
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                    placeholder="+123456789"
                                    className="w-full h-14 bg-slate-50 rounded-2xl border-2 border-slate-50 px-6 font-bold text-slate-700 focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <input 
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Account Active</span>
                            </label>

                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                                {isSaving ? 'Saving...' : 'Sync to Cloud'}
                            </button>
                        </form>
                     </div>
                )}
            </div>
        </div>
    );
}

function MigrationUserRow({ user, accounts, onSwitch, isUpdating }: { 
    user: any, 
    accounts: TwilioAccount[], 
    onSwitch: (uid: string, targetId: string) => void,
    isUpdating: boolean
}) {
    const [targetId, setTargetId] = useState('');

    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between group hover:border-amber-200 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Users size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 leading-none">{user.displayName}</h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{user.phoneNumber}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 min-w-[180px]">
                    <ArrowRightLeft size={14} className="text-slate-300" />
                    <select 
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] font-black text-slate-700 uppercase tracking-wider w-full cursor-pointer"
                    >
                        <option value="">Switch to...</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>

                <button 
                    disabled={!targetId || isUpdating}
                    onClick={() => onSwitch(user.uid, targetId)}
                    className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${!targetId ? 'bg-slate-100 text-slate-300' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-sm shadow-amber-100'}
                    `}
                >
                    {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Save'}
                </button>
            </div>
        </div>
    );
}
