'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  QrCode,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function uploadToImgBB(file: File): Promise<string> {
   const formData = new FormData();
   formData.append('image', file);
   const res = await fetch('/api/upload-qr', {
      method: 'POST',
      body: formData,
   });
   const data = await res.json();
   if (data.url) return data.url;
   throw new Error(data.error || 'Upload failed');
}

export default function PaymentSettingsPage() {
   const { user } = useAuthStore();
   const router = useRouter();

   const [qrFile, setQrFile] = useState<File | null>(null);
   const [qrPreview, setQrPreview] = useState<string | null>(null);
   const [uploading, setUploading] = useState(false);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);
   const [success, setSuccess] = useState(false);

   const handleQrUpload = async () => {
       if (!qrFile || !user) return;
       setUploading(true);
       setErrorMsg(null);
       try {
          const url = await uploadToImgBB(qrFile);
          await updateDoc(doc(db, 'users', user.uid), { 
             paymentQrUrl: url 
          });
          setSuccess(true);
          setQrFile(null);
          setQrPreview(null);
          // Optional: clear success after 3 seconds
          setTimeout(() => setSuccess(false), 3000);
       } catch (err: any) {
          setErrorMsg(err.message || 'QR upload failed. Please try again.');
       } finally {
          setUploading(false);
       }
   };

   return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2 pb-24 px-4 pt-4">
         
         {/* Back Button & Header */}
         <div className="flex items-center gap-4">
            <button 
               onClick={() => router.back()} 
               className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Payment QR Setup</h1>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Manage your UPI payout details</p>
            </div>
         </div>

         {/* Current QR Card */}
         <div className="glass bg-white p-6 md:p-8 rounded-[2rem] border border-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
               <div className="w-48 h-48 md:w-56 md:h-56 bg-slate-50 rounded-[2rem] border-2 border-slate-100 border-dashed flex flex-col items-center justify-center relative overflow-hidden group/qr">
                  {user?.paymentQrUrl ? (
                     <img 
                        src={user.paymentQrUrl} 
                        alt="Current UPI QR" 
                        className="w-full h-full object-contain p-4 group-hover/qr:scale-105 transition-transform"
                     />
                  ) : (
                     <div className="text-center p-6">
                        <QrCode className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No QR Uploaded Yet</p>
                     </div>
                  )}
               </div>

               <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                     <h3 className="text-lg font-black text-slate-900 tracking-tighter">Your UPI QR Code</h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                        This QR code will be used by administrators to send your earnings directly to your UPI/Bank.
                     </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                     <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100">
                        <ShieldCheck size={12} fill="currentColor" className="text-emerald-500/20" /> 100% Secure
                     </div>
                     <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-indigo-100">
                        <Zap size={12} fill="currentColor" className="text-indigo-400/20" /> Direct Payouts
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Edit/Upload Section */}
         <div className="space-y-4 pt-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Update QR Code</h3>
            
            <div className="glass bg-white p-6 md:p-10 rounded-[2.5rem] border border-white shadow-sm space-y-8">
               <div 
                  className={`w-full aspect-square md:aspect-video rounded-[2rem] bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-2xl transition-all cursor-pointer ${qrPreview ? 'border-emerald-200' : 'border-slate-200'}`}
               >
                  {qrPreview ? (
                     <>
                        <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain p-8" />
                        <button 
                           onClick={(e) => { e.stopPropagation(); setQrFile(null); setQrPreview(null); }}
                           className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md text-slate-400 rounded-full flex items-center justify-center hover:bg-white hover:text-rose-500 shadow-xl transition-all"
                        >
                           <X size={20} />
                        </button>
                     </>
                  ) : (
                     <div className="text-center group-hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                           <Upload size={32} />
                        </div>
                        <span className="text-[11px] uppercase font-black tracking-widest text-slate-400">Tap to select Image</span>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-2 px-6 leading-relaxed">Accepted: PhonePe, GPay, Paytm QR screenshots</p>
                     </div>
                  )}
                  <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                           setQrFile(file);
                           setQrPreview(URL.createObjectURL(file));
                           setErrorMsg(null);
                        }
                     }}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                  />
               </div>

               {errorMsg && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                     <AlertCircle className="text-rose-500 shrink-0" size={18} />
                     <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">{errorMsg}</p>
                  </div>
               )}

               {success && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                     <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">QR Code Updated Successfully! ✨</p>
                  </div>
               )}

               <button
                  onClick={handleQrUpload}
                  disabled={uploading || !qrFile}
                  className={`w-full h-16 rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 transition-all ${
                     uploading || !qrFile 
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-slate-900 text-white shadow-slate-900/20 active:scale-95 hover:scale-[1.02]'
                  }`}
               >
                  {uploading ? (
                     <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <>
                        Confirm and Save
                        <ArrowRight size={18} />
                     </>
                  )}
               </button>
            </div>
         </div>

         <div className="text-center px-6">
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
               <ShieldCheck size={10} className="inline mr-1 text-emerald-500" />
               Note: Once uploaded, it may take 24-48 hours for our team to verify your payout details for high-volume accounts.
            </p>
         </div>
      </div>
   );
}
