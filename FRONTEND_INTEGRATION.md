
# TrimTimes — Frontend Auth Integration Guide

> Base URL: `http://localhost:4000/api/v1` (dev) · `https://api.trimtimes.com/api/v1` (prod)

---

## 1. Setup

### Install Axios

```bash
npm install axios
```

### `lib/api.ts` — Axios instance with interceptors

```ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,           // sends the httpOnly refresh_token cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();  // from your auth store (see §3)
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401, then retry original request
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
          .finally(() => { refreshPromise = null; });
      }
      try {
        const newToken = await refreshPromise;
        setAccessToken(newToken);                            // update store
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        clearSession();                                      // refresh failed → log out
        window.location.href = determineLoginPage();
      }
    }
    return Promise.reject(error);
  },
);

function determineLoginPage() {
  // redirect to the right login page based on current URL
  if (window.location.pathname.startsWith('/user')) return '/user/login';
  if (window.location.pathname.startsWith('/admin')) return '/admin/login';
  return '/login';
}
```

---

## 2. TypeScript Types

```ts
// lib/types.ts

export interface ShopListItem {
  id: string;       // subdomain slug, e.g. "grand-classic"
  name: string;
  ownerName: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  schemaName: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface BarberUser {
  id: string;
  name: string;
  email: string;
  role: 'barber';
}

export interface CustomerUser {
  id: string;
  userId: string;   // URL slug, e.g. "pawanbhayde721"
  name: string;
  email: string;
  phone: string;
  role: 'customer';
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    field: string | null;
  };
}
```

---

## 3. Auth State (Zustand example)

```ts
// lib/authStore.ts
import { create } from 'zustand';
import type { BarberUser, CustomerUser, AdminUser, TenantInfo } from './types';

type AnyUser = BarberUser | CustomerUser | AdminUser | null;

interface AuthState {
  accessToken: string | null;
  user: AnyUser;
  tenant: TenantInfo | null;
  setSession: (token: string, user: AnyUser, tenant?: TenantInfo) => void;
  clearSession: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  tenant: null,
  setSession: (accessToken, user, tenant = null) => set({ accessToken, user, tenant }),
  clearSession: () => set({ accessToken: null, user: null, tenant: null }),
}));

// Expose helpers for the axios interceptor (outside React)
export const getAccessToken = () => useAuth.getState().accessToken;
export const setAccessToken = (t: string) => useAuth.setState({ accessToken: t });
export const clearSession = () => useAuth.getState().clearSession();
```

---

## 4. API Calls

### 4.1 List Shops (for login `<select>`)

```ts
// lib/shopApi.ts
import { api } from './api';
import type { ShopListItem } from './types';

export async function fetchShops(): Promise<ShopListItem[]> {
  const { data } = await api.get<{ shops: ShopListItem[] }>('/shops');
  return data.shops;
}
```

**Usage in `/login` page:**

```tsx
const [shops, setShops] = useState<ShopListItem[]>([]);

useEffect(() => {
  fetchShops().then(setShops);
}, []);

// ...
<select name="tenantId">
  {shops.map((s) => (
    <option key={s.id} value={s.id}>{s.name}</option>
  ))}
</select>
```

---

### 4.2 Shop Login — `/login`

**Request:**

```ts
// lib/shopApi.ts
import type { BarberUser, TenantInfo } from './types';

interface ShopLoginResponse {
  accessToken: string;
  expiresIn: number;
  tenant: TenantInfo;
  user: BarberUser;
}

export async function shopLogin(email: string, password: string, tenantId: string) {
  const { data } = await api.post<ShopLoginResponse>('/shops/login', {
    email, password, tenantId,
  });
  return data;
}
```

**In your login handler:**

```ts
import { useAuth } from '@/lib/authStore';
import { shopLogin } from '@/lib/shopApi';
import { useRouter } from 'next/navigation';

const { setSession } = useAuth();
const router = useRouter();

async function handleLogin(e: FormEvent) {
  e.preventDefault();
  try {
    const result = await shopLogin(email, password, tenantId);
    setSession(result.accessToken, result.user, result.tenant);
    router.push(`/shop/${result.tenant.id}`);
  } catch (err: any) {
    const code = err.response?.data?.error?.code;
    if (code === 'SHOP_NOT_FOUND') setError('Shop not found.');
    else if (code === 'SHOP_INACTIVE') setError('This shop is not active.');
    else setError('Incorrect email or password.');
  }
}
```

---

### 4.3 Shop Register — `/signup`

```ts
interface ShopRegisterPayload {
  shopName: string;
  slug?: string;          // optional — auto-generated from shopName if omitted
  ownerName: string;
  ownerEmail: string;
  password: string;
}

interface ShopRegisterResponse {
  accessToken: string;
  expiresIn: number;
  tenant: TenantInfo & { createdAt: string };
  user: BarberUser;
}

export async function shopRegister(payload: ShopRegisterPayload) {
  const { data } = await api.post<ShopRegisterResponse>('/shops/register', payload);
  return data;
}
```

**In your signup handler:**

```ts
async function handleSignup(e: FormEvent) {
  e.preventDefault();
  try {
    const result = await shopRegister({ shopName, ownerName, ownerEmail, password });
    setSession(result.accessToken, result.user, result.tenant);
    router.push(`/shop/${result.tenant.id}`);
  } catch (err: any) {
    const { code, field } = err.response?.data?.error ?? {};
    if (code === 'SHOP_EMAIL_EXISTS') setError('This email is already registered.');
    else if (code === 'SHOP_SLUG_EXISTS') setError('This shop URL is taken. Try a different name or add a custom slug.');
    else if (code === 'VALIDATION_ERROR') setFieldError(field, err.response.data.error.message);
    else setError('Something went wrong. Please try again.');
  }
}
```

