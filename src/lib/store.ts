'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DemoAccount } from './types';

interface AuthStore {
  currentUser: DemoAccount | null;
  isAuthenticated: boolean;
  login: (account: DemoAccount) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (account: DemoAccount) => set({ currentUser: account, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    { name: 'smart-mirror-auth' }
  )
);
