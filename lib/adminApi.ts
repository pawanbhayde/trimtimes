import axios from 'axios';

const V1_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const ADMIN_BASE = V1_URL.replace(/\/v1$/, '') + '/admin';

const STORAGE_KEY = 'trimtimes_admin_token';

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
};
export const setAdminToken = (token: string) => localStorage.setItem(STORAGE_KEY, token);
export const clearAdminToken = () => localStorage.removeItem(STORAGE_KEY);

const adminApi = axios.create({
  baseURL: ADMIN_BASE,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAdminToken();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface AdminTenant {
  id: string;
  shopName: string;
  subdomain: string;
  schemaName: string;
  ownerName: string | null;
  ownerEmail: string | null;
  phone: string | null;
  status: TenantStatus;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  totalAppointments: number;
  totalRevenue: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const adminLogin = (email: string, password: string) =>
  adminApi
    .post<{ success: true; data: { token: string; admin: { id: string; email: string } } }>('/login', { email, password })
    .then((r) => r.data.data);

export const listAdminTenants = () =>
  adminApi.get<{ success: true; data: AdminTenant[] }>('/tenants').then((r) => r.data.data);

export const createAdminTenant = (payload: { shopName: string; subdomain: string; ownerEmail: string }) =>
  adminApi.post<{ success: true; data: AdminTenant }>('/tenants', payload).then((r) => r.data.data);

export const updateAdminTenantStatus = (id: string, status: TenantStatus) =>
  adminApi.patch<{ success: true; data: AdminTenant }>(`/tenants/${id}`, { status }).then((r) => r.data.data);

export const deleteAdminTenant = (id: string) =>
  adminApi.delete(`/tenants/${id}`);

export const getAdminStats = () =>
  adminApi.get<{ success: true; data: AdminStats }>('/stats').then((r) => r.data.data);
