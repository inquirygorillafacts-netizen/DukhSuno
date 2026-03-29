'use client';

import React, { useRef } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  QrCode, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface PremiumShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function PremiumShareSheet({ isOpen, onClose, user }: PremiumShareSheetProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${user?.uid}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.displayName} - Expert on BigSuno`,
          text: `Consult with me professionally on BigSuno. Check out my profile!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard! ✓');
    }
  };

  const handleDownloadPoster = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions for a premium social media post (1080x1350 - Portrait)
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient (Indigo/Slate)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc'); // slate-50
    gradient.addColorStop(1, '#eef2ff'); // indigo-50
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Shapes
    ctx.fillStyle = 'rgba(79, 70, 229, 0.03)'; // indigo-600 with low opacity
    ctx.beginPath();
    ctx.arc(width, height, 600, 0, Math.PI * 2);
    ctx.fill();

    // 3. Main Card Container
    const cardMargin = 80;
    const cardWidth = width - cardMargin * 2;
    const cardHeight = height - cardMargin * 2;
    
    // Shadow for card
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 100;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 40;
    
    ctx.fillStyle = '#ffffff';
    // Rounded Rect for Main Card
    const r = 80;
    ctx.beginPath();
    ctx.moveTo(cardMargin + r, cardMargin);
    ctx.lineTo(cardMargin + cardWidth - r, cardMargin);
    ctx.quadraticCurveTo(cardMargin + cardWidth, cardMargin, cardMargin + cardWidth, cardMargin + r);
    ctx.lineTo(cardMargin + cardWidth, cardMargin + cardHeight - r);
    ctx.quadraticCurveTo(cardMargin + cardWidth, cardMargin + cardHeight, cardMargin + cardWidth - r, cardMargin + cardHeight);
    ctx.lineTo(cardMargin + r, cardMargin + cardHeight);
    ctx.quadraticCurveTo(cardMargin, cardMargin + cardHeight, cardMargin, cardMargin + cardHeight - r);
    ctx.lineTo(cardMargin, cardMargin + r);
    ctx.quadraticCurveTo(cardMargin, cardMargin, cardMargin + r, cardMargin);
    ctx.closePath();
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 4. Content - Branding (Top)
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = '900 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BIGSUNO', width / 2, 220);
    
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('PROFESSIONAL CONSULTING', width / 2, 260);

    // 5. User Profile (Middle Top)
    // Draw Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 84px Inter, sans-serif';
    ctx.fillText(user?.displayName || 'Expert Consultant', width / 2, 450);

    // Headline
    ctx.fillStyle = '#4f46e9'; // indigo-600
    ctx.font = 'italic 700 36px Inter, sans-serif';
    ctx.fillText(user?.headline || 'Expert Provider', width / 2, 510);

    // Verified Badge
    if (user?.isVerified) {
       ctx.fillStyle = '#10b981'; // emerald-500
       ctx.font = 'black 24px Inter, sans-serif';
       ctx.fillText('✓ VERIFIED EXPERT', width / 2, 560);
    }

    // 6. The QR Code (Large Center)
    const qrSize = 450;
    const qrX = (width - qrSize) / 2;
    const qrY = 650;
    
    // QR Background Box
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

    // Draw QR from the hidden canvas
    if (qrRef.current) {
      ctx.drawImage(qrRef.current, qrX, qrY, qrSize, qrSize);
    }

    // 7. Call To Action (Bottom)
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillText('SCAN TO CONSULT', width / 2, 1180);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(shareUrl.replace('https://', ''), width / 2, 1220);

    // 8. Trigger Download
    const link = document.createElement('a');
    link.download = `BigSuno_Share_${user?.displayName?.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-t-[3rem] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-10 duration-500 relative ring-1 ring-slate-100 shadow-2xl">
        
        {/* Progress Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full" />
        
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
          <X size={24} />
        </button>

        <div className="text-center space-y-2 pt-4">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 block mb-2">Professional Growth</span>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Expand Your Reach 🚀</h2>
           <p className="text-xs text-slate-400 font-medium italic">Share your professional profile and invite clients to consult.</p>
        </div>

        {/* Professional Card Display */}
        <div className="relative group max-w-sm mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-rose-500/10 rounded-[3rem] blur-2xl group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 space-y-8 text-center">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user?.displayName}</h3>
                   <div className="flex items-center justify-center gap-1.5 text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                      <Sparkles size={12} className="fill-current" /> Expert Provider
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl inline-block border border-slate-100">
                    <QRCodeCanvas 
                        id="qr-canvas"
                        ref={qrRef}
                        value={shareUrl}
                        size={200}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Scan to connect</p>
                   <p className="text-[10px] font-bold text-slate-400 tracking-tight">{shareUrl.replace('https://', '')}</p>
                </div>
            </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={handleNativeShare}
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 text-white transition-all active:scale-95 hover:shadow-2xl hover:shadow-indigo-900/40"
            >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Share2 size={24} />
                </div>
                <div className="text-center">
                   <p className="text-sm font-black uppercase tracking-widest">Share Link</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Direct profile url</p>
                </div>
            </button>

            <button 
              onClick={handleDownloadPoster}
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 text-indigo-900 transition-all active:scale-95 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                   <Download size={24} />
                </div>
                <div className="text-center">
                   <p className="text-sm font-black uppercase tracking-widest">Save Poster</p>
                   <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Premium Post Design</p>
                </div>
            </button>
        </div>

        <div className="text-center pt-2">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
              <ShieldCheck size={12} /> Securely Managed by BigSuno Enterprise
           </div>
        </div>
      </div>
    </div>
  );
}
