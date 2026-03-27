'use client';

import { useState, useRef, useEffect } from 'react';
import { useCallStore } from '@/stores/call-store';
import { useAuthStore } from '@/stores/auth-store';
import { Mic, MicOff, Volume2, PhoneOff, Video, VideoOff, Sparkles } from 'lucide-react';
import { FloatingEmojiLayer, EmojiToolbar } from './FloatingEmoji';
import { upgradeToVideo, setupUpgradeListener } from '@/lib/webrtc';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { syncPresence } from '@/lib/presence';

export function ActiveCallScreen({ 
  listener, 
  priceInfo, 
  sessionId,
  onEnd
}: { 
  listener: any, 
  priceInfo: any, 
  sessionId: string,
  onEnd?: () => void
}) {
  const { 
    sessionDuration, isMuted, isCameraOn, isSpeaker, isVideoUnlocked,
    toggleMute, toggleCamera, toggleSpeaker, endCall, handler,
    setVideoUnlocked, setCallState 
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Sync Video Streams
  useEffect(() => {
    if (handler) {
      if (localVideoRef.current) localVideoRef.current.srcObject = handler.localStream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = handler.remoteStream;
    }
  }, [handler, isVideoUnlocked]);

  // 0. Sync Presence and Authorization Check
  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (!user || (user.uid !== listener?.uid)) {
       // Note: Enhanced auth logic can be added here once session data is available
    }
    syncPresence();
  }, [listener, sessionId]);

  const formattedTime = `${Math.floor(sessionDuration / 60).toString().padStart(2, '0')}:${(sessionDuration % 60).toString().padStart(2, '0')}`;

  // Listen for Session Upgrades (Sync across peers)
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isVideoUnlocked && !isVideoUnlocked) {
          // Trigger WebRTC Upgrade if not already done
          if (handler) {
             const isCaller = useAuthStore.getState().activeRole === 'sunane_wala';
             await upgradeToVideo(sessionId, handler, isCaller);
             setupUpgradeListener(sessionId, handler, isCaller);
          }
          setVideoUnlocked(true);
        }
      }
    });
    return () => unsubscribe();
  }, [sessionId, isVideoUnlocked, handler]);

  const handleVideoUpgrade = async () => {
    if (!sessionId || !handler) return;

    try {
      const resp = await fetch('/api/sessions/upgrade-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId: useAuthStore.getState().user?.uid }),
      });
      const data = await resp.json();

      if (data.success) {
        // Unlock will be handled by the onSnapshot listener above
        console.log('Video upgrade payment success');
      } else if (data.method === 'payu') {
        alert(`Insufficient balance. Please add ₹${data.amountToPay} to upgrade.`);
        // Note: Real redirection logic would go here
      }
    } catch (err) {
      console.error('Video upgrade error:', err);
    }
  };

  const getAvatarDisplay = (url: string) => {
    if (url?.startsWith('emoji:')) return url.split(':')[1];
    if (url?.startsWith('avatar:')) return url.split(':')[1];
    return '👤';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between py-12 px-6 safe-top safe-bottom animate-fade-in relative">
      
      {/* Floating Emojis Overlay */}
      <FloatingEmojiLayer />

      {/* Video Background (if unlocked) */}
      {isVideoUnlocked && (
        <div className="absolute inset-0 bg-black z-0">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-24 right-6 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-surface">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Top Info */}
      <div className="text-center space-y-3 mt-6 z-10 animate-fade-in-down">
        <h2 className="text-[38px] font-black text-white tracking-tighter drop-shadow-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          {formattedTime}
        </h2>
        <div className="glass-container border-white/30 px-5 py-2 rounded-full inline-flex items-center gap-2 shadow-2xl shadow-black/10">
           <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
           <span className="text-white text-[14px] font-black tracking-tight">₹{priceInfo?.price} for {priceInfo?.minutes} min</span>
        </div>
      </div>

      {/* Center DP (Only show if video not active/remote not sending) */}
      {!isVideoUnlocked && (
        <div className="relative mt-12 mb-auto z-10 w-48 h-48 animate-fade-in">
          <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse-soft blur-3xl" />
          <div className="relative w-full h-full rounded-full glass-container border-white/40 flex items-center justify-center text-8xl shadow-2xl overflow-hidden">
            {getAvatarDisplay(listener?.avatarUrl)}
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl glass-container border-white/40 shadow-2xl">
            <h3 className="text-[18px] font-black text-white whitespace-nowrap tracking-tight">{listener?.displayName || 'Listener'}</h3>
          </div>
        </div>
      )}

      {/* Middle: Emoji Toolbar & Video Upgrade */}
      <div className="flex flex-col items-center gap-6 z-10 w-full mb-8">
        <EmojiToolbar />

        {!isVideoUnlocked && (
          <button 
            onClick={handleVideoUpgrade}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl btn-primary text-white font-black shadow-2xl shadow-accent/40 hover:scale-[1.05] active:scale-95 transition-all"
          >
            <Sparkles size={20} className="animate-spin-slow" />
            Upgrade to Video call (₹{(priceInfo?.price || 0) * 0.5})
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-[340px] grid grid-cols-4 gap-4 mb-8 z-10 px-4">
        <button onClick={toggleMute} className="flex flex-col items-center gap-2.5 group">
          <div className={`w-15 h-15 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-white text-accent animate-pulse' : 'glass-container border-white/40 text-white hover:bg-white/20'}`}>
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </div>
          <span className="text-[11px] text-white/70 font-black uppercase tracking-widest">Mute</span>
        </button>

        {isVideoUnlocked && (
          <button onClick={toggleCamera} className="flex flex-col items-center gap-2.5 group">
            <div className={`w-15 h-15 rounded-2xl flex items-center justify-center transition-all ${!isCameraOn ? 'bg-white text-accent animate-pulse' : 'glass-container border-white/40 text-white hover:bg-white/20'}`}>
              {!isCameraOn ? <VideoOff size={28} /> : <Video size={28} />}
            </div>
            <span className="text-[11px] text-white/70 font-black uppercase tracking-widest">Cam</span>
          </button>
        )}

        <button onClick={toggleSpeaker} className="flex flex-col items-center gap-2.5 group">
          <div className={`w-15 h-15 rounded-2xl flex items-center justify-center transition-all ${isSpeaker ? 'bg-white text-accent' : 'glass-container border-white/40 text-white hover:bg-white/20'}`}>
            <Volume2 size={28} />
          </div>
          <span className="text-[11px] text-white/70 font-black uppercase tracking-widest">Audio</span>
        </button>

        <button onClick={onEnd || endCall} className="flex flex-col items-center gap-2.5 group transform active:scale-90 transition-all">
          <div className="w-15 h-15 rounded-2xl bg-error flex items-center justify-center text-white shadow-2xl shadow-error/40 hover:bg-error/80">
            <PhoneOff size={28} strokeWidth={2.5} />
          </div>
          <span className="text-[11px] text-white/70 font-black uppercase tracking-widest">End</span>
        </button>
      </div>
    </div>
  );
}
