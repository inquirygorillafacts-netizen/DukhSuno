// ─── Call Store (Zustand) ─────────────────────────
import { create } from 'zustand';
import { WebRTCHandler } from '@/lib/webrtc';

type CallState =
  | 'idle'
  | 'paying'
  | 'waiting'
  | 'ringing'
  | 'connecting'
  | 'active'
  | 'ended';

interface CallStoreState {
  callState: CallState;
  sessionId: string | null;
  listenerId: string | null;
  listenerName: string | null;
  listenerAvatar: string | null;
  handler: WebRTCHandler | null;
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeaker: boolean;
  isVideoUnlocked: boolean;
  sessionDuration: number;
  timerInterval: NodeJS.Timeout | null;
  incomingEmoji: string | null;

  startPayment: (listenerId: string, name: string, avatar: string) => void;
  setSessionId: (id: string) => void;
  setCallState: (state: CallState) => void;
  setHandler: (handler: WebRTCHandler | null) => void;
  setVideoUnlocked: (unlocked: boolean) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
  sendEmoji: (emoji: string) => void;
  setIncomingEmoji: (emoji: string | null) => void;
  startTimer: () => void;
  stopTimer: () => void;
  endCall: () => void;
  resetCall: () => void;
}

export const useCallStore = create<CallStoreState>((set, get) => ({
  callState: 'idle',
  sessionId: null,
  listenerId: null,
  listenerName: null,
  listenerAvatar: null,
  handler: null,
  isMuted: false,
  isCameraOn: false,
  isSpeaker: false,
  isVideoUnlocked: false,
  sessionDuration: 0,
  timerInterval: null,
  incomingEmoji: null,

  startPayment: (listenerId, name, avatar) =>
    set({
      callState: 'paying',
      listenerId,
      listenerName: name,
      listenerAvatar: avatar,
    }),

  setSessionId: (id) => set({ sessionId: id }),

  setCallState: (state) => set({ callState: state }),

  setHandler: (handler) => set({ handler }),

  setVideoUnlocked: (unlocked) => set({ isVideoUnlocked: unlocked }),

  toggleMute: () => {
    const { handler, isMuted } = get();
    if (handler) {
      handler.localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // flip it
      });
    }
    set({ isMuted: !isMuted });
  },

  toggleCamera: () => {
    const { handler, isCameraOn } = get();
    if (handler) {
      handler.localStream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOn; // flip it
      });
    }
    set({ isCameraOn: !isCameraOn });
  },

  toggleSpeaker: () => set((s) => ({ isSpeaker: !s.isSpeaker })),

  sendEmoji: (emoji) => {
    const { handler } = get();
    if (handler?.dataChannel?.readyState === 'open') {
      handler.dataChannel.send(JSON.stringify({ type: 'emoji', value: emoji }));
    }
  },

  setIncomingEmoji: (emoji) => set({ incomingEmoji: emoji }),

  startTimer: () => {
    if (get().timerInterval) return;
    const interval = setInterval(() => {
      set((s) => ({ sessionDuration: s.sessionDuration + 1 }));
    }, 1000);
    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({ timerInterval: null });
  },

  endCall: () => {
    const { timerInterval, handler } = get();
    if (timerInterval) clearInterval(timerInterval);
    if (handler) {
      handler.localStream.getTracks().forEach((s) => s.stop());
      handler.pc.close();
    }
    set({
      callState: 'ended',
      timerInterval: null,
      handler: null,
    });
  },

  resetCall: () => {
    const { timerInterval, handler } = get();
    if (timerInterval) clearInterval(timerInterval);
    if (handler) {
      handler.localStream.getTracks().forEach((s) => s.stop());
      handler.pc.close();
    }
    set({
      callState: 'idle',
      sessionId: null,
      listenerId: null,
      listenerName: null,
      listenerAvatar: null,
      handler: null,
      isMuted: false,
      isCameraOn: false,
      isSpeaker: false,
      isVideoUnlocked: false,
      sessionDuration: 0,
      timerInterval: null,
      incomingEmoji: null,
    });
  },
}));

// ─── Helper to format seconds → HH:MM:SS ───
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
