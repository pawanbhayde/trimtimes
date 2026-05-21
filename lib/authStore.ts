import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AnyUser, TenantInfo } from './types';

interface AuthState {
  accessToken: string | null;
  user: AnyUser;
  tenant: TenantInfo | null;
  setSession: (token: string, user: AnyUser, tenant?: TenantInfo | null) => void;
  clearSession: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      tenant: null,
      setSession: (accessToken, user, tenant = null) =>
        set({ accessToken, user, tenant }),
      clearSession: () => set({ accessToken: null, user: null, tenant: null }),
    }),
    {
      name: 'trimtimes_auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getAccessToken = () => useAuth.getState().accessToken;
export const setAccessToken = (t: string) => useAuth.setState({ accessToken: t });
export const clearSession = () => useAuth.getState().clearSession();
