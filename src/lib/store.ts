'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DemoAccount } from './types';

interface AuthStore {
  currentUser: DemoAccount | null;
  isAuthenticated: boolean;
  login: (account: DemoAccount) => void;
  logout: () => void;
  // 已被管理员确认/忽略的新设备 ID 集合（持久化，按 org 隔离）
  acknowledgedDeviceIds: string[];
  acknowledgeDevices: (ids: string[]) => void;
  clearAcknowledged: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (account: DemoAccount) => set({ currentUser: account, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false, acknowledgedDeviceIds: [] }),
      acknowledgedDeviceIds: [],
      acknowledgeDevices: (ids: string[]) =>
        set((state) => ({
          acknowledgedDeviceIds: Array.from(new Set([...state.acknowledgedDeviceIds, ...ids])),
        })),
      clearAcknowledged: () => set({ acknowledgedDeviceIds: [] }),
    }),
    { name: 'smart-mirror-auth' }
  )
);
