'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { uploadToImgBB } from '@/lib/imgbb';
import { Plus, Trash2, Upload, Filter, Heart, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Avatar {
  id: string;
  url: string;
  category: 'boy' | 'girl' | 'baby';
  createdAt: any;
}

export default function AdminAvatars() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState<'boy' | 'girl' | 'baby'>('boy');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'avatars'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Avatar));
      setAvatars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(true);
      setLoading(false);
    }
  };

  const handleUploadClick = async () => {
    if (!previewUrl) return;
    
    // We need to store the File object to upload it later
    // Let's update handleSelect to store the actual File.
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    (window as any)._pendingFile = file; // Simple store for the actual file
  };

  const handleConfirmUpload = async () => {
    const file = (window as any)._pendingFile;
    if (!file) return;
    
    setUploadLoading(true);
    try {
      const url = await uploadToImgBB(file);
      await addDoc(collection(db, 'avatars'), {
        url,
        category,
        createdAt: serverTimestamp(),
      });
      fetchAvatars();
      setPreviewUrl(null);
      (window as any)._pendingFile = null;
    } catch (err) {
      alert('Upload failed: ' + err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'avatars', id));
      fetchAvatars();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcff] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link href="/provider/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-accent transition-colors text-xs font-black uppercase tracking-widest mb-4">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Avatar <span className="text-accent italic font-serif">Management</span></h1>
            <p className="text-slate-400 font-medium">Add or remove predefined avatars for user onboarding.</p>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
             {(['boy', 'girl', 'baby'] as const).map(cat => (
               <button
                 key={cat}
                 onClick={() => setCategory(cat)}
                 className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                   category === cat ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-slate-400 hover:bg-slate-50'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
          className={`relative group p-12 rounded-[2rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-6 min-h-[300px] overflow-hidden ${
            dragActive ? 'border-accent bg-accent/5' : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          {!previewUrl && (
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          )}
          
          {previewUrl ? (
            <div className="flex flex-col items-center gap-6 animate-scale-up">
               <img src={previewUrl} className="w-48 h-48 rounded-[2rem] object-cover border-4 border-accent shadow-2xl" />
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setPreviewUrl(null); (window as any)._pendingFile = null; }}
                    disabled={uploadLoading}
                    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-400 font-black uppercase text-[11px] hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmUpload}
                    disabled={uploadLoading}
                    className="px-8 py-3 rounded-xl bg-accent text-white font-black uppercase text-[11px] shadow-lg shadow-accent/20 flex items-center gap-2"
                  >
                    {uploadLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
                    {uploadLoading ? 'Uploading...' : 'Confirm & Save Avatar'}
                  </button>
               </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-accent/10 rounded-[1.5rem] flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-500">
                <ImageIcon size={40} />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">Drag & Drop Avatar Image</p>
                <p className="text-slate-400 font-medium">Will be added as <span className="text-accent font-bold uppercase">{category}</span></p>
              </div>
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['boy', 'girl', 'baby'] as const).map(cat => (
            <div key={cat} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}s</p>
                  <p className="text-2xl font-black text-slate-900">{avatars.filter(a => a.category === cat).length}</p>
               </div>
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat === 'boy' ? 'bg-blue-50 text-blue-500' : cat === 'girl' ? 'bg-pink-50 text-pink-500' : 'bg-amber-50 text-amber-500'}`}>
                  <Heart size={20} fill="currentColor" />
               </div>
            </div>
          ))}
        </div>

        {/* Grid Area */}
        <div className="space-y-6">
           <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Filter size={20} className="text-slate-400" />
             Existing Inventory
           </h3>
           
           {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />)}
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {avatars.map((av) => (
                 <div key={av.id} className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
                   <img src={av.url} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">{av.category}</span>
                      <button 
                        onClick={() => handleDelete(av.id)}
                        className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

