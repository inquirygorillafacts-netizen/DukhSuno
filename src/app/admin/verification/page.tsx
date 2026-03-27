'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  ShieldCheck, 
  Clock,
  Settings,
  AlertCircle,
  PhoneCall,
  Hash,
  RefreshCw,
  Search,
  Filter,
  Check
} from 'lucide-react';

interface PendingUser {
  uid: string;
  displayName: string;
  avatarUrl: string;
  gender: string;
  phoneNumber: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isVerified: boolean;
  registeredAt: any;
  twilioStatus?: 'verified' | 'unverified' | 'checking';
}

export default function AdminVerificationPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [dialerNumber, setDialerNumber] = useState('+91');
  const [dialerStatus, setDialerStatus] = useState<{ status: string; code?: string; error?: string } | null>(null);
  
  // Multi-Twilio State
  const [twilioAccounts, setTwilioAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(''); // Global for Dialer
  // per-user validation state: { [uid]: { gender: boolean, phone: boolean, twilioAccountId: string } }
  const [validationState, setValidationState] = useState<Record<string, { gender: boolean; phone: boolean; twilioAccountId?: string }>>({});

  useEffect(() => {
    const fetchTwilioAccounts = async () => {
      const resp = await fetch('/api/admin/config?type=twilio_accounts');
      if (resp.ok) {
        const data = await resp.json();
        setTwilioAccounts(data.accounts || []);
      }
    };
    fetchTwilioAccounts();
  }, []);

  useEffect(() => {
    let q;
    if (activeTab === 'pending') {
      q = query(collection(db, 'users'), where('verificationStatus', '==', 'pending'));
    } else {
      q = query(collection(db, 'users'), where('isVerified', '==', true));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        twilioStatus: 'checking'
      } as PendingUser));
      
      data.sort((a, b) => (b.registeredAt?.seconds || 0) - (a.registeredAt?.seconds || 0));
      setUsers(data);
      setLoading(false);
      
      // Auto-check Twilio status for all visible users
      data.forEach(u => checkTwilioStatus(u.uid, u.phoneNumber));
    });

    return () => unsubscribe();
  }, [activeTab]);

  const checkTwilioStatus = async (uid: string, phone: string) => {
    if (!phone) return;
    try {
      const resp = await fetch(`/api/twilio/verify?phoneNumber=${encodeURIComponent(phone)}`);
      const data = await resp.json();
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, twilioStatus: data.isVerified ? 'verified' : 'unverified' } : u));
    } catch (err) {
      console.error('Twilio check failed', err);
    }
  };

  const handleTwilioCall = async (phone: string, uid?: string) => {
    // PREVENT DOUBLE CALLS
    if (processingId || dialerStatus?.status === 'Calling...') return;

    if (uid) setProcessingId(uid);
    else setDialerStatus({ status: 'Calling...' });

    try {
      const resp = await fetch('/api/twilio/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: phone, 
          simulate: false,
          accountId: selectedAccountId // Pass selected account (could be empty for Auto)
        }) 
      });
      const data = await resp.json();
      
      if (data.status === 'calling' || data.status === 'simulated') {
        if (uid) alert(`Call Triggered! Status: ${data.status}\nCheck Twilio or your phone!`);
        else setDialerStatus({ 
          status: data.status === 'simulated' ? 'SIMULATION MODE' : '📞 RINGING...', 
        });
      } else {
        if (uid) alert(`Error: ${data.error}`);
        else setDialerStatus({ status: 'Error', error: data.error });
      }
    } catch (err: any) {
      if (uid) alert(`Exception: ${err.message}`);
      else setDialerStatus({ status: 'Error', error: err.message });
    } finally {
      if (uid) setProcessingId(null);
      // Wait a bit before allowing another call
      setTimeout(() => {
        if (!uid) setDialerStatus(prev => prev?.status === 'Calling...' ? null : prev);
      }, 2000);
    }
  };

  const toggleValidation = (uid: string, field: 'gender' | 'phone') => {
    setValidationState(prev => ({
      ...prev,
      [uid]: {
        ...(prev[uid] || { gender: false, phone: false }),
        [field]: !(prev[uid]?.[field])
      }
    }));
  };

  const updateRowTwilioAccount = (uid: string, accountId: string) => {
    setValidationState(prev => ({
      ...prev,
      [uid]: {
        ...(prev[uid] || { gender: false, phone: false }),
        twilioAccountId: accountId
      }
    }));
  };

  const revertVerification = async (uid: string) => {
    if (!window.confirm('क्या आप वाकई इस यूजर को वापस पेंडिंग (Pending) में डालना चाहते हैं?')) {
      return;
    }

    setProcessingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        verificationStatus: 'pending',
        isVerified: false,
        verifiedAt: null,
      });
      alert('User moved back to pending!');
    } catch (err) {
      alert('Revert failed');
    } finally {
      setProcessingId(null);
    }
  };

  const approveUser = async (uid: string) => {
    const state = validationState[uid];
    if (!state?.gender || !state?.phone || !state?.twilioAccountId) {
      alert('Gender, Phone और Twilio Account चुनना अनिवार्य है!');
      return;
    }

    setProcessingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        verificationStatus: 'verified',
        isVerified: true,
        isGenderLocked: true,
        verifiedAt: new Date(),
        twilioAccountId: state.twilioAccountId
      });
      // Clear local state
      const newState = { ...validationState };
      delete newState[uid];
      setValidationState(newState);
    } catch (err) {
      alert('Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar Dialer */}
      <aside className="w-80 border-r border-slate-200 bg-white p-8 flex flex-col gap-8 sticky top-0 h-screen">
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-indigo-600">
             <Hash size={20} />
             <h2 className="font-black uppercase tracking-widest text-xs">Quick Dialer</h2>
           </div>
           <p className="text-[11px] text-slate-400 font-bold leading-snug">Type any number to verify directly via Twilio Call.</p>
           
           {/* Global Account Selector for Dialer */}
           <div className="pt-4 space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Call via Account:</label>
              <select 
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 font-bold text-[11px] text-slate-700 outline-none focus:border-indigo-200 transition-all appearance-none cursor-pointer"
              >
                <option value="">✨ Auto-Detect (Smart)</option>
                {twilioAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>📞 {acc.name}</option>
                ))}
              </select>
           </div>
        </div>

        <div className="space-y-6">
           <input 
             value={dialerNumber}
             onChange={(e) => setDialerNumber(e.target.value)}
             placeholder="+919876XXXXXX"
             className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 font-black text-sm tracking-widest focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
           />
           <button 
             onClick={() => handleTwilioCall(dialerNumber)}
              disabled={!dialerNumber || dialerStatus?.status === 'Calling...'}
              className={`w-full h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${
                !dialerNumber || dialerStatus?.status === 'Calling...' 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-slate-900 text-white hover:scale-105 active:scale-95 shadow-slate-200'
              }`}
           >
             Make Call <PhoneCall size={18} />
           </button>

            {dialerStatus && (
              <div className={`p-6 rounded-[2rem] border-2 shadow-sm animate-in slide-in-from-top-2 ${dialerStatus.error ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dialerStatus.error ? 'bg-rose-100' : 'bg-indigo-100 text-indigo-600'}`}>
                    {dialerStatus.error ? <AlertCircle size={16} /> : <PhoneCall size={16} className="animate-pulse" />}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{dialerStatus.status}</p>
                </div>
                
                {dialerStatus.error ? (
                  <p className="text-[11px] font-bold leading-relaxed">{dialerStatus.error} (Status Code: {dialerStatus.code})</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium opacity-80 italic">"नमस्ते! आपको दुख सुनो ऐप पर किसी ने कॉल किया है..."</p>
                    <div className="pt-2 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Voice Notification Sent</span>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-3">
              <h1 className="text-[48px] font-black text-slate-900 tracking-tighter leading-none">Admin Control Room</h1>
              <p className="text-slate-400 font-medium">Verify pending users or test already verified connections.</p>
           </div>
           
           {/* Tab Switcher */}
           <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'pending' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                पेंडिंग (Pending)
              </button>
              <button 
                onClick={() => setActiveTab('verified')}
                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'verified' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                वेरिफाइड (Verified)
              </button>
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-slate-300" size={32} /></div>
        ) : users.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100 border-dashed">
             <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-xl font-bold text-slate-400">इस लिस्ट में कोई यूज़र नहीं है।</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {users.map((user) => {
              const vState = validationState[user.uid] || { gender: false, phone: false };
              const isReady = vState.gender && vState.phone && vState.twilioAccountId;

              return (
                <div key={user.uid} className="bg-white p-8 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all group overflow-hidden">
                   <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                      {/* Left: User Info */}
                      <div className="flex items-center gap-6 min-w-[300px]">
                         <img src={user.avatarUrl} className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-slate-50" />
                         <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.displayName}</h3>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                               <Phone size={14} className="text-rose-500" /> {user.phoneNumber}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">{user.gender}</span>
                            </div>
                         </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex-1 flex flex-wrap items-center justify-end gap-6">
                        
                        {activeTab === 'pending' ? (
                          <>
                            <div className="flex flex-wrap items-center gap-4">
                               {/* Row-specific Twilio Account Dropdown */}
                               <div className="flex flex-col gap-1.5 min-w-[180px]">
                                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Connect with Account:</label>
                                  <select 
                                    value={vState.twilioAccountId || ''}
                                    onChange={(e) => updateRowTwilioAccount(user.uid, e.target.value)}
                                    className={`h-12 px-4 rounded-xl border font-black text-[10px] uppercase tracking-wider outline-none transition-all cursor-pointer appearance-none shadow-sm
                                      ${vState.twilioAccountId ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400 focus:border-indigo-100'}
                                    `}
                                  >
                                    <option value="">Select Twilio...</option>
                                    {twilioAccounts.map(acc => (
                                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                  </select>
                               </div>

                               <button 
                                 onClick={() => toggleValidation(user.uid, 'gender')}
                                 className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
                                   vState.gender ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400'
                                 }`}
                               >
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${vState.gender ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                                    {vState.gender && <Check size={14} className="text-white" />}
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-widest italic">Gender</span>
                               </button>

                               <button 
                                 onClick={() => toggleValidation(user.uid, 'phone')}
                                 className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
                                   vState.phone ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400'
                                 }`}
                               >
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${vState.phone ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                                    {vState.phone && <Check size={14} className="text-white" />}
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-widest italic">Phone</span>
                               </button>
                            </div>

                            <button 
                              onClick={() => approveUser(user.uid)}
                              disabled={!isReady || processingId === user.uid}
                              className={`h-14 px-10 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${
                                isReady ? 'bg-slate-900 text-white hover:scale-105 active:scale-95 shadow-indigo-100' : 'bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100'
                              }`}
                            >
                              {processingId === user.uid ? 'Working...' : 'Approve User'}
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-wrap items-center justify-end gap-3">
                             <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${user.twilioStatus === 'verified' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                               {user.twilioStatus === 'verified' ? 'Twilio Verified 🛡️' : 'Checking Twilio...'}
                             </div>
                             
                             <button 
                               onClick={() => handleTwilioCall(user.phoneNumber, user.uid)}
                               disabled={processingId === user.uid}
                               className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                             >
                               Test Call <PhoneCall size={18} />
                             </button>

                             <button 
                               onClick={() => revertVerification(user.uid)}
                               disabled={processingId === user.uid}
                               className="h-14 px-8 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-rose-50 transition-all active:scale-95"
                             >
                               Move To Pending <RefreshCw size={18} className={processingId === user.uid ? 'animate-spin' : ''} />
                             </button>
                          </div>
                        )}

                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
