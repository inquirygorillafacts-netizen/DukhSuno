import { create } from 'zustand';

interface PWAState {
  deferredPrompt: any | null;
  isStandalone: boolean;
  isInstalled: boolean;
  
  setDeferredPrompt: (prompt: any | null) => void;
  setStandalone: (status: boolean) => void;
  setInstalled: (status: boolean) => void;
  clearPrompt: () => void;
}

export const usePWAStore = create<PWAState>((set) => ({
  deferredPrompt: null,
  isStandalone: false,
  isInstalled: false,
  
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  setStandalone: (status) => set({ isStandalone: status }),
  setInstalled: (status) => set({ isInstalled: status, deferredPrompt: null }),
  clearPrompt: () => set({ deferredPrompt: null }),
}));
