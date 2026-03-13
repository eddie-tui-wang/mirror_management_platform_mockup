'use client';

import { create } from 'zustand';
import { activationCodes } from './mock-data';
import type { ActivationCode, ActivationCodeStatus, CodeType } from './types';

function generateCode(type: CodeType): string {
  const prefix = 'AFMR';
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${seg()}-${seg()}`;
}

function nowStr(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function expiresStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

interface CodeStore {
  codes: ActivationCode[];
  revokeCode: (code_id: string) => void;
  bindCode: (code_id: string, device_id: string) => void;
  setNickname: (code_id: string, nickname: string) => void;
  assignToCustomer: (code_id: string, org_id: string) => void;
  createCodeForCustomer: (org_id: string, code_type: CodeType, trial_max_sessions: number | null, created_by_portal: 'platform' | 'channel', channel_org_id: string | null) => void;
  createCodeForChannel: (channel_org_id: string, code_type: CodeType, trial_max_sessions: number | null) => void;
}

export const useCodeStore = create<CodeStore>()((set) => ({
  codes: [...activationCodes],

  revokeCode: (code_id) =>
    set((s) => ({
      codes: s.codes.map((c) =>
        c.code_id === code_id ? { ...c, status: 'Revoked' as ActivationCodeStatus } : c
      ),
    })),

  bindCode: (code_id, device_id) =>
    set((s) => ({
      codes: s.codes.map((c) =>
        c.code_id === code_id
          ? { ...c, status: 'Bound' as ActivationCodeStatus, bound_device_id: device_id, bound_at: nowStr() }
          : c
      ),
    })),

  setNickname: (code_id, nickname) =>
    set((s) => ({
      codes: s.codes.map((c) =>
        c.code_id === code_id ? { ...c, nickname } : c
      ),
    })),

  assignToCustomer: (code_id, org_id) =>
    set((s) => ({
      codes: s.codes.map((c) =>
        c.code_id === code_id ? { ...c, org_id } : c
      ),
    })),

  createCodeForCustomer: (org_id, code_type, trial_max_sessions, created_by_portal, channel_org_id) =>
    set((s) => ({
      codes: [
        ...s.codes,
        {
          code_id: `ac_new_${Date.now()}`,
          code: generateCode(code_type),
          org_id,
          channel_org_id,
          created_by_portal,
          created_at: nowStr(),
          expires_at: expiresStr(),
          status: 'Unused' as ActivationCodeStatus,
          bound_device_id: null,
          bound_at: null,
          nickname: null,
          code_type,
          trial_duration_days: null,
          trial_max_sessions,
          trial_used_sessions: null,
        },
      ],
    })),

  createCodeForChannel: (channel_org_id, code_type, trial_max_sessions) =>
    set((s) => ({
      codes: [
        ...s.codes,
        {
          code_id: `ac_ch_new_${Date.now()}`,
          code: generateCode(code_type),
          org_id: null,
          channel_org_id,
          created_by_portal: 'platform',
          created_at: nowStr(),
          expires_at: expiresStr(),
          status: 'Unused' as ActivationCodeStatus,
          bound_device_id: null,
          bound_at: null,
          nickname: null,
          code_type,
          trial_duration_days: null,
          trial_max_sessions,
          trial_used_sessions: null,
        },
      ],
    })),
}));
