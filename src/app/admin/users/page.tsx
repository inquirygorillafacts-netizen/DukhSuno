'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Search,
    Filter,
    MoreHorizontal,
    UserPlus,
    ShieldCheck,
    Ban,
    CheckCircle2,
    Mail,
    ChevronRight,
    ArrowUpDown,
    Clock,
    ShieldAlert,
    UserCog,
    Crown
} from 'lucide-react';
import IdentityDrawer from '@/components/admin/IdentityDrawer';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  isBlocked?: boolean;
  avatarUrl?: string;
  roles?: string[];
  owner?: boolean;
  createdAt?: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  type FilterType = 'all' | 'owner' | 'admin' | 'listener' | 'speaker' | 'blocked';
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any));
      setUsers(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInspectUser = async (user: any) => {
      setSelectedUser(user);
      setIsDrawerOpen(true);
      
      // Fetch deep data: Balance and Recent Sessions
      try {
          // 1. Fetch sessions
          const sessionsQ = query(
              collection(db, 'sessions'),
              // where('listenerId', '==', user.uid), // This would need composite index, simplify for now
              orderBy('createdAt', 'desc'),
              limit(3)
          );
          
          const sessionsSnap = await getDocs(sessionsQ);
          const sessions = sessionsSnap.docs.map(d => d.data());
          
          setSelectedUser((prev: any) => ({
              ...prev,
              recentSessions: sessions,
              balance: user.balance || "0.00", // Assuming balance is already on user doc or fetch from wallet
              canWithdraw: true,
              isVIP: user.roles?.includes('vip')
          }));
      } catch (err) {
          console.error("Error fetching user details:", err);
      }
  };

  const toggleBlock = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isBlocked: !currentStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Action failed!');
    }
  };

  const toggleRole = async (uid: string, currentRoles: string[] = []) => {
    try {
      const isCurrentlyAdmin = currentRoles.includes('admin');
      const nextRoles = isCurrentlyAdmin 
        ? currentRoles.filter(r => r !== 'admin')
        : [...currentRoles, 'admin'];
      
      await updateDoc(doc(db, 'users', uid), { roles: nextRoles });
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Role update failed!');
    }
  };

  const toggleOwner = async (uid: string, currentStatus: boolean) => {
    if (!confirm('Are you sure you want to change Owner status? Owners have absolute control.')) return;
    try {
      await updateDoc(doc(db, 'users', uid), { owner: !currentStatus });
    } catch (err) {
      console.error('Failed to update owner:', err);
      alert('Owner update failed!');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.phoneNumber?.includes(searchTerm);
    
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'owner') return u.owner === true;
    if (filter === 'admin') return u.roles?.includes('admin');
    if (filter === 'listener') return u.roles?.includes('listener');
    if (filter === 'speaker') return u.roles?.includes('speaker');
    if (filter === 'blocked') return u.isBlocked === true;
    
    return true;
  });

  if (loading) return <div className="p-10 font-bold animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Users Management</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight italic">Total {users.length} registered users on BigSuno.</p>
          </div>
          <div className="flex items-center gap-3">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48 lg:w-64 transition-all"
                  />
              </div>
              <button className="p-2.5 bg-white text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                  <Filter size={18} />
              </button>
          </div>
      </div>

       {/* Filter Pills */}
       <div className="flex flex-wrap gap-2">
           {[
               { id: 'all', label: 'All Users', count: users.length },
               { id: 'owner', label: 'Owners', count: users.filter(u => u.owner).length },
               { id: 'admin', label: 'Admins', count: users.filter(u => u.roles?.includes('admin')).length },
               { id: 'listener', label: 'Sunne Wale', count: users.filter(u => u.roles?.includes('sunne_wala') || u.roles?.includes('listener')).length },
               { id: 'speaker', label: 'Sunane Wale', count: users.filter(u => u.roles?.includes('sunane_wala') || u.roles?.includes('speaker')).length },
               { id: 'blocked', label: 'Blocked', count: users.filter(u => u.isBlocked).length },
           ].map((pill) => (
               <button
                   key={pill.id}
                   onClick={() => setFilter(pill.id as FilterType)}
                   className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                       filter === pill.id 
                       ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' 
                       : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                   }`}
               >
                   {pill.label}
                   <span className={`px-1.5 py-0.5 rounded-lg text-[8px] ${
                       filter === pill.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                   }`}>
                       {pill.count}
                   </span>
               </button>
           ))}
       </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-50/50">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-50/30 transition-colors group">
                              <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner ${
                                          u.isBlocked ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary'
                                      }`}>
                                          {u.avatarUrl?.startsWith('avatar:') ? u.avatarUrl.split(':')[1] : (u.displayName?.charAt(0) || 'U')}
                                      </div>
                                      <div className="min-w-0">
                                          <p className={`text-sm font-bold truncate ${u.isBlocked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                              {u.displayName || 'Unnamed User'}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                              <Mail size={10} className="text-slate-300" />
                                              <p className="text-[10px] text-slate-400 font-medium truncate">{u.email}</p>
                                          </div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-6">
                                  {u.isBlocked ? (
                                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg uppercase border border-rose-100 flex items-center gap-1.5 w-fit">
                                          <Ban size={10} /> Blocked
                                      </span>
                                  ) : (
                                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase border border-emerald-100 flex items-center gap-1.5 w-fit">
                                          <CheckCircle2 size={10} /> Active
                                      </span>
                                  )}
                              </td>
                              <td className="px-8 py-6">
                                  <div className="flex flex-wrap gap-1">
                                      {u.owner === true && (
                                          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-black rounded-md border border-rose-200 uppercase tracking-tighter">
                                              Owner
                                          </span>
                                      )}
                                      {u.roles?.map(role => (
                                          <span key={role} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-md border border-slate-200 uppercase tracking-tighter">
                                              {role.replace('_', ' ')}
                                          </span>
                                      )) || <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Normal User</span>}
                                  </div>
                              </td>
                              <td className="px-8 py-6">
                                  {u.isVerified ? (
                                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                                          <ShieldCheck size={14} />
                                          Verified
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                                          <Clock size={14} />
                                          Pending
                                      </div>
                                  )}
                              </td>
                              <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <button 
                                          onClick={() => toggleBlock(u.uid, u.isBlocked || false)}
                                          className={`p-2 rounded-xl transition-all ${
                                              u.isBlocked 
                                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                          }`}
                                          title={u.isBlocked ? 'Unblock User' : 'Block User'}
                                      >
                                          {u.isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                                      </button>
                                       
                                      <button 
                                          onClick={() => toggleRole(u.uid, u.roles || [])}
                                          className={`p-2 rounded-xl transition-all ${
                                              u.roles?.includes('admin') 
                                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                          }`}
                                          title={u.roles?.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                                      >
                                          <ShieldAlert size={16} />
                                      </button>

                                      <button 
                                          onClick={() => toggleOwner(u.uid, u.owner || false)}
                                          className={`p-2 rounded-xl transition-all ${
                                              u.owner 
                                              ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                          }`}
                                          title={u.owner ? 'Remove Owner' : 'Make Owner'}
                                      >
                                          <Crown size={16} />
                                      </button>

                                      <button 
                                          onClick={() => handleInspectUser(u)}
                                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                                      >
                                          <ChevronRight size={16} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          
          <div className="p-6 bg-slate-50/50 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredUsers.length} of {users.length} Users</p>
              <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 shadow-sm transition-all shadow-slate-100">Previous</button>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-900 shadow-sm transition-all hover:bg-slate-50">Next Page</button>
              </div>
          </div>
      </div>
    </div>
  );
}
