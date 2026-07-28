// apps/web/src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, AuthError, AuthStatus } from '../types/auth';
import { stripSensitiveData } from '../lib/tokenSecurity';

interface AuthStoreState {
  status: AuthStatus;
  user: UserProfile | null;
  error: AuthError | null;

  setLoading: () => void;
  setAuthenticated: (user: UserProfile) => void;
  setUnauthenticated: () => void;
  setError: (error: AuthError) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as AuthStatus,
  user: null as UserProfile | null,
  error: null as AuthError | null,
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setLoading: () => set({ status: 'loading', error: null }),

      setAuthenticated: (user: UserProfile) =>
        set({ status: 'authenticated', user, error: null }),

      setUnauthenticated: () =>
        set({ status: 'unauthenticated', user: null, error: null }),

      setError: (error: AuthError) =>
        set({ status: 'error', error }),

      updateUser: (partial: Partial<UserProfile>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      clearError: () => set({ error: null }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'wi-lo-auth',
      // Ne persister que status et user (pas error, pas les actions)
      partialize: (state) => {
        const safe = stripSensitiveData({
          status: state.status,
          user: state.user,
        } as Record<string, unknown>);
        return {
          status: (safe.status as AuthStatus) ?? 'idle',
          user: (safe.user as UserProfile | null) ?? null,
        };
      },
      // Utiliser createJSONStorage pour un typage correct
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);