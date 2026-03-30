'use client';

import { useState, useEffect } from 'react';
import { PhoneOff } from 'lucide-react';
import { useCallStore } from '@/stores/call-store';

export function CallingScreen({ listener }: { listener: any }) {
  const { endCall } = useCallStore();

  useEffect(() => {
    // Only play Ringtone if this is an incoming call (we are the provider)
    const isIncoming = listener?.displayName === 'Seeker';
    
    let audio: HTMLAudioElement | null = null;
    if (isIncoming) {
      audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(e => console.log('Audio autoplay blocked or failed:', e));
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [listener]);

  const getAvatarDisplay = (url: string) => {
    if (url?.startsWith('emoji:')) return url.split(':')[1];
    if (url?.startsWith('avatar:')) return url.split(':')[1];
    return '👤';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 safe-top safe-bottom animate-fade-in relative overflow-hidden">
      
      {/* Background Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/10 animate-ping opacity-50" style={{ animationDuration: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5 animate-ping opacity-30" style={{ animationDuration: '2.5s' }} />

      <div className="text-center space-y-4 z-10">
        <h2 className="text-[32px] font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {listener?.displayName === 'Seeker' ? (
            <>Naya Seeker ki<br/>call aa rahi hai... ✨</>
          ) : (
            <>{listener?.displayName || 'Expert'} ko<br/>call jaa rahi hai... ✨</>
          )}
        </h2>
        <p className="text-white/60 text-[16px] font-medium italic">
          {listener?.displayName === 'Seeker' ? 'Kripya call pick karein' : 'Kripya thoda intezaar karein'}
        </p>
      </div>

      <div className="relative mt-16 mb-24 z-10 w-40 h-40">
        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-soft blur-2xl" />
        <div className="w-full h-full rounded-full glass-container border-white/40 flex items-center justify-center text-8xl shadow-2xl">
          {getAvatarDisplay(listener?.avatarUrl)}
        </div>
      </div>

      <button onClick={endCall} className="mt-auto mb-12 flex flex-col items-center gap-3 group z-10 active:scale-90 transition-all">
        <div className="w-18 h-18 rounded-full bg-error flex items-center justify-center text-white shadow-2xl shadow-error/40 group-hover:bg-error/80">
          <PhoneOff size={32} strokeWidth={2.5} />
        </div>
        <span className="text-[14px] text-white/80 font-black uppercase tracking-[0.2em]">Cut Karo</span>
      </button>
    </div>
  );
}
