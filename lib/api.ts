import axios from 'axios';
import { getAccessToken, setAccessToken, clearSession } from './authStore';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from store on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401, then retry original request once
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = api
          .post<{ accessToken: string }>('/auth/refresh')
          .then((r) => r.data.accessToken)
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = getLoginRedirect();
        }
      }
    }

    return Promise.reject(error);
  },
);

function getLoginRedirect() {
  if (typeof window === 'undefined') return '/login';
  const { pathname } = window.location;
  if (pathname.startsWith('/user')) return '/user/login';
  if (pathname.startsWith('/admin')) return '/admin/login';
  return '/login';
}
