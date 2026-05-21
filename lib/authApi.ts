import { api } from './api';
import type { BarberUser, CustomerUser, AdminUser, TenantInfo } from './types';

export interface MeResponseBarber {
  user: BarberUser;
  tenant: TenantInfo;
}

export interface MeResponseCustomer {
  user: CustomerUser;
  tenant?: never;
}

export interface MeResponseAdmin {
  user: AdminUser;
  tenant?: never;
}

export type MeResponse = MeResponseBarber | MeResponseCustomer | MeResponseAdmin;

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
