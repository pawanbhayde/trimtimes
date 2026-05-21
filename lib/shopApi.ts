import { api } from './api';
import type { ShopListItem, TenantInfo, BarberUser } from './types';

export interface ShopLoginResponse {
  accessToken: string;
  expiresIn: number;
  tenant: TenantInfo;
  user: BarberUser;
}

export interface ShopRegisterPayload {
  shopName: string;
  slug?: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
}

export interface ShopRegisterResponse {
  accessToken: string;
  expiresIn: number;
  tenant: TenantInfo & { createdAt: string };
  user: BarberUser;
}

export async function fetchShops(): Promise<ShopListItem[]> {
  const { data } = await api.get<{ shops: ShopListItem[] }>('/shops');
  return data.shops;
}

export async function shopLogin(
  email: string,
  password: string,
  tenantId: string,
): Promise<ShopLoginResponse> {
  const { data } = await api.post<ShopLoginResponse>('/shops/login', {
    email,
    password,
    tenantId,
  });
  return data;
}

export async function shopRegister(
  payload: ShopRegisterPayload,
): Promise<ShopRegisterResponse> {
  const { data } = await api.post<ShopRegisterResponse>(
    '/shops/register',
    payload,
  );
  return data;
}
