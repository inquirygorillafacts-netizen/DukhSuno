// ─── Auth Store (Zustand) ─────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BigSunoUser, Role } from '@/types';

interface AuthState {
  user: BigSunoUser | null;
  activeRole: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showTour: boolean;

  setUser: (user: BigSunoUser | null) => void;
  setActiveRole: (role: Role) => void;
  setLoading: (loading: boolean) => void;
  setShowTour: (show: boolean) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  hasDualRole: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeRole: null,
      isLoading: true,
      isAuthenticated: false,
      showTour: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          activeRole: user?.activeRole || null,
          isLoading: false,
        }),
      
      setShowTour: (show) => set({ showTour: show }),

      setActiveRole: (role) =>
        set((state) => ({
          activeRole: role,
          user: state.user ? { ...state.user, activeRole: role } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          activeRole: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) || false;
      },

      hasDualRole: () => {
        const { user } = get();
        return (user?.roles?.length || 0) >= 2;
      },
    }),
    {
      name: 'bigsuno-auth',
      partialize: (state) => ({
        activeRole: state.activeRole,
      }),
    }
  )
);
