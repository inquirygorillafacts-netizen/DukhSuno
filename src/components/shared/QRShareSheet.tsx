'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2, X, Heart, Sparkles } from 'lucide-react';

interface QRShareSheetProps {
  user: any;
  onClose: () => void;
}

export default function QRShareSheet({ user, onClose }: QRShareSheetProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isListener = user?.roles?.includes('sunne_wala');
  const shareUrl = isListener 
    ? `${window.location.origin}/p/${user?.uid}`
    : `${window.location.origin}/sunane/home?ref=${user?.uid || 'guest'}`;

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    // Create a larger canvas for the "Poster"
    const posterCanvas = document.createElement('canvas');
    const ctx = posterCanvas.getContext('2d');
    if (!ctx) return;

    posterCanvas.width = 1080;
    posterCanvas.height = 1920;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#fff5f7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // BigSuno Branding
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath();
    ctx.roundRect(440, 150, 200, 200, 40);
    ctx.fill();
    
    // Simple Heart Icon Drawing (Fallback for Lucide in Canvas)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('❤️', 540, 290);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 100px Arial';
    ctx.fillText('BigSuno', 540, 480);
    
    ctx.fillStyle = '#ff4d6d';
    ctx.font = 'italic bold 50px Arial';
    ctx.fillText('Dil ki baat kahein, sukoon paayein.', 540, 560);

    // User Details
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('PEHCHAAN GUUPT, BAATEIN DIL KI', 540, 650);

    // QR Border
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(140, 750, 800, 800, 80);
    ctx.stroke();

    // Draw the actual QR code from the rendered component's canvas
    ctx.drawImage(canvas, 190, 800, 700, 700);

    // Footer
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 45px Arial';
    ctx.fillText(`Kone-kone se judiye, mere saath baatein kariye!`, 540, 1650);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 35px Arial';
    ctx.fillText('Scan to connect on BigSuno', 540, 1720);

    const link = document.createElement('a');
    link.download = `BigSuno_QR_${user?.displayName || 'Shared'}.png`;
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BigSuno - Connect with me!',
          text: 'Dil ki baat kahein, sukoon paayein. Mujhse baat karne ke liye scan karein!',
          url: shareUrl
        });
      } catch (err) {
        console.error('Sharing failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard! 📋');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-xl transition-all duration-500 p-4">
      <div className="w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ff4d6d] rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
                <Heart className="text-white fill-current animate-pulse" size={16} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Aapka QR ✨</h3>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all">
              <X size={20} />
           </button>
        </div>

        {/* Poster Content Preview */}
        <div className="p-8 flex flex-col items-center gap-8 bg-gradient-to-b from-white to-slate-50">
           <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">SAFE & ANONYMOUS</p>
              <h4 className="text-[20px] font-black text-slate-900 leading-tight">Doston ko invite karein! 🫂</h4>
              <p className="text-[12px] text-slate-400 font-medium italic">Is QR ko share karein taki log aapse sidhe jud saken.</p>
           </div>

           {/* Branded QR Box */}
           <div ref={canvasRef} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl relative group">
              <Sparkles className="absolute -top-4 -right-4 text-rose-400 animate-pulse" size={32} />
              <div className="p-2 border-4 border-rose-50 rounded-[2rem]">
                 <QRCodeCanvas 
                    value={shareUrl} 
                    size={220} 
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                       src: "/favicon.ico", // Or app logo
                       x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                    }}
                 />
              </div>
              <div className="mt-6 text-center space-y-1">
                 <p className="text-xs font-black text-slate-900 uppercase tracking-tighter italic">BigSuno Premium QR</p>
                 <div className="flex items-center justify-center gap-2">
                    <div className="h-1 w-6 bg-rose-200 rounded-full" />
                    <Heart size={10} className="text-rose-400 fill-current" />
                    <div className="h-1 w-6 bg-rose-200 rounded-full" />
                 </div>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="p-8 flex gap-4">
           <button 
              onClick={downloadQR}
              className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black text-[13px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all group hover:bg-rose-500"
           >
              <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
              <span className="uppercase tracking-widest">Download PNG</span>
           </button>

           <button 
              onClick={handleShare}
              className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all shadow-sm"
           >
              <Share2 size={24} />
           </button>
        </div>

        <div className="px-8 pb-8">
           <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
              Scan this QR to connect directly with {user?.displayName || 'Friend'}
           </p>
        </div>
      </div>
    </div>
  );
}
