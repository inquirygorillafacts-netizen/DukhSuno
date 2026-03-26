// ─── Auth Store (Zustand) ─────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DukhSunoUser, Role } from '@/types';

interface AuthState {
  user: DukhSunoUser | null;
  activeRole: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: DukhSunoUser | null) => void;
  setActiveRole: (role: Role) => void;
  setLoading: (loading: boolean) => void;
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

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          activeRole: user?.activeRole || null,
          isLoading: false,
        }),

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
      name: 'dukhsuno-auth',
      partialize: (state) => ({
        activeRole: state.activeRole,
      }),
    }
  )
);