---

### 4.4 User Login — `/user/login`

```ts
// lib/userApi.ts
import type { CustomerUser } from './types';

interface UserLoginResponse {
  accessToken: string;
  expiresIn: number;
  user: CustomerUser;
}

export async function userLogin(email: string, password: string) {
  const { data } = await api.post<UserLoginResponse>('/users/login', { email, password });
  return data;
}
```

**In your handler:**

```ts
async function handleLogin(e: FormEvent) {
  e.preventDefault();
  try {
    const result = await userLogin(email, password);
    setSession(result.accessToken, result.user);
    router.push(`/user/${result.user.userId}`);
  } catch (err: any) {
    const code = err.response?.data?.error?.code;
    if (code === 'INVALID_CREDENTIALS') setError('Incorrect email or password.');
    else setError('Something went wrong.');
  }
}
```

---

### 4.5 User Register — `/user/signup`

```ts
interface UserRegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface UserRegisterResponse {
  accessToken: string;
  expiresIn: number;
  user: CustomerUser;
}

export async function userRegister(payload: UserRegisterPayload) {
  const { data } = await api.post<UserRegisterResponse>('/users/register', payload);
  return data;
}
```

**In your handler:**

```ts
async function handleSignup(e: FormEvent) {
  e.preventDefault();
  try {
    const result = await userRegister({ fullName, email, phone, password });
    setSession(result.accessToken, result.user);
    router.push(`/user/${result.user.userId}`);
  } catch (err: any) {
    const { code, field, message } = err.response?.data?.error ?? {};
    if (code === 'EMAIL_EXISTS') setError('An account with this email already exists.');
    else if (code === 'VALIDATION_ERROR') setFieldError(field, message);
    else setError('Something went wrong.');
  }
}
```

---

### 4.6 Restore Session on Page Load

Call this in your root layout / `_app.tsx` on first mount:

```ts
// lib/authApi.ts
export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}
```

```tsx
// In root layout or AuthProvider
const { setSession, clearSession } = useAuth();

useEffect(() => {
  fetchMe()
    .then((data) => {
      // data.tenant is present for barbers, absent for customers/admins
      setSession(
        getAccessToken() ?? '',   // already in store from a previous setSession — or re-issue via /auth/refresh
        data.user,
        data.tenant ?? undefined,
      );
    })
    .catch(() => clearSession());
}, []);
```

> **Better pattern**: call `GET /api/v1/auth/me` only when the page loads and there's no token in the store yet. If the access token is expired, the axios interceptor automatically calls `/auth/refresh` using the httpOnly cookie — you get a new token without the user noticing.

---

### 4.7 Logout

```ts
export async function logout() {
  await api.post('/auth/logout');
}
```

**In your logout button:**

```ts
async function handleLogout() {
  await logout().catch(() => null);  // always clear local state even if request fails
  clearSession();
  router.push(role === 'customer' ? '/user/login' : '/login');
}
```

---

## 5. Error Code Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `SHOP_NOT_FOUND` | 404 | tenantId slug doesn't exist |
| `SHOP_INACTIVE` | 403 | Shop account is suspended/inactive |
| `SHOP_EMAIL_EXISTS` | 409 | ownerEmail already registered |
| `SHOP_SLUG_EXISTS` | 409 | slug already taken |
| `EMAIL_EXISTS` | 409 | Customer email already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `VALIDATION_ERROR` | 422 | Missing/invalid field — check `error.field` |
| `TOKEN_EXPIRED` | 401 | Access token expired (interceptor handles this) |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token expired — redirect to login |
| `REFRESH_TOKEN_INVALID` | 401 | Cookie missing/tampered — redirect to login |

All errors have this shape:

```ts
{
  error: {
    code: string;       // one of the codes above
    message: string;    // human-readable, safe to display
    field: string | null; // which field caused VALIDATION_ERROR, or null
  }
}
```

---

## 6. Replacing `localStorage` Calls

Find and replace in your codebase:

| Old (`lib/storage.ts`) | New |
|------------------------|-----|
| `setCurrentUser(user)` | `useAuth.getState().setSession(token, user, tenant?)` |
| `getCurrentUser()` | `useAuth.getState().user` |
| `clearCurrentUser()` | `useAuth.getState().clearSession()` |
| Reading tenant from storage | `useAuth.getState().tenant` |

---

## 7. Route Protection (Next.js Middleware)

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // The refresh_token httpOnly cookie presence is the cheapest indicator
  // of a potentially valid session. The real auth check happens in each
  // page via GET /api/v1/auth/me.
  const hasRefreshToken = req.cookies.has('refresh_token');
  const { pathname } = req.nextUrl;

  const shopDashboard = pathname.startsWith('/shop/');
  const userDashboard = pathname.startsWith('/user/') && !pathname.startsWith('/user/login') && !pathname.startsWith('/user/signup');
  const adminDashboard = pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login');

  if ((shopDashboard || userDashboard || adminDashboard) && !hasRefreshToken) {
    const loginUrl = userDashboard
      ? '/user/login'
      : adminDashboard
        ? '/admin/login'
        : '/login';
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/shop/:path*', '/user/:path*', '/admin/:path*'],
};
```
