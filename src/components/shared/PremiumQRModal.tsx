'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  User, 
  Heart, 
  ShieldCheck,
  Camera,
  QrCode
} from 'lucide-react';

interface PremiumQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function PremiumQRModal({ isOpen, onClose, user }: PremiumQRModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bigsuno.app';
  const shareUrl = `${baseUrl}/p/${user?.uid}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPoster = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    // Create a larger canvas for the "Poster" (Social Media Ratio 9:16)
    const posterCanvas = document.createElement('canvas');
    const ctx = posterCanvas.getContext('2d');
    if (!ctx) return;

    posterCanvas.width = 1080;
    posterCanvas.height = 1920;

    // Background Gradient (Deep Blue to White)
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#0f172a'); // slate-900
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative Shapes
    ctx.fillStyle = '#ff4d6d';
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(1080, 0, 600, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // BigSuno Branding
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath();
    ctx.roundRect(440, 150, 200, 200, 50);
    ctx.fill();
    
    // Icon (Simplified for canvas)
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('❤️', 540, 290);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 100px Arial';
    ctx.fillText('BigSuno', 540, 480);
    
    ctx.fillStyle = '#ff4d6d';
    ctx.font = 'italic bold 50px Arial';
    ctx.fillText('Dil ki baat kahein, sukoon paayein.', 540, 560);

    // Tagline
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 35px Arial';
    ctx.letterSpacing = '10px';
    ctx.fillText('SAFE • ANONYMOUS • SECURE', 540, 640);

    // QR Container Card
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.roundRect(140, 750, 800, 950, 100);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw the actual QR code (centered in card)
    ctx.drawImage(canvas, 190, 850, 700, 700);

    // User Info on Poster
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 45px Arial';
    ctx.fillText(`Scan to talk to ${user?.displayName || 'Anonymous'}`, 540, 1620);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '500 30px Arial';
    ctx.fillText('Available only on BigSuno Web App', 540, 1680);

    // Browser/Footer
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('www.bigsuno.app', 540, 1850);

    const link = document.createElement('a');
    link.download = `BigSuno_Poster_${user?.displayName || 'Consultant'}.png`;
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />
          
          {/* Premium Card */}
          <motion.div 
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative z-10 shadow-2xl border border-slate-100 flex flex-col"
          >
            {/* Top Branding Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-rose-400 via-[#ff4d6d] to-indigo-400" />

            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors z-20"
            >
                <X size={20} />
            </button>

            <div className="p-8 md:p-10 space-y-8">
              {/* Header: User Profile Info */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                     {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400">
                             <User size={32} />
                         </div>
                     )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white border-2 border-white shadow-sm">
                      <ShieldCheck size={12} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black text-slate-900 truncate tracking-tight uppercase">
                    {user?.displayName || 'BigSuno Consultant'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                      <Sparkles size={12} className="text-[#ff4d6d]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safe & Anonymous</span>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="relative group">
                  <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center justify-center space-y-6 shadow-inner transition-all hover:bg-slate-50">
                      <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-white">
                          <QRCodeCanvas 
                            value={shareUrl} 
                            size={180} 
                            level="H"
                            includeMargin={false}
                            fgColor="#0f172a"
                            imageSettings={{
                                src: "/favicon.png", 
                                x: undefined, y: undefined, height: 36, width: 36, excavate: true,
                            }}
                          />
                      </div>
                      
                      <div className="text-center space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Scan to connect directly</p>
                          <div className="flex items-center justify-center gap-2 text-slate-200">
                             <div className="h-px w-6 bg-current" />
                             <QrCode size={14} />
                             <div className="h-px w-6 bg-current" />
                          </div>
                      </div>
                  </div>
              </div>

              {/* URL & Quick Copy */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between group hover:border-[#ff4d6d]/30 transition-all">
                  <div className="flex flex-col flex-1 min-w-0 mr-4">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Your Profile Link</span>
                      <span className="text-[10px] font-bold text-slate-900 truncate">bigsuno.app/p/{user?.uid}</span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        copied ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                  <button 
                     onClick={downloadPoster}
                     className="flex-1 h-16 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-black active:scale-95 transition-all"
                  >
                     <Download size={20} /> Download Poster
                  </button>
                  <button 
                     onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: user?.displayName, url: shareUrl });
                        } else {
                            handleCopy();
                        }
                     }}
                     className="w-16 h-16 bg-white border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95"
                  >
                     <Share2 size={24} />
                  </button>
              </div>

              {/* Footer Trust */}
              <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-300">
                 <Heart size={10} className="text-[#ff4d6d]/40" />
                 <span>Consultation is 100% private</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
