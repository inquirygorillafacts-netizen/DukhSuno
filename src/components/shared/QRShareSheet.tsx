'use client';

import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2, X, Heart, Sparkles, Copy, Check, MessageCircle, Camera, Send } from 'lucide-react';

interface QRShareSheetProps {
  user: any;
  onClose: () => void;
}

export default function QRShareSheet({ user, onClose }: QRShareSheetProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isListener = user?.roles?.includes('provider');
  
  // Clean URL formation
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bigsuno.app';
  const shareUrl = isListener 
    ? `${baseUrl}/p/${user?.uid}`
    : `${baseUrl}/seeker/home?id=${user?.uid || 'guest'}`;

  const downloadQR = () => {
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
    
    // Heart Emoji (Branding icon)
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

    // Draw the actual QR code
    ctx.drawImage(canvas, 190, 850, 700, 700);

    // QR Label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 45px Arial';
    ctx.fillText(`Scan to talk to ${user?.displayName || 'Anonymous'}`, 540, 1620);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '500 30px Arial';
    ctx.fillText('Available only on BigSuno v3.0 Web App', 540, 1680);

    // Browser/Footer
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('www.bigsuno.app', 540, 1850);

    const link = document.createElement('a');
    link.download = `BigSuno_QR_${user?.displayName || 'Poster'}.png`;
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareSocial = (platform: string) => {
    const text = 'BigSuno par mujhse baat karein! Dil ki baat kahein, sukoon paayein. ❤️';
    let url = '';
    
    switch(platform) {
      case 'whatsapp': url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`; break;
      case 'telegram': url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`; break;
      case 'twitter': url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`; break;
    }
    
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-500 md:p-4">
      <div className="w-full max-w-[480px] bg-white rounded-t-[3rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-5 md:slide-in-from-bottom-2 duration-500">
        
        {/* Banner Decoration */}
        <div className="h-2 bg-gradient-to-r from-rose-400 via-[#ff4d6d] to-indigo-400" />

        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-1">Spread the Love</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Share Profile ✨</h3>
           </div>
           <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-90 transition-all">
              <X size={24} />
           </button>
        </div>

        {/* Body */}
        <div className="p-8 pt-4 space-y-8">
           
           {/* QR Showcase Card */}
           <div className="relative group p-6 md:p-10 rounded-[3rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
              <div className="absolute top-6 right-6 flex gap-1">
                 <Sparkles className="text-rose-400 animate-pulse" size={24} />
              </div>

              <div className="bg-white p-3 rounded-[2.5rem] shadow-inner mb-6 border border-slate-50">
                 <QRCodeCanvas 
                    value={shareUrl} 
                    size={200} 
                    level="H"
                    includeMargin={false}
                    fgColor="#0f172a"
                    imageSettings={{
                       src: "/favicon.png", 
                       x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                    }}
                 />
              </div>

              <div className="text-center">
                 <h4 className="text-[15px] font-black text-slate-900 tracking-tight leading-none mb-2 italic">SCAN TO CONNECT</h4>
                 <div className="flex items-center justify-center gap-3">
                    <div className="h-[2px] w-8 bg-slate-100" />
                    <Heart size={14} className="text-[#ff4d6d] fill-current" />
                    <div className="h-[2px] w-8 bg-slate-100" />
                 </div>
              </div>
           </div>

           {/* Quick Actions Grid */}
           <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                 <Share2 size={14} className="text-slate-400" />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Jump To Social</span>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                 <SocialBtn icon={<MessageCircle size={22} />} label="WA" color="bg-emerald-500" onClick={() => shareSocial('whatsapp')} />
                 <SocialBtn icon={<Send size={22} />} label="TG" color="bg-sky-500" onClick={() => shareSocial('telegram')} />
                 <SocialBtn icon={<Camera size={22} />} label="IG" color="bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600" onClick={() => alert('Copy link and share on Instagram Story! 📸')} />
                 <SocialBtn 
                    icon={copied ? <Check size={22} /> : <Copy size={22} />} 
                    label="Copy" 
                    color={copied ? "bg-emerald-500" : "bg-slate-900"} 
                    onClick={copyToClipboard} 
                 />
              </div>
           </div>

           {/* Main CTA */}
           <button 
              onClick={downloadQR}
              className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black text-[17px] shadow-2xl shadow-slate-200/80 flex items-center justify-center gap-4 transition-all active:scale-95 group hover:bg-[#ff4d6d]"
           >
              <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
              <span className="uppercase tracking-widest">Download Full Poster</span>
           </button>
        </div>

        {/* Footer Info */}
        <div className="px-10 pb-10">
           <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest leading-loose italic">
              Create stories, posts, or print this QR.<br />
              Secure consultation on 100% BigSuno trust.
           </p>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ icon, label, color, onClick }: any) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onClick}>
       <div className={`w-14 h-14 md:w-16 md:h-16 ${color} text-white rounded-2xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all group-hover:-translate-y-1 group-active:scale-90`}>
          {icon}
       </div>
       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
    </div>
  );
}

