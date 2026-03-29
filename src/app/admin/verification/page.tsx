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
  Check,
  Edit2
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

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<PendingUser | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', phoneNumber: '', gender: '', avatarUrl: '' });

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
      
      // Removed the aggressive background polling loop that was spamming the Twilio API.
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

  const openEditModal = (user: PendingUser) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName || '',
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || '',
      avatarUrl: user.avatarUrl || ''
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setProcessingId(editingUser.uid);
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        displayName: editForm.displayName,
        phoneNumber: editForm.phoneNumber,
        gender: editForm.gender,
        avatarUrl: editForm.avatarUrl
      });
      alert('User details updated successfully!');
      setEditingUser(null);
    } catch (err) {
      alert('Failed to update user details');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 md:pb-0">
      {/* Top Header & Dialer Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Dialer Section */}
        <section className="w-full lg:w-80 glass bg-white p-6 md:p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col gap-6">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Hash size={20} />
                <h2 className="font-black uppercase tracking-widest text-xs">Quick Dialer</h2>
              </div>
              <p className="text-[11px] text-slate-400 font-bold leading-snug">Type any number to verify directly via Twilio Call.</p>
              
              {/* Global Account Selector for Dialer */}
              <div className="pt-2 space-y-2">
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

           <div className="space-y-4">
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
                    <p className="text-[11px] font-bold leading-relaxed">{dialerStatus.error}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium opacity-80 italic">"नमस्ते! आप बिगसुनो पर कॉल कर रहे हैं..."</p>
                      <div className="pt-2 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Notification Sent</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
           </div>
        </section>
        
        <div className="flex-1 space-y-8 w-full">
           <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Verification Room</h1>
              <p className="text-sm md:text-base text-slate-400 font-bold italic tracking-tight">"Naye doston ki jaanch karein aur unhe connect karein..."</p>
           </div>

           {/* Tab Switcher Area */}
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <button 
                   onClick={() => setActiveTab('pending')}
                   className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                     activeTab === 'pending' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:bg-slate-50'
                   }`}
                 >
                   PENDING ⏳
                 </button>
                 <button 
                   onClick={() => setActiveTab('verified')}
                   className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                     activeTab === 'verified' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'
                   }`}
                 >
                   VERIFIED ✅
                 </button>
              </div>
              
              <div className="hidden md:flex px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest items-center gap-2">
                 <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                 Live Updates On
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
                            <div className="flex items-center gap-3">
                               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.displayName}</h3>
                               <button 
                                  onClick={() => openEditModal(user)} 
                                  className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                  title="Edit User Details"
                               >
                                  <Edit2 size={16} />
                               </button>
                            </div>
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
                                   className={`h-14 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 border-2 ${
                                     isReady 
                                     ? 'bg-slate-900 text-white border-slate-900 hover:scale-[1.02] active:scale-95' 
                                     : 'bg-slate-900 text-white/30 border-slate-900 opacity-70 cursor-not-allowed'
                                   }`}
                                 >
                                   {processingId === user.uid ? 'Working...' : 'Approve User ✨'}
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
      </div>
    </div>

    {/* EDIT MODAL */}
    {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <XCircle size={24} />
                </button>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Edit Provider</h2>
                <p className="text-xs font-bold text-slate-400 mb-6">Modify user identity before approval.</p>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Display Name</label>
                        <input 
                           value={editForm.displayName} 
                           onChange={e => setEditForm({...editForm, displayName: e.target.value})}
                           className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-700 transition-all"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Phone Number (Twilio verified)</label>
                        <input 
                           value={editForm.phoneNumber} 
                           onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                           className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-700 transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gender</label>
                        <select 
                           value={editForm.gender} 
                           onChange={e => setEditForm({...editForm, gender: e.target.value})}
                           className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-700 transition-all appearance-none cursor-pointer"
                        >
                           <option value="Select Gender">Select Gender</option>
                           <option value="Male">Male</option>
                           <option value="Female">Female</option>
                           <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Avatar DP URL (or Emoji)</label>
                        <input 
                           value={editForm.avatarUrl} 
                           onChange={e => setEditForm({...editForm, avatarUrl: e.target.value})}
                           className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none font-medium text-xs text-slate-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => setEditingUser(null)}
                      className="flex-1 py-3.5 rounded-xl border border-slate-200 font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={saveEdit}
                      disabled={processingId !== null}
                      className="flex-1 py-3.5 rounded-xl bg-slate-900 border border-slate-900 font-black text-xs uppercase tracking-widest text-white hover:scale-105 active:scale-95 shadow-xl transition-all"
                    >
                       {processingId === editingUser.uid ? 'Saving...' : 'Save Info'}
                    </button>
                </div>
            </div>
        </div>
    )}

  </div>
  );
}
