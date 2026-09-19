'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { api } from '@/lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      hasHydrated: false,
      setAuth: (user, token) => set({ user, token }),
      setToken: (token) => set({ token }),
      logout: async () => {
        try {
          const token = get().token;
          if (token) {
            await api.post('/auth/logout', {}, { token });
          }
        } catch {
          // ignore
        }
        set({ user: null, token: null });
      },
      fetchMe: async () => {
        const token = get().token;
        if (!token) return;
        set({ isLoading: true });
        try {
          const res = await api.get<{ data: User }>('/auth/me', { token });
          set({ user: res.data, isLoading: false });
        } catch {
          set({ user: null, token: null, isLoading: false });
        }
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'glowteva-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);
